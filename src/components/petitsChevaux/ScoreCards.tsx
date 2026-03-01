import { useTranslations } from 'next-intl';
import { PetitsChevauxGameState, Player } from '@/game-logic/types';
import { playerColors } from '@/lib/design-tokens';

const miniDotPositions: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[7, 7], [17, 17]],
  3: [[7, 7], [12, 12], [17, 17]],
  4: [[7, 7], [17, 7], [7, 17], [17, 17]],
  5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
  6: [[7, 6], [17, 6], [7, 12], [17, 12], [7, 18], [17, 18]],
};

function MiniDie({ value, color }: { value: number; color: string }) {
  return (
    <div
      className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex-shrink-0 shadow-sm"
      style={{ backgroundColor: color + '20', borderColor: color + '40', borderWidth: 1 }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {miniDotPositions[value]?.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.3" fill="#e5e5e5" />
        ))}
      </svg>
    </div>
  );
}

interface ScoreCardsProps {
  gameState: PetitsChevauxGameState;
  players: Player[];
  currentPlayerTurnId: string;
}

export default function ScoreCards({ gameState, players, currentPlayerTurnId }: ScoreCardsProps) {
  const t = useTranslations('petitsChevaux');

  return (
    <div className={`
      grid w-full gap-1.5 sm:gap-2.5
      ${gameState.players.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}
    `}>
      {gameState.players.map((ps) => {
        const color = playerColors[ps.playerIndex as keyof typeof playerColors];
        const player = players.find((p) => p.id === ps.playerId);
        const isActive = currentPlayerTurnId === ps.playerId && !gameState.winner;

        return (
          <div
            key={ps.playerId}
            className={`
              rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 text-center overflow-hidden
              transition-all duration-300
              ${isActive
                ? 'bg-night-600/90 ring-1 ring-white/20 animate-[pc-score-active_2s_ease-in-out_infinite]'
                : 'bg-night-700/70'
              }
            `}
          >
            <div
              className="h-0.5 -mx-2 sm:-mx-3 -mt-2 sm:-mt-2.5 mb-1.5 sm:mb-2 rounded-t-xl"
              style={{ backgroundColor: color?.bg, opacity: isActive ? 0.8 : 0.3 }}
            />
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <div
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm flex-shrink-0"
                style={{ backgroundColor: color?.bg }}
              />
              <span className="text-white text-[11px] sm:text-xs font-medium truncate">
                {player?.nickname}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
              {gameState.lastRolls[ps.playerId] ? (
                <MiniDie value={gameState.lastRolls[ps.playerId]} color={color?.bg} />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/5 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-night-300">-</span>
                </div>
              )}
              <span className="text-night-200 text-[10px] sm:text-[11px] tabular-nums">
                {t('horsesHome', { count: ps.horsesHome })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
