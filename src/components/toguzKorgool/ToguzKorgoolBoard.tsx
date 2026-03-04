'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ToguzKorgoolGameState, ToguzKorgoolMove, Player } from '@/game-logic/types';
import { STONES_TO_WIN } from '@/game-logic/toguzKorgool/constants';
import { playerColors } from '@/lib/design-tokens';
import Button from '@/components/ui/Button';

interface Props {
  gameState: ToguzKorgoolGameState;
  playerId: string;
  players: Player[];
  onMove: (move: ToguzKorgoolMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

// Stone positions inside a pit (relative %, pre-computed for up to 20+ stones)
function getStonePositions(count: number, seed: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const displayCount = Math.min(count, 18);
  for (let i = 0; i < displayCount; i++) {
    // Deterministic pseudo-random placement based on seed + index
    const hash = ((seed * 31 + i * 17) % 97) / 97;
    const hash2 = ((seed * 13 + i * 43) % 89) / 89;
    const angle = hash * Math.PI * 2;
    const radius = hash2 * 0.32;
    positions.push({
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
    });
  }
  return positions;
}

export default function ToguzKorgoolBoard({ gameState, playerId, players, onMove, onRestart, isHost }: Props) {
  const t = useTranslations('toguzKorgool');
  const tCommon = useTranslations('common');

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerId === playerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isGameOver = gameState.winner != null || gameState.isDraw;

  const myPlayerIndex = gameState.turnOrder.indexOf(playerId);
  const meIdx = myPlayerIndex >= 0 ? myPlayerIndex : 0;
  const oppIdx = 1 - meIdx;

  const me = gameState.players[meIdx];
  const opponent = gameState.players[oppIdx];

  const mePlayer = players.find((p) => p.id === me?.playerId);
  const oppPlayer = players.find((p) => p.id === opponent?.playerId);

  const handleSow = (pitIndex: number) => {
    if (!isMyTurn || isGameOver) return;
    if (me.pits[pitIndex] === 0) return;
    onMove({ type: 'sow', pitIndex });
  };

  // Victory/draw screen
  if (isGameOver) {
    const winnerPlayer = gameState.winner ? players.find((p) => p.id === gameState.winner) : null;
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
        <div className="flex gap-6 justify-center">
          {gameState.players.map((ps) => {
            const p = players.find((pl) => pl.id === ps.playerId);
            const colorSet = playerColors[(p?.index ?? 0) as keyof typeof playerColors];
            return (
              <div
                key={ps.playerId}
                className="rounded-xl px-6 py-4 text-center min-w-[140px]"
                style={{ backgroundColor: colorSet.bg, border: `2px solid ${colorSet.light}` }}
              >
                <div className="text-sm font-medium" style={{ color: colorSet.light }}>
                  {p?.nickname ?? '?'}
                  {ps.playerId === playerId && ` (${tCommon('you')})`}
                </div>
                <div className="text-3xl font-bold text-white mt-1">{ps.kazan}</div>
                <div className="text-xs text-white/60">{t('stones')}</div>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-serif font-bold text-gold mb-2">
            {gameState.isDraw ? t('draw') : t('winner', { name: winnerPlayer?.nickname ?? '?' })}
          </div>
        </div>
        {isHost && (
          <Button onClick={onRestart} size="lg" className="mt-2">
            {tCommon('restart')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-5 w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Turn indicator */}
      <div
        className="px-5 py-2 rounded-full text-sm font-medium text-white transition-all"
        style={isMyTurn
          ? { backgroundColor: 'rgba(13,148,136,0.35)', boxShadow: '0 0 20px rgba(13,148,136,0.2)' }
          : { backgroundColor: 'rgba(255,255,255,0.08)' }
        }
      >
        {isMyTurn ? t('yourTurn') : t('opponentTurn', { name: currentPlayer?.nickname ?? '?' })}
      </div>

      {/* Wooden board */}
      <div className="relative w-full max-w-2xl">
        {/* Oval board shape */}
        <div
          className="relative mx-auto rounded-[50%] px-3 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10"
          style={{
            background: 'radial-gradient(ellipse at 40% 35%, #c8913a 0%, #a0722a 30%, #7a5520 60%, #5c3d15 100%)',
            boxShadow: `
              inset 0 2px 8px rgba(255,220,150,0.3),
              inset 0 -3px 8px rgba(0,0,0,0.4),
              0 4px 20px rgba(0,0,0,0.5),
              0 8px 40px rgba(0,0,0,0.3)
            `,
            aspectRatio: '2 / 1.05',
          }}
        >
          {/* Carved border ring */}
          <div
            className="absolute inset-2 sm:inset-3 rounded-[50%] pointer-events-none"
            style={{
              border: '2px solid rgba(200,160,80,0.3)',
              boxShadow: 'inset 0 1px 3px rgba(255,220,150,0.15), inset 0 -1px 3px rgba(0,0,0,0.2)',
            }}
          />

          {/* Ornamental engravings (subtle swirl patterns) */}
          <div className="absolute inset-0 rounded-[50%] overflow-hidden pointer-events-none opacity-[0.07]">
            <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
              <pattern id="swirl" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 Q30 10 20 20 Q10 30 20 40" fill="none" stroke="white" strokeWidth="0.8" />
                <path d="M0 20 Q10 10 20 20 Q30 10 40 20" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
              <rect width="400" height="200" fill="url(#swirl)" />
            </svg>
          </div>

          {/* Board content */}
          <div className="relative flex flex-col justify-between h-full">
            {/* Opponent row (top) — reversed */}
            <div className="flex justify-center items-end gap-[2px] sm:gap-1 md:gap-2">
              {[...Array(9)].map((_, i) => {
                const pitIdx = 8 - i;
                const isTuz = me.tuz === pitIdx;
                return (
                  <WoodenPit
                    key={`opp-${pitIdx}`}
                    stones={opponent.pits[pitIdx]}
                    label={pitIdx + 1}
                    isTuz={isTuz}
                    tuzOwnerColor={isTuz ? playerColors[(mePlayer?.index ?? 0) as keyof typeof playerColors].bg : undefined}
                    isClickable={false}
                    isTop
                    seed={pitIdx + 100}
                    onClick={() => {}}
                  />
                );
              })}
            </div>

            {/* Center divider — Kazans */}
            <div className="flex items-center justify-between px-2 sm:px-6 md:px-10 -my-1">
              {/* Opponent Kazan (left) */}
              <KazanPit
                name={oppPlayer?.nickname ?? '?'}
                stones={opponent.kazan}
                isYou={opponent.playerId === playerId}
                youLabel={tCommon('you')}
                colorIndex={(oppPlayer?.index ?? 1) as keyof typeof playerColors}
              />

              {/* Center decorative line */}
              <div className="flex-1 mx-2 sm:mx-4">
                <div className="h-px" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(200,160,80,0.4) 20%, rgba(200,160,80,0.5) 50%, rgba(200,160,80,0.4) 80%, transparent)',
                }} />
              </div>

              {/* My Kazan (right) */}
              <KazanPit
                name={mePlayer?.nickname ?? '?'}
                stones={me.kazan}
                isYou={me.playerId === playerId}
                youLabel={tCommon('you')}
                colorIndex={(mePlayer?.index ?? 0) as keyof typeof playerColors}
              />
            </div>

            {/* My row (bottom) — left to right */}
            <div className="flex justify-center items-start gap-[2px] sm:gap-1 md:gap-2">
              {[...Array(9)].map((_, pitIdx) => {
                const isTuz = opponent.tuz === pitIdx;
                const canClick = isMyTurn && me.pits[pitIdx] > 0;
                return (
                  <WoodenPit
                    key={`me-${pitIdx}`}
                    stones={me.pits[pitIdx]}
                    label={pitIdx + 1}
                    isTuz={isTuz}
                    tuzOwnerColor={isTuz ? playerColors[(oppPlayer?.index ?? 1) as keyof typeof playerColors].bg : undefined}
                    isClickable={canClick}
                    isTop={false}
                    seed={pitIdx}
                    onClick={() => handleSow(pitIdx)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Score progress */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-[11px] text-white/40 mb-1 px-1">
          <span>{oppPlayer?.nickname ?? '?'}: {opponent.kazan}</span>
          <span className="text-gold/50">{STONES_TO_WIN} {t('stones')}</span>
          <span>{mePlayer?.nickname ?? '?'}: {me.kazan}</span>
        </div>
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min((opponent.kazan / STONES_TO_WIN) * 50, 50)}%`,
              backgroundColor: playerColors[(oppPlayer?.index ?? 1) as keyof typeof playerColors].bg,
            }}
          />
          <div
            className="absolute right-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min((me.kazan / STONES_TO_WIN) * 50, 50)}%`,
              backgroundColor: playerColors[(mePlayer?.index ?? 0) as keyof typeof playerColors].bg,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Wooden Pit (bowl-shaped indentation with stones) ---

function WoodenPit({
  stones,
  label,
  isTuz,
  tuzOwnerColor,
  isClickable,
  isTop,
  seed,
  onClick,
}: {
  stones: number;
  label: number;
  isTuz: boolean;
  tuzOwnerColor?: string;
  isClickable: boolean;
  isTop: boolean;
  seed: number;
  onClick: () => void;
}) {
  const stonePositions = useMemo(() => getStonePositions(stones, seed), [stones, seed]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Pit number label */}
      {isTop && (
        <span className="text-[8px] sm:text-[9px] font-medium text-amber-200/40 mb-0.5">{label}</span>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        className={`
          relative
          w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11
          rounded-full
          transition-all duration-200
          ${isClickable
            ? 'cursor-pointer hover:scale-110 active:scale-95'
            : 'cursor-default'
          }
        `}
        style={{
          background: isTuz
            ? `radial-gradient(ellipse at 45% 40%, rgba(212,160,23,0.3) 0%, rgba(92,61,21,0.9) 60%, rgba(60,35,10,1) 100%)`
            : `radial-gradient(ellipse at 45% 40%, #8a6320 0%, #5c3d15 60%, #3c230a 100%)`,
          boxShadow: isClickable
            ? `inset 0 2px 6px rgba(0,0,0,0.6), inset 0 -1px 3px rgba(200,160,80,0.2), 0 0 8px rgba(13,148,136,0.3)`
            : `inset 0 2px 6px rgba(0,0,0,0.6), inset 0 -1px 3px rgba(200,160,80,0.15)`,
          border: isTuz
            ? `2px solid ${tuzOwnerColor ?? '#d4a017'}88`
            : isClickable
              ? '1.5px solid rgba(13,148,136,0.4)'
              : '1px solid rgba(120,90,40,0.3)',
        }}
      >
        {/* Stones inside pit */}
        {stonePositions.map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: stones > 12 ? '18%' : stones > 6 ? '20%' : '24%',
              height: stones > 12 ? '18%' : stones > 6 ? '20%' : '24%',
              left: `${pos.x * 70 + 15}%`,
              top: `${pos.y * 70 + 15}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(ellipse at 35% 30%, #8a7560, #4a3828, #2a1a10)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 0.5px 1px rgba(200,180,150,0.3)',
            }}
          />
        ))}

        {/* Stone count overlay */}
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm pointer-events-none"
          style={{
            color: stones === 0 ? 'rgba(200,160,80,0.15)' : 'rgba(255,240,200,0.9)',
            textShadow: stones > 0 ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
          }}
        >
          {stones}
        </span>

        {/* Tuz marker */}
        {isTuz && (
          <div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-amber-900/60"
            style={{
              backgroundColor: tuzOwnerColor,
              boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          />
        )}
      </button>

      {/* Pit number label */}
      {!isTop && (
        <span className="text-[8px] sm:text-[9px] font-medium text-amber-200/40 mt-0.5">{label}</span>
      )}
    </div>
  );
}

// --- Kazan (scoring pit in center) ---

function KazanPit({
  name,
  stones,
  isYou,
  youLabel,
  colorIndex,
}: {
  name: string;
  stones: number;
  isYou: boolean;
  youLabel: string;
  colorIndex: keyof typeof playerColors;
}) {
  const colorSet = playerColors[colorIndex];

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-12 h-8 sm:w-16 sm:h-10 md:w-20 md:h-12 rounded-[50%] flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse at 45% 40%, ${colorSet.bg}40 0%, #5c3d15 50%, #3c230a 100%)`,
          boxShadow: `inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -1px 3px rgba(200,160,80,0.15), 0 0 6px ${colorSet.bg}30`,
          border: `1.5px solid ${colorSet.bg}50`,
        }}
      >
        <span
          className="text-base sm:text-lg md:text-xl font-bold"
          style={{ color: colorSet.light, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        >
          {stones}
        </span>
      </div>
      <span className="text-[8px] sm:text-[10px] mt-0.5" style={{ color: `${colorSet.light}99` }}>
        {name}{isYou ? ` (${youLabel})` : ''}
      </span>
    </div>
  );
}
