'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CareerProfile, PendingDiff } from './career-types';

export type LiveStatus = 'idle' | 'connecting' | 'live' | 'error';

interface UseGeminiLiveOptions {
  profile: CareerProfile;
  voiceName?: string;
  onTranscriptTurn: (role: 'interviewer' | 'candidate', text: string) => void;
  onPartialTranscript?: (role: 'interviewer' | 'candidate', text: string) => void;
  onProposeDiff: (diff: PendingDiff) => void;
}

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export function useGeminiLive({
  profile,
  voiceName = 'Aoede',
  onTranscriptTurn,
  onPartialTranscript,
  onProposeDiff,
}: UseGeminiLiveOptions) {
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const outputTextBufRef = useRef<string>('');
  const inputTextBufRef = useRef<string>('');
  const toolCallPendingRef = useRef<boolean>(false);

  const onTranscriptTurnRef = useRef(onTranscriptTurn);
  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const onProposeDiffRef = useRef(onProposeDiff);
  onTranscriptTurnRef.current = onTranscriptTurn;
  onPartialTranscriptRef.current = onPartialTranscript;
  onProposeDiffRef.current = onProposeDiff;

  const stopAudioPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputCtxRef.current) {
      nextPlayTimeRef.current = outputCtxRef.current.currentTime;
    }
    setAiSpeaking(false);
  }, []);

  const disconnect = useCallback(() => {
    stopAudioPlayback();
    processorRef.current?.disconnect();
    processorRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    inputCtxRef.current?.close().catch(() => {});
    inputCtxRef.current = null;

    outputCtxRef.current?.close().catch(() => {});
    outputCtxRef.current = null;

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'User ended call');
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
    toolCallPendingRef.current = false;
    setStatus('idle');
    setAiSpeaking(false);
    outputTextBufRef.current = '';
    inputTextBufRef.current = '';
  }, [stopAudioPlayback]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  const playPcm24k = useCallback((base64Data: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;

    const pcm16 = base64ToInt16Array(base64Data);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
    setAiSpeaking(true);

    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setAiSpeaking(false);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    setErrorMsg(null);
    setStatus('connecting');
    outputTextBufRef.current = '';
    inputTextBufRef.current = '';

    try {
      const tokenRes = await fetch('/api/ai/live-token', { method: 'POST' });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || 'Could not initialize live voice token.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(
        tokenData.token
      )}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const setupPayload = {
          setup: {
            model: tokenData.model || 'models/gemini-2.5-flash-native-audio-latest',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: {
              parts: [
                {
                  text: `You are a sharp, encouraging hiring manager conducting a live voice "Defend Your Resume" mock interview.
Keep responses conversational, concise (1-3 sentences), and natural for spoken audio.
Start immediately by greeting ${profile.fullName} briefly and asking 1 specific question about a claim or vague bullet on their resume, naming the role and company clearly.
When the candidate answers and reveals concrete numbers, tools, or outcomes not yet clearly written on their resume, call the \`propose_resume_edit\` tool with the exact \`targetId\` and \`parentId\` from their CareerProfile JSON. Never invent metrics they didn't say.

CareerProfile JSON:
${JSON.stringify(profile, null, 2)}`,
                },
              ],
            },
            tools: [
              {
                functionDeclarations: [
                  {
                    name: 'propose_resume_edit',
                    description:
                      'Propose a grounded upgrade to a resume summary or experience bullet based on what the candidate just said.',
                    parameters: {
                      type: 'OBJECT',
                      properties: {
                        targetType: {
                          type: 'STRING',
                          enum: ['summary', 'experience_bullet'],
                        },
                        parentId: { type: 'STRING' },
                        targetId: { type: 'STRING' },
                        originalText: { type: 'STRING' },
                        proposedText: { type: 'STRING' },
                        reason: { type: 'STRING' },
                        sourceEvidence: { type: 'STRING' },
                      },
                      required: [
                        'targetType',
                        'originalText',
                        'proposedText',
                        'reason',
                        'sourceEvidence',
                      ],
                    },
                  },
                ],
              },
            ],
          },
        };
        ws.send(JSON.stringify(setupPayload));
      };

      ws.onmessage = async (event) => {
        const raw = event.data instanceof Blob ? await event.data.text() : String(event.data);
        const msg = JSON.parse(raw);

        if (msg.setupComplete) {
          setStatus('live');

          // Start streaming mic audio
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN || toolCallPendingRef.current) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBuffer = floatTo16BitPCM(inputData);
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  mediaChunks: [
                    {
                      mimeType: 'audio/pcm;rate=16000',
                      data: arrayBufferToBase64(pcmBuffer),
                    },
                  ],
                },
              })
            );
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);

          // Kick off opening question
          ws.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: 'Hello, I am ready for my mock interview.' }],
                  },
                ],
                turnComplete: true,
              },
            })
          );
        }

        const serverContent = msg.serverContent;
        if (serverContent) {
          if (serverContent.interrupted) {
            stopAudioPlayback();
            if (outputTextBufRef.current.trim()) {
              onTranscriptTurnRef.current('interviewer', outputTextBufRef.current.trim());
              outputTextBufRef.current = '';
            }
          }

          if (serverContent.inputTranscription?.text) {
            inputTextBufRef.current += serverContent.inputTranscription.text;
          }
          if (serverContent.outputTranscription?.text) {
            outputTextBufRef.current += serverContent.outputTranscription.text;
            onPartialTranscriptRef.current?.('interviewer', outputTextBufRef.current);
          }

          if (serverContent.modelTurn?.parts) {
            for (const part of serverContent.modelTurn.parts) {
              if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('audio/pcm')) {
                playPcm24k(part.inlineData.data);
              }
            }
          }

          if (serverContent.turnComplete) {
            if (inputTextBufRef.current.trim()) {
              onTranscriptTurnRef.current('candidate', inputTextBufRef.current.trim());
              inputTextBufRef.current = '';
            }
            if (outputTextBufRef.current.trim()) {
              onTranscriptTurnRef.current('interviewer', outputTextBufRef.current.trim());
              outputTextBufRef.current = '';
            }
          }
        }

        if (msg.toolCall?.functionCalls) {
          toolCallPendingRef.current = true;
          const functionResponses = [];
          for (const fc of msg.toolCall.functionCalls) {
            if (fc.name === 'propose_resume_edit' && fc.args) {
              const args = fc.args;
              onProposeDiffRef.current({
                id: `diff-live-${Date.now()}`,
                targetType: args.targetType === 'summary' ? 'summary' : 'experience_bullet',
                parentId: args.parentId,
                targetId: args.targetType === 'summary' ? 'summary' : args.targetId,
                originalText: args.originalText || '',
                proposedText: args.proposedText || '',
                reason: args.reason || '',
                sourceEvidence: args.sourceEvidence || 'Live voice interview',
              });
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: { output: 'Diff proposed to candidate on canvas.' },
              });
            }
          }
          if (functionResponses.length > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ toolResponse: { functionResponses } }));
          }
          toolCallPendingRef.current = false;
        }
      };

      ws.onerror = () => {
        setErrorMsg('Live audio connection interrupted. You can still type below.');
        setStatus('error');
      };

      ws.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1005) {
          setErrorMsg(event.reason || `Live voice disconnected (code ${event.code}).`);
          setStatus('error');
          return;
        }
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start live voice call.');
      setStatus('error');
      disconnect();
    }
  }, [profile, voiceName, disconnect, playPcm24k, stopAudioPlayback]);

  return {
    status,
    errorMsg,
    aiSpeaking,
    connect,
    disconnect,
  };
}
