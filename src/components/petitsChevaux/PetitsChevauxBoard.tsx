'use client';

import { useTranslations } from 'next-intl';
import { PetitsChevauxGameState, Player, PetitsChevauxMove } from '@/game-logic/types';
import { getValidMoves } from '@/game-logic/petitsChevaux/moves';
import { playerColors } from '@/lib/design-tokens';
import { START_POSITIONS, BOARD_SIZE, HOME_STRETCH_LENGTH } from '@/game-logic/petitsChevaux/constants';
import Button from '@/components/ui/Button';
import DiceRoller from './DiceRoller';
import { useState } from 'react';

interface Props {
  gameState: PetitsChevauxGameState;
  playerId: string;
  players: Player[];
  onMove: (move: PetitsChevauxMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

// Board layout: a cross shape
// Calculate SVG positions for the 40 board cells
function getBoardPosition(index: number): { x: number; y: number } {
  const size = 500;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 190;

  // Positions arranged in a circle
  const angle = (index / BOARD_SIZE) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function getStablePosition(playerIndex: number, horseId: number): { x: number; y: number } {
  const corners = [
    { x: 80, y: 80 },   // Blue - top-left
    { x: 420, y: 80 },  // Red - top-right
    { x: 420, y: 420 }, // Green - bottom-right
    { x: 80, y: 420 },  // Yellow - bottom-left
  ];
  const base = corners[playerIndex];
  const offsets = [
    { x: -20, y: -20 },
    { x: 20, y: -20 },
    { x: -20, y: 20 },
    { x: 20, y: 20 },
  ];
  return {
    x: base.x + offsets[horseId].x,
    y: base.y + offsets[horseId].y,
  };
}

function getHomePosition(playerIndex: number, homePos: number): { x: number; y: number } {
  const cx = 250;
  const cy = 250;
  // Home stretches go toward center
  const directions = [
    { dx: 0, dy: 1 },   // Player 0: from top
    { dx: -1, dy: 0 },  // Player 1: from right
    { dx: 0, dy: -1 },  // Player 2: from bottom
    { dx: 1, dy: 0 },   // Player 3: from left
  ];
  const startDist = 140;
  const step = 30;
  const dir = directions[playerIndex];
  return {
    x: cx + dir.dx * (startDist - homePos * step),
    y: cy + dir.dy * (startDist - homePos * step),
  };
}

export default function PetitsChevauxBoard({
  gameState,
  playerId,
  players,
  onMove,
  onRestart,
  isHost,
}: Props) {
  const t = useTranslations('petitsChevaux');
  const tCommon = useTranslations('common');
  const [rolling, setRolling] = useState(false);

  const currentPlayerTurnId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerTurnId === playerId;
  const currentPlayerName = players.find((p) => p.id === currentPlayerTurnId)?.nickname || '?';

  const validMoveHorses = isMyTurn ? getValidMoves(gameState, playerId) : [];

  const handleRoll = () => {
    if (!isMyTurn || !gameState.mustRoll) return;
    setRolling(true);
    setTimeout(() => {
      onMove({ type: 'roll' });
      setRolling(false);
    }, 600);
  };

  const handleHorseClick = (horseId: number) => {
    if (!isMyTurn || gameState.mustRoll) return;
    if (!validMoveHorses.includes(horseId)) return;
    onMove({ type: 'moveHorse', horseId });
  };

  // Collect all horses for rendering
  const allHorses = gameState.players.flatMap((ps) => ps.horses);

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[calc(100vh-60px)]">
      {/* Status bar */}
      <div className="flex items-center justify-between w-full max-w-lg bg-night-700/80 rounded-xl px-4 py-3 text-white">
        <div className="text-sm">
          {gameState.winner ? (
            <span className="text-gold font-bold">
              {t('winner', { name: players.find((p) => p.id === gameState.winner)?.nickname })}
            </span>
          ) : isMyTurn ? (
            <span className="text-turquoise-300 font-medium">{t('yourTurn')}</span>
          ) : (
            <span>{t('opponentTurn', { name: currentPlayerName })}</span>
          )}
        </div>
        {gameState.extraTurn && isMyTurn && !gameState.winner && (
          <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">{t('extraTurn')}</span>
        )}
      </div>

      {/* Board */}
      <div className="relative w-full max-w-lg aspect-square">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          {/* Background */}
          <rect x="0" y="0" width="500" height="500" rx="20" fill="#1a1a2e" />

          {/* Decorative border */}
          <rect x="10" y="10" width="480" height="480" rx="15" fill="none" stroke="#d4a017" strokeWidth="1.5" opacity="0.3" />

          {/* Board cells (circle layout) */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => {
            const pos = getBoardPosition(i);
            const isStart = Object.values(START_POSITIONS).includes(i);
            const startPlayerIndex = Object.entries(START_POSITIONS).find(([, v]) => v === i)?.[0];

            return (
              <g key={`cell-${i}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill={isStart && startPlayerIndex !== undefined
                    ? playerColors[parseInt(startPlayerIndex) as keyof typeof playerColors]?.bg + '40'
                    : '#ffffff15'}
                  stroke={isStart && startPlayerIndex !== undefined
                    ? playerColors[parseInt(startPlayerIndex) as keyof typeof playerColors]?.bg
                    : '#ffffff30'}
                  strokeWidth={isStart ? 2 : 1}
                />
              </g>
            );
          })}

          {/* Home stretch cells */}
          {gameState.players.map((ps) =>
            Array.from({ length: HOME_STRETCH_LENGTH }, (_, i) => {
              const pos = getHomePosition(ps.playerIndex, i);
              const color = playerColors[ps.playerIndex as keyof typeof playerColors];
              return (
                <circle
                  key={`home-${ps.playerIndex}-${i}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={10}
                  fill={color?.bg + '30'}
                  stroke={color?.bg}
                  strokeWidth={1.5}
                />
              );
            })
          )}

          {/* Center finish */}
          <circle cx="250" cy="250" r="25" fill="#d4a01730" stroke="#d4a017" strokeWidth="2" />
          <text x="250" y="254" textAnchor="middle" fill="#d4a017" fontSize="10" fontWeight="bold">
            ★
          </text>

          {/* Stable areas */}
          {gameState.players.map((ps) => {
            const color = playerColors[ps.playerIndex as keyof typeof playerColors];
            const corners = [
              { x: 80, y: 80 },
              { x: 420, y: 80 },
              { x: 420, y: 420 },
              { x: 80, y: 420 },
            ];
            const base = corners[ps.playerIndex];
            return (
              <g key={`stable-${ps.playerIndex}`}>
                <rect
                  x={base.x - 35}
                  y={base.y - 35}
                  width="70"
                  height="70"
                  rx="10"
                  fill={color?.bg + '15'}
                  stroke={color?.bg + '40'}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Horses */}
          {allHorses.map((horse) => {
            const color = playerColors[horse.playerIndex as keyof typeof playerColors];
            let pos: { x: number; y: number };

            if (horse.status === 'stable') {
              pos = getStablePosition(horse.playerIndex, horse.id);
            } else if (horse.status === 'home') {
              pos = getHomePosition(horse.playerIndex, horse.homePosition);
            } else {
              pos = getBoardPosition(horse.boardPosition);
            }

            const myHorse = gameState.players.find(
              (p) => p.playerId === playerId
            )?.playerIndex === horse.playerIndex;
            const canMove = validMoveHorses.includes(horse.id) && myHorse;

            return (
              <g
                key={`horse-${horse.playerIndex}-${horse.id}`}
                onClick={() => myHorse && handleHorseClick(horse.id)}
                className={canMove ? 'cursor-pointer' : ''}
              >
                {/* Highlight ring for valid moves */}
                {canMove && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={16}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="14;18;14"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.3;0.8"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Horse pawn */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={9}
                  fill={color?.bg}
                  stroke="#fff"
                  strokeWidth="2"
                  className={`transition-all duration-500 ${canMove ? 'drop-shadow-lg' : ''}`}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {horse.id + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-lg">
        {/* Dice */}
        {!gameState.winner && (
          <DiceRoller
            value={gameState.diceValue}
            rolling={rolling}
            canRoll={isMyTurn && gameState.mustRoll}
            onRoll={handleRoll}
          />
        )}

        {/* No valid moves message */}
        {isMyTurn && !gameState.mustRoll && validMoveHorses.length === 0 && !gameState.winner && (
          <p className="text-sm text-night-300">{t('noMoves')}</p>
        )}

        {/* Player scores */}
        <div className="flex gap-3 w-full">
          {gameState.players.map((ps) => {
            const color = playerColors[ps.playerIndex as keyof typeof playerColors];
            const player = players.find((p) => p.id === ps.playerId);
            return (
              <div
                key={ps.playerId}
                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm ${
                  currentPlayerTurnId === ps.playerId
                    ? 'ring-2 ring-white bg-night-600'
                    : 'bg-night-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color?.bg }}
                  />
                  <span className="text-white text-xs font-medium truncate">
                    {player?.nickname}
                  </span>
                </div>
                <span className="text-night-200 text-xs">
                  {t('horsesHome', { count: ps.horsesHome })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Game over */}
        {gameState.winner && isHost && (
          <Button onClick={onRestart} variant="secondary" size="lg" className="w-full mt-2">
            {tCommon('restart')}
          </Button>
        )}
      </div>
    </div>
  );
}
