'use client';

import { useTranslations } from 'next-intl';
import { AzulGameState, AzulTileColor, Player } from '@/game-logic/types';
import { useAzulStore } from '@/store/useAzulStore';
import { tileColors } from '@/lib/design-tokens';
import Button from '@/components/ui/Button';
import FactoryDisplay from './FactoryDisplay';
import PlayerBoard from './PlayerBoard';

interface Props {
  gameState: AzulGameState;
  playerId: string;
  players: Player[];
  onMove: (move: any) => void;
  onRestart: () => void;
  isHost: boolean;
}

/**
 * Registan-inspired decorative header banner.
 */
function RegistanHeader() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 50"
      className="w-full h-[50px]"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="0" y="0" width="600" height="50" fill="#1a1a2e" />
      <line x1="0" y1="2" x2="600" y2="2" stroke="#d4a017" strokeWidth="1" />
      <line x1="0" y1="5" x2="600" y2="5" stroke="#0d9488" strokeWidth="0.4" strokeDasharray="4 3" />
      <line x1="0" y1="45" x2="600" y2="45" stroke="#0d9488" strokeWidth="0.4" strokeDasharray="4 3" />
      <line x1="0" y1="48" x2="600" y2="48" stroke="#d4a017" strokeWidth="1" />

      {Array.from({ length: 12 }).map((_, i) => {
        const cx = i * 50 + 25;
        const cy = 25;
        return (
          <g key={i}>
            <polygon
              points={`${cx - 10},${cy - 4} ${cx - 4},${cy - 10} ${cx + 4},${cy - 10} ${cx + 10},${cy - 4} ${cx + 10},${cy + 4} ${cx + 4},${cy + 10} ${cx - 4},${cy + 10} ${cx - 10},${cy + 4}`}
              fill="none" stroke="#0d9488" strokeWidth="0.8"
            />
            <rect
              x={cx - 4} y={cy - 4} width="8" height="8"
              fill="none" stroke="#d4a017" strokeWidth="0.6"
              transform={`rotate(45 ${cx} ${cy})`}
            />
            <circle cx={cx} cy={cy} r="1.5" fill="#1e40af" />
          </g>
        );
      })}
      {Array.from({ length: 11 }).map((_, i) => {
        const cx = i * 50 + 50;
        const cy = 25;
        return (
          <g key={`c-${i}`}>
            <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#d4a017" strokeWidth="0.8" />
            <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="#d4a017" strokeWidth="0.8" />
          </g>
        );
      })}
      {Array.from({ length: 24 }).map((_, i) => {
        const x = i * 25 + 12.5;
        return (
          <g key={`t-${i}`}>
            <polygon points={`${x},7 ${x - 2.5},12 ${x + 2.5},12`} fill="#1e40af" opacity="0.4" />
            <polygon points={`${x},43 ${x - 2.5},38 ${x + 2.5},38`} fill="#1e40af" opacity="0.4" />
          </g>
        );
      })}
    </svg>
  );
}

/** Glazed tile style for center pool tiles */
function centerTileStyle(color: AzulTileColor) {
  const tc = tileColors[color];
  return {
    background: `linear-gradient(135deg, ${tc.light} 0%, ${tc.bg} 40%, ${tc.dark} 100%)`,
    boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  };
}

export default function AzulBoard({
  gameState,
  playerId,
  players,
  onMove,
  onRestart,
  isHost,
}: Props) {
  const t = useTranslations('azul');
  const tCommon = useTranslations('common');
  const { selectedFactory, selectedColor, setSelectedFactory, setSelectedColor, clearSelection } =
    useAzulStore();

  const currentPlayerTurnId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerTurnId === playerId;
  const currentPlayerName = players.find((p) => p.id === currentPlayerTurnId)?.nickname || '?';

  const handleFactoryClick = (sourceType: 'factory' | 'center', sourceId: number, color: AzulTileColor) => {
    if (!isMyTurn) return;
    setSelectedFactory({ type: sourceType, id: sourceId });
    setSelectedColor(color);
  };

  const handlePatternLineClick = (patternLineIndex: number) => {
    if (!isMyTurn || !selectedFactory || !selectedColor) return;

    onMove({
      type: 'pick',
      sourceType: selectedFactory.type,
      sourceId: selectedFactory.id,
      color: selectedColor,
      patternLineIndex,
    });
    clearSelection();
  };

  const handleFloorLineClick = () => {
    handlePatternLineClick(-1);
  };

  // Get unique colors in center
  const centerColors = [...new Set(gameState.center)];

  return (
    <div className="flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 min-h-[calc(100vh-60px)] text-white">
      <div className="hidden sm:block"><RegistanHeader /></div>

      {/* Status bar */}
      <div className="flex items-center justify-between bg-night-800/60 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-5 sm:py-3 border border-night-600/50">
        <div className="text-xs sm:text-sm font-medium">
          {gameState.gameOver ? (
            gameState.winner ? (
              <span className="text-gold font-bold text-base">
                {t('winner', { name: players.find((p) => p.id === gameState.winner)?.nickname })}
              </span>
            ) : (
              <span className="text-gold font-bold text-base">{t('tie')}</span>
            )
          ) : isMyTurn ? (
            <span className="text-turquoise-300">
              {selectedFactory ? (
                <>
                  {t('selectRow')}
                  <button
                    onClick={clearSelection}
                    className="ml-2 text-xs text-night-300 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    {tCommon('back')}
                  </button>
                </>
              ) : t('selectFactory')}
            </span>
          ) : (
            <span className="text-night-200">{t('opponentTurn', { name: currentPlayerName })}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-night-400 uppercase tracking-wider">
            {t('round', { n: gameState.round })}
          </span>
        </div>
      </div>

      {/* Factories + Center */}
      <div className="relative px-2 py-4">
        {/* Subtle top/bottom decorative lines */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-turquoise/30 to-transparent" />
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-turquoise/30 to-transparent" />

        <div className="flex flex-wrap gap-1.5 sm:gap-3 justify-center items-center">
          {gameState.factories.map((factory) => (
            <FactoryDisplay
              key={factory.id}
              factory={factory}
              selectedFactory={selectedFactory}
              selectedColor={selectedColor}
              isMyTurn={isMyTurn}
              onTileClick={(color) => handleFactoryClick('factory', factory.id, color)}
            />
          ))}

          {/* Center pool */}
          {gameState.center.length > 0 && (
            <div className="relative px-2.5 py-2 sm:px-4 sm:py-3 rounded-2xl bg-night-800/40 border border-night-600/30 min-w-[80px] sm:min-w-[120px]">
              <div className="text-[10px] text-night-400 mb-2 text-center uppercase tracking-widest font-medium">
                {t('center')}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {centerColors.map((color) => {
                  const count = gameState.center.filter((c) => c === color).length;
                  const isSelected =
                    selectedFactory?.type === 'center' && selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => isMyTurn && handleFactoryClick('center', -1, color)}
                      className={`relative w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg transition-all duration-200 ${
                        isMyTurn ? 'hover:scale-110 cursor-pointer' : ''
                      } ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-night scale-110' : ''}`}
                      style={centerTileStyle(color)}
                      disabled={!isMyTurn}
                    >
                      {count > 1 && (
                        <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 text-[8px] sm:text-[10px] bg-white text-night-800 rounded-full w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] flex items-center justify-center font-bold shadow-sm">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* First-player token indicator in center */}
              {gameState.hasFirstPlayerToken && (
                <div className="flex justify-center mt-2">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-gold/60 flex items-center justify-center text-[8px] font-bold text-gold/60">
                    1
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Player boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
        {gameState.playerBoards.map((board) => {
            const player = players.find((p) => p.id === board.playerId);
            const isCurrentTurn = currentPlayerTurnId === board.playerId;
            const isMe = board.playerId === playerId;
            return (
              <PlayerBoard
                key={board.playerId}
                board={board}
                playerName={player?.nickname || '?'}
                isCurrentTurn={isCurrentTurn}
                isMe={isMe}
                hasSelection={isMe && !!selectedColor}
                selectedColor={isMe ? selectedColor : null}
                onPatternLineClick={isMe ? handlePatternLineClick : undefined}
                onFloorLineClick={isMe ? handleFloorLineClick : undefined}
              />
            );
          })}
      </div>

      {/* Game over controls */}
      {gameState.gameOver && isHost && (
        <div className="flex justify-center pt-2">
          <Button onClick={onRestart} variant="secondary" size="lg">
            {tCommon('restart')}
          </Button>
        </div>
      )}
    </div>
  );
}
