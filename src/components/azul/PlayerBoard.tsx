'use client';

import { useTranslations } from 'next-intl';
import { AzulPlayerBoard, AzulTileColor } from '@/game-logic/types';
import { tileColors } from '@/lib/design-tokens';
import { WALL_PATTERN, FLOOR_PENALTIES } from '@/game-logic/azul/constants';
import { getWallColumn } from '@/game-logic/azul/scoring';

interface Props {
  board: AzulPlayerBoard;
  playerName: string;
  isCurrentTurn: boolean;
  isMe: boolean;
  hasSelection: boolean;
  selectedColor: AzulTileColor | null;
  onPatternLineClick?: (index: number) => void;
  onFloorLineClick?: () => void;
}

/** Check if a pattern line can accept the selected color */
function isLineValid(
  board: AzulPlayerBoard,
  rowIndex: number,
  color: AzulTileColor | null
): boolean {
  if (!color) return false;
  const line = board.patternLines[rowIndex];
  // Line already has a different color
  if (line.color !== null && line.color !== color) return false;
  // Line is full
  if (line.count >= line.maxCount) return false;
  // Wall position already filled
  const wallCol = getWallColumn(rowIndex, color);
  if (board.wall[rowIndex][wallCol] !== null) return false;
  return true;
}

/** Glazed tile style — gradient with highlight and shadow for depth */
function tileStyle(color: AzulTileColor) {
  const tc = tileColors[color];
  return {
    background: `linear-gradient(135deg, ${tc.light} 0%, ${tc.bg} 40%, ${tc.dark} 100%)`,
    boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)`,
  };
}

/** Ghost tile style for empty wall positions */
function ghostTileStyle(color: AzulTileColor) {
  const tc = tileColors[color];
  return {
    backgroundColor: tc.bg + '15',
    boxShadow: `inset 0 0 0 1px ${tc.bg}20`,
  };
}

/**
 * Mihrab / pointed arch header shape inspired by Registan madrasa architecture.
 */
function MihrabArch({ isActive }: { isActive: boolean }) {
  const strokeColor = isActive ? '#0d9488' : '#d4a017';
  const fillColor = isActive ? 'rgba(13,148,136,0.08)' : 'rgba(212,160,23,0.04)';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 32"
      className="w-full h-6 mb-1"
      preserveAspectRatio="xMidYMax meet"
    >
      <path
        d="M10 32 L10 14 Q10 2 50 2 L100 0 L150 2 Q190 2 190 14 L190 32"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
      <path
        d="M20 32 L20 16 Q20 7 55 5 L100 4 L145 5 Q180 7 180 16 L180 32"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.4"
        opacity="0.4"
      />
      <rect
        x="97" y="0" width="5" height="5"
        fill={strokeColor}
        transform="rotate(45 99.5 2.5)"
      />
      {[35, 65, 135, 165].map((x, i) => (
        <circle key={i} cx={x} cy={10} r="1.2" fill={strokeColor} opacity="0.5" />
      ))}
    </svg>
  );
}

/**
 * 8-pointed star / arabesque motif on placed wall tiles.
 */
function ArabesqueStar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <rect x="8" y="8" width="12" height="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
      <rect x="8" y="8" width="12" height="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" transform="rotate(45 14 14)" />
      <circle cx="14" cy="14" r="1.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

/**
 * Mosaic-style decorative border.
 */
function MosaicBorderLine() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 6"
      className="w-full h-1.5"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="3" x2="200" y2="3" stroke="#0d9488" strokeWidth="0.5" opacity="0.3" />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect
          key={i}
          x={i * 10 + 3} y="1" width="4" height="4"
          fill="none" stroke="#d4a017" strokeWidth="0.5"
          transform={`rotate(45 ${i * 10 + 5} 3)`}
          opacity="0.5"
        />
      ))}
    </svg>
  );
}

export default function PlayerBoard({
  board,
  playerName,
  isCurrentTurn,
  isMe,
  hasSelection,
  selectedColor,
  onPatternLineClick,
  onFloorLineClick,
}: Props) {
  const t = useTranslations('azul');
  const tCommon = useTranslations('common');

  // Calculate total floor penalty for display
  const floorCount = board.floorLine.length + (board.hasFirstPlayerTokenPenalty ? 1 : 0);
  const totalPenalty = FLOOR_PENALTIES.slice(0, Math.min(floorCount, FLOOR_PENALTIES.length))
    .reduce((sum, p) => sum + p, 0);

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all duration-300 ${
        isCurrentTurn
          ? 'border-turquoise bg-night-700'
          : 'border-night-600 bg-night-700/80'
      }`}
      style={isCurrentTurn ? {
        animation: 'azul-turn-glow 2.5s ease-in-out infinite',
      } : undefined}
    >
      {/* Mihrab arch header */}
      <MihrabArch isActive={isCurrentTurn} />

      {/* Player header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-white text-lg leading-tight">
            {playerName}
          </span>
          {isMe && (
            <span className="text-[10px] uppercase tracking-wider text-turquoise/80 font-medium">
              {tCommon('you')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-night-800/60 rounded-lg px-3 py-1.5">
          <span className="text-xs text-night-300 uppercase tracking-wider">{t('score')}</span>
          <span className="text-xl font-bold text-gold tabular-nums">{board.score}</span>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        {/* Pattern Lines (left) */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <MosaicBorderLine />

          {board.patternLines.map((line, rowIndex) => {
            const valid = hasSelection && isLineValid(board, rowIndex, selectedColor);
            const invalid = hasSelection && !valid;

            return (
              <button
                key={rowIndex}
                onClick={() => valid && onPatternLineClick?.(rowIndex)}
                className={`flex gap-1 justify-end items-center py-0.5 rounded-md transition-all duration-200 ${
                  valid
                    ? 'cursor-pointer hover:brightness-110'
                    : invalid
                    ? 'opacity-35 cursor-not-allowed'
                    : ''
                }`}
                disabled={!valid || !onPatternLineClick}
              >
                {Array.from({ length: line.maxCount }, (_, i) => {
                  const filled = i < line.count;
                  const isEmpty = !filled;
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded transition-all duration-200 ${
                        filled
                          ? ''
                          : valid
                          ? 'border-2 border-turquoise/50 bg-turquoise/10'
                          : 'border border-night-400/40 bg-night-600/80'
                      }`}
                      style={{
                        ...(filled && line.color ? tileStyle(line.color) : {}),
                        ...(isEmpty && valid ? { animation: 'azul-valid-pulse 1.5s ease-in-out infinite' } : {}),
                      }}
                    />
                  );
                })}
              </button>
            );
          })}

          <MosaicBorderLine />
        </div>

        {/* Arrow separator */}
        <div className="flex flex-col justify-center self-stretch text-night-400 px-1">
          <svg viewBox="0 0 16 160" className="w-3 h-full" aria-hidden="true">
            {[0, 1, 2, 3, 4].map(i => (
              <g key={i} transform={`translate(8, ${16 + i * 32})`}>
                <line x1="-3" y1="-4" x2="3" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <line x1="-3" y1="4" x2="3" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              </g>
            ))}
          </svg>
        </div>

        {/* Wall (right) */}
        <div className="flex flex-col gap-1">
          {WALL_PATTERN.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((color, colIndex) => {
                const placed = board.wall[rowIndex][colIndex];
                return (
                  <div
                    key={colIndex}
                    className={`relative w-8 h-8 rounded transition-all duration-200 ${
                      placed ? 'shadow-md' : ''
                    }`}
                    style={placed ? tileStyle(placed) : ghostTileStyle(color)}
                  >
                    {placed && <ArabesqueStar />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floor line */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => hasSelection && onFloorLineClick?.()}
          className={`flex gap-1 items-center px-2 py-1.5 rounded-lg transition-all duration-200 ${
            hasSelection && onFloorLineClick
              ? 'cursor-pointer bg-turquoise/5 hover:bg-turquoise/10'
              : ''
          }`}
          style={hasSelection && onFloorLineClick ? { animation: 'azul-valid-pulse 1.5s ease-in-out infinite' } : undefined}
          disabled={!hasSelection || !onFloorLineClick}
        >
          {/* First-player token */}
          {board.hasFirstPlayerTokenPenalty && (
            <div
              className="w-6 h-6 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-[9px] font-bold text-gold flex-shrink-0"
              title={t('firstPlayer')}
            >
              1
            </div>
          )}
          {FLOOR_PENALTIES.map((penalty, i) => {
            const tile = board.floorLine[i];
            return (
              <div
                key={i}
                className={`w-6 h-6 rounded text-[9px] font-medium flex items-center justify-center transition-all duration-200 ${
                  tile ? '' : 'border border-dashed border-night-400/50 text-night-300/50'
                }`}
                style={tile ? {
                  ...tileStyle(tile),
                  clipPath: 'polygon(8% 0%, 95% 5%, 100% 88%, 3% 100%)',
                } : undefined}
              >
                {!tile && penalty}
              </div>
            );
          })}
        </button>

        {/* Penalty sum badge */}
        {floorCount > 0 && (
          <span className="text-xs font-medium text-red-400/80 bg-red-400/10 px-2 py-0.5 rounded-full">
            {totalPenalty}
          </span>
        )}
      </div>
    </div>
  );
}
