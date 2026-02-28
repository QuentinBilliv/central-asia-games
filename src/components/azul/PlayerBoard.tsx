'use client';

import { useTranslations } from 'next-intl';
import { AzulPlayerBoard } from '@/game-logic/types';
import { tileColors } from '@/lib/design-tokens';
import { WALL_PATTERN, FLOOR_PENALTIES } from '@/game-logic/azul/constants';

interface Props {
  board: AzulPlayerBoard;
  playerName: string;
  isCurrentTurn: boolean;
  isMe: boolean;
  hasSelection: boolean;
  onPatternLineClick?: (index: number) => void;
  onFloorLineClick?: () => void;
}

export default function PlayerBoard({
  board,
  playerName,
  isCurrentTurn,
  isMe,
  hasSelection,
  onPatternLineClick,
  onFloorLineClick,
}: Props) {
  const t = useTranslations('azul');
  const tCommon = useTranslations('common');

  return (
    <div
      className={`bg-night-700 rounded-xl p-4 border-2 transition-all ${
        isCurrentTurn ? 'border-turquoise shadow-lg' : 'border-night-500'
      }`}
    >
      {/* Player header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-white">
            {playerName}
          </span>
          {isMe && (
            <span className="text-xs text-turquoise">({tCommon('you')})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-night-200">{t('score')}:</span>
          <span className="text-lg font-bold text-gold">{board.score}</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Pattern Lines (left) */}
        <div className="flex flex-col gap-1">
          {board.patternLines.map((line, rowIndex) => (
            <button
              key={rowIndex}
              onClick={() => hasSelection && onPatternLineClick?.(rowIndex)}
              className={`flex gap-0.5 justify-end h-7 items-center px-1 rounded transition-all ${
                hasSelection && onPatternLineClick
                  ? 'hover:bg-night-500 cursor-pointer'
                  : ''
              }`}
              disabled={!hasSelection || !onPatternLineClick}
            >
              {Array.from({ length: line.maxCount }, (_, i) => {
                const filled = i < line.count;
                const tc = line.color ? tileColors[line.color] : null;
                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm border transition-all ${
                      filled
                        ? 'border-transparent'
                        : 'border-night-400 bg-night-600'
                    }`}
                    style={filled && tc ? { backgroundColor: tc.bg } : {}}
                  />
                );
              })}
            </button>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex flex-col justify-center text-night-400 text-xs">→</div>

        {/* Wall (right) */}
        <div className="flex flex-col gap-0.5">
          {WALL_PATTERN.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0.5">
              {row.map((color, colIndex) => {
                const placed = board.wall[rowIndex][colIndex];
                const tc = tileColors[color];
                return (
                  <div
                    key={colIndex}
                    className={`w-6 h-6 rounded-sm border transition-all ${
                      placed
                        ? 'border-transparent shadow-sm'
                        : 'border-night-500'
                    }`}
                    style={{
                      backgroundColor: placed
                        ? tileColors[placed].bg
                        : tc.bg + '20',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floor line */}
      <div className="mt-2">
        <button
          onClick={() => hasSelection && onFloorLineClick?.()}
          className={`flex gap-0.5 items-center px-1 py-1 rounded transition-all ${
            hasSelection && onFloorLineClick
              ? 'hover:bg-night-500 cursor-pointer'
              : ''
          }`}
          disabled={!hasSelection || !onFloorLineClick}
        >
          {FLOOR_PENALTIES.map((penalty, i) => {
            const tile = board.floorLine[i];
            const tc = tile ? tileColors[tile] : null;
            return (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm border text-[8px] flex items-center justify-center ${
                  tile ? 'border-transparent' : 'border-night-500 bg-night-600 text-night-400'
                }`}
                style={tc ? { backgroundColor: tc.bg } : {}}
              >
                {!tile && penalty}
              </div>
            );
          })}
        </button>
      </div>
    </div>
  );
}
