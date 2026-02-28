'use client';

import { useTranslations } from 'next-intl';
import { AzulGameState, AzulTileColor, Player } from '@/game-logic/types';
import { useAzulStore } from '@/store/useAzulStore';
import { tileColors } from '@/lib/design-tokens';
import { WALL_PATTERN } from '@/game-logic/azul/constants';
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
    <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-60px)] text-white">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-night-700/80 rounded-xl px-4 py-3">
        <div className="text-sm">
          {gameState.winner ? (
            <span className="text-gold font-bold">
              {t('winner', { name: players.find((p) => p.id === gameState.winner)?.nickname })}
            </span>
          ) : isMyTurn ? (
            <span className="text-turquoise-300 font-medium">
              {selectedFactory ? t('selectRow') : t('selectFactory')}
            </span>
          ) : (
            <span>{t('opponentTurn', { name: currentPlayerName })}</span>
          )}
        </div>
        <span className="text-xs text-night-300">
          {t('round', { n: gameState.round })}
        </span>
      </div>

      {/* Factories */}
      <div className="flex flex-wrap gap-4 justify-center">
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
          <div className="bg-night-600 rounded-xl p-3 border border-night-400">
            <div className="text-xs text-night-300 mb-2 text-center">{t('center')}</div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px]">
              {centerColors.map((color) => {
                const count = gameState.center.filter((c) => c === color).length;
                const tc = tileColors[color];
                const isSelected =
                  selectedFactory?.type === 'center' && selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => isMyTurn && handleFactoryClick('center', -1, color)}
                    className={`relative w-8 h-8 rounded-md transition-all ${
                      isMyTurn ? 'hover:scale-110 cursor-pointer' : ''
                    } ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: tc.bg }}
                    disabled={!isMyTurn}
                  >
                    {count > 1 && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-white text-night rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Player boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              onPatternLineClick={isMe ? handlePatternLineClick : undefined}
              onFloorLineClick={isMe ? handleFloorLineClick : undefined}
            />
          );
        })}
      </div>

      {/* Game over controls */}
      {gameState.winner && isHost && (
        <div className="flex justify-center">
          <Button onClick={onRestart} variant="secondary" size="lg">
            {tCommon('restart')}
          </Button>
        </div>
      )}
    </div>
  );
}
