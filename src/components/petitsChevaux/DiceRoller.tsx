'use client';

import { useTranslations } from 'next-intl';

interface DiceRollerProps {
  value: number | null;
  rolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
}

const dotPositions: Record<number, [number, number][]> = {
  1: [[25, 25]],
  2: [[12, 12], [38, 38]],
  3: [[12, 12], [25, 25], [38, 38]],
  4: [[12, 12], [38, 12], [12, 38], [38, 38]],
  5: [[12, 12], [38, 12], [25, 25], [12, 38], [38, 38]],
  6: [[12, 10], [38, 10], [12, 25], [38, 25], [12, 40], [38, 40]],
};

export default function DiceRoller({ value, rolling, canRoll, onRoll }: DiceRollerProps) {
  const t = useTranslations('petitsChevaux');

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        className={`w-16 h-16 rounded-xl bg-white shadow-lg border-2 transition-all duration-200 ${
          canRoll
            ? 'border-gold hover:shadow-xl hover:scale-105 cursor-pointer active:scale-95'
            : 'border-night-200 opacity-70 cursor-default'
        } ${rolling ? 'animate-bounce' : ''}`}
      >
        <svg viewBox="0 0 50 50" className="w-full h-full">
          {value && !rolling
            ? dotPositions[value]?.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4.5" fill="#1a1a2e" />
              ))
            : !rolling && (
                <text x="25" y="30" textAnchor="middle" fill="#999" fontSize="12">
                  ?
                </text>
              )}
        </svg>
      </button>
      {canRoll && (
        <span className="text-xs text-turquoise-300 font-medium">{t('rollDice')}</span>
      )}
    </div>
  );
}
