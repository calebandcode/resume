import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
      },
    });

    return NextResponse.json({
      token: token.name,
      model: 'models/gemini-2.5-flash-native-audio-latest',
    });
  } catch (err) {
    console.error('Failed to create Gemini Live ephemeral token:', err);
    return NextResponse.json(
      { error: 'Could not start live voice session. Falling back to turn-based mode.' },
      { status: 500 }
    );
  }
}
