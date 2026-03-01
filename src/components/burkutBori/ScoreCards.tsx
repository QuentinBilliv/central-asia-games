import { useTranslations } from 'next-intl';
import { BurkutBoriGameState, Player } from '@/game-logic/types';
import { playerColors } from '@/lib/design-tokens';

function MiniDie({ value, color }: { value: number; color?: string }) {
  const dots: Record<number, [number, number][]> = {
    1: [[7, 7]],
    2: [[4, 4], [10, 10]],
    3: [[4, 4], [7, 7], [10, 10]],
    4: [[4, 4], [10, 4], [4, 10], [10, 10]],
    5: [[4, 4], [10, 4], [7, 7], [4, 10], [10, 10]],
    6: [[4, 3.5], [10, 3.5], [4, 7], [10, 7], [4, 10.5], [10, 10.5]],
  };
  return (
    <svg width="22" height="22" viewBox="0 0 14 14" className="shrink-0">
      <rect width="14" height="14" rx="2.5" fill="#fff" opacity="0.12" />
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="none"
        stroke={color ?? '#d4a017'} strokeWidth="0.5" opacity="0.5" />
      {dots[value]?.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill="#fff" opacity="0.8" />
      ))}
    </svg>
  );
}

interface ScoreCardsProps {
  gameState: BurkutBoriGameState;
  players: Player[];
  currentPlayerTurnId: string;
}

export default function ScoreCards({ gameState, players, currentPlayerTurnId }: ScoreCardsProps) {
  const t = useTranslations('burkutBori');

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2.5 w-full">
      {gameState.players.map((p) => {
        const color = playerColors[p.playerIndex as keyof typeof playerColors];
        const player = players.find((pl) => pl.id === p.playerId);
        const isActive = currentPlayerTurnId === p.playerId && !gameState.winner;

        return (
          <div
            key={p.playerId}
            className={`
              flex-1 rounded-xl px-3 py-2.5 text-center text-sm overflow-hidden
              transition-all duration-300
              ${isActive
                ? 'bg-night-600/90 ring-1 ring-white/20 animate-[bb-turn-glow_2s_ease-in-out_infinite]'
                : 'bg-night-700/70'
              }
            `}
          >
            <div
              className="h-0.5 -mx-3 -mt-2.5 mb-2 rounded-t-xl"
              style={{ backgroundColor: color?.bg, opacity: isActive ? 0.8 : 0.3 }}
            />
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: color?.bg }}
              />
              <span className="text-white text-xs font-medium truncate">
                {player?.nickname}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              {gameState.lastMove?.playerId === p.playerId ? (
                <MiniDie value={gameState.lastMove.diceValue} color={color?.bg} />
              ) : (
                <div className="w-7 h-7 rounded-md bg-white/5 border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[10px] text-night-300">-</span>
                </div>
              )}
              <span className="text-night-200 text-[10px] sm:text-[11px] tabular-nums">
                {t('position')}: {p.position === 0 ? t('offBoard') : p.position}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
