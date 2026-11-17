'use client';

import { Sparkles, Square } from 'lucide-react';

interface AiOrbProps {
  size?: 'sm' | 'md';
  recording?: boolean;
  loading?: boolean;
  onClick?: () => void;
  title?: string;
}

export function AiOrb({
  size = 'md',
  recording = false,
  loading = false,
  onClick,
  title = 'Speak or ask AI',
}: AiOrbProps) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={`relative shrink-0 rounded-full p-[2px] transition-transform active:scale-95 cursor-pointer ${dims} ${
        recording ? 'ai-orb ai-orb-recording' : 'ai-orb'
      } ${loading ? 'opacity-75 cursor-wait' : ''}`}
    >
      <span className="w-full h-full rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
        {recording ? (
          <Square className="w-3 h-3 fill-white text-white" />
        ) : (
          <Sparkles className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} drop-shadow`} />
        )}
      </span>
    </button>
  );
}

