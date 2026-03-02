'use client';

import { MemoryCard as MemoryCardType } from '@/game-logic/types';

interface MemoryCardProps {
  card: MemoryCardType;
  gridSize: number;
  onClick: () => void;
  disabled: boolean;
  forceHidden?: boolean;
}

export default function MemoryCard({ card, gridSize, onClick, disabled, forceHidden }: MemoryCardProps) {
  const isRevealed = (card.flipped || card.matched) && !forceHidden;

  // Responsive sizing based on grid columns
  const sizeClass =
    gridSize <= 4
      ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-2xl sm:text-3xl md:text-4xl'
      : gridSize <= 6
        ? 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-xl sm:text-2xl md:text-3xl'
        : 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-lg sm:text-xl md:text-2xl';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRevealed}
      className={`perspective-500 ${sizeClass} cursor-pointer`}
      aria-label={isRevealed ? card.symbol : 'Hidden card'}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isRevealed ? 'rotate-y-180' : ''
        }`}
      >
        {/* Back face (hidden state) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-lapis to-turquoise border-2 border-white/20 shadow-md flex items-center justify-center">
          <div className="w-3/5 h-3/5 border-2 border-white/30 rounded-lg rotate-45" />
        </div>

        {/* Front face (revealed state) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 shadow-md flex items-center justify-center ${
            card.matched
              ? 'bg-gradient-to-br from-gold/20 to-turquoise/20 border-gold'
              : 'bg-white/90 border-white/40'
          }`}
          style={card.matched ? { animation: 'memory-match-pop 0.4s ease-out' } : undefined}
        >
          <span className="select-none">{card.symbol}</span>
        </div>
      </div>
    </button>
  );
}
