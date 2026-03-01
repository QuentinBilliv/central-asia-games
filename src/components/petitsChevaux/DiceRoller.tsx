'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

interface DiceRollerProps {
  value: number | null;
  rolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
}

const dotPositions: Record<number, [number, number][]> = {
  1: [[25, 25]],
  2: [[14, 14], [36, 36]],
  3: [[14, 14], [25, 25], [36, 36]],
  4: [[14, 14], [36, 14], [14, 36], [36, 36]],
  5: [[14, 14], [36, 14], [25, 25], [14, 36], [36, 36]],
  6: [[14, 12], [36, 12], [14, 25], [36, 25], [14, 38], [36, 38]],
};

export default function DiceRoller({ value, rolling, canRoll, onRoll }: DiceRollerProps) {
  const t = useTranslations('petitsChevaux');
  const [justRevealed, setJustRevealed] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== null && value !== prevValueRef.current && !rolling) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 450);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value, rolling]);

  const animClass = rolling
    ? 'animate-[pc-dice-spin_0.5s_ease-in-out_infinite]'
    : justRevealed
      ? 'animate-[pc-dice-reveal_0.4s_ease-out]'
      : '';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <button
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        aria-label={canRoll ? t('rollDice') : undefined}
        className={`
          group relative w-[72px] h-[72px] rounded-2xl
          transition-all duration-200 outline-none
          ${canRoll
            ? 'cursor-pointer hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold/60'
            : 'cursor-default opacity-55'
          }
        `}
      >
        {/* Glow behind dice when clickable */}
        {canRoll && (
          <div className="absolute inset-[-6px] rounded-3xl bg-gold/15 blur-md group-hover:bg-gold/25 transition-all" />
        )}

        <div
          className={`
            relative w-full h-full rounded-2xl overflow-hidden
            bg-gradient-to-br from-[#faf8f0] via-white to-[#f0ebe0]
            shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]
            border border-gold/40
            ${canRoll ? 'group-hover:shadow-[0_6px_24px_rgba(212,160,23,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]' : ''}
            ${animClass}
          `}
        >
          <svg viewBox="0 0 50 50" className="w-full h-full">
            {/* Subtle inner frame */}
            <rect
              x="4" y="4" width="42" height="42" rx="8"
              fill="none" stroke="#d4a017" strokeWidth="0.6" opacity="0.2"
            />

            {/* Dots */}
            {value && !rolling
              ? dotPositions[value]?.map(([x, y], i) => (
                  <g key={i}>
                    {/* Dot shadow */}
                    <circle cx={x + 0.5} cy={y + 0.5} r="4.2" fill="#000" opacity="0.08" />
                    {/* Main dot */}
                    <circle cx={x} cy={y} r="4" fill="#1a1a2e" />
                    {/* Dot highlight */}
                    <circle cx={x - 1} cy={y - 1} r="1.2" fill="#fff" opacity="0.15" />
                  </g>
                ))
              : !rolling && (
                  <text
                    x="25" y="30"
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="14"
                    fontFamily="serif"
                  >
                    ?
                  </text>
                )}
          </svg>
        </div>
      </button>

      {canRoll && (
        <span className="text-xs text-turquoise-300 font-medium tracking-wide animate-pulse">
          {t('rollDice')}
        </span>
      )}

      {/* Display dice value when not rolling */}
      {value && !rolling && !canRoll && (
        <span className="text-xs text-night-300 font-medium tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
}
