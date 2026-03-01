'use client';

import { useTranslations } from 'next-intl';
import { PetitsChevauxGameState, Player, PetitsChevauxMove } from '@/game-logic/types';
import { getValidMoves } from '@/game-logic/petitsChevaux/moves';
import { playerColors } from '@/lib/design-tokens';
import { START_POSITIONS, BOARD_SIZE, HOME_STRETCH_LENGTH } from '@/game-logic/petitsChevaux/constants';
import Button from '@/components/ui/Button';
import DiceRoller from './DiceRoller';
import { useState } from 'react';

import { BOARD_CX, BOARD_CY, TRACK_RADIUS, getBoardPosition, getStablePosition, getHomePosition, STABLE_CORNERS } from './layout';
import {
  BoardDefs, KoshkarMuizCorner, OrnamentalBorder,
  Shanyrak, YurtStable, HorseHead, StartHorseIcon,
} from './decorations';
import VictoryOverlay from './VictoryOverlay';
import ScoreCards from './ScoreCards';

interface Props {
  gameState: PetitsChevauxGameState;
  playerId: string;
  players: Player[];
  onMove: (move: PetitsChevauxMove) => void;
  onRestart: () => void;
  isHost: boolean;
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
  const currentPlayerColor = playerColors[
    (players.find((p) => p.id === currentPlayerTurnId)?.index ?? 0) as keyof typeof playerColors
  ];

  const validMoveHorses = isMyTurn ? getValidMoves(gameState, playerId) : [];

  const winnerPlayer = gameState.winner ? players.find((p) => p.id === gameState.winner) : null;
  const winnerColor = winnerPlayer
    ? playerColors[winnerPlayer.index as keyof typeof playerColors]
    : null;

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

  const allHorses = gameState.players.flatMap((ps) => ps.horses);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4 min-h-[calc(100vh-60px)]">
      {/* Status bar */}
      <div
        className={`
          flex items-center justify-between w-full max-w-lg
          rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white
          bg-night-800/90 backdrop-blur-md border border-white/[0.06]
          shadow-[0_2px_16px_rgba(0,0,0,0.3)]
          ${isMyTurn && !gameState.winner ? 'animate-[pc-turn-glow_2.5s_ease-in-out_infinite]' : ''}
        `}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: currentPlayerColor?.bg }}
          />
          {gameState.winner ? (
            <span className="text-gold font-bold font-serif">
              {t('winner', { name: winnerPlayer?.nickname })}
            </span>
          ) : isMyTurn ? (
            <span className="text-turquoise-300 font-medium">{t('yourTurn')}</span>
          ) : (
            <span className="text-night-100">{t('opponentTurn', { name: currentPlayerName })}</span>
          )}
        </div>
        {gameState.extraTurn && isMyTurn && !gameState.winner && (
          <span
            className="text-[10px] sm:text-[11px] bg-gold/20 text-gold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-semibold tracking-wide"
            style={{ animation: 'pc-extra-turn-pop 0.4s ease-out' }}
          >
            {t('extraTurn')}
          </span>
        )}
      </div>

      {/* Board */}
      <div className="relative w-full max-w-[min(100%,512px)] aspect-square select-none">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <BoardDefs />

          {/* Background */}
          <rect x="0" y="0" width="500" height="500" rx="20" fill="url(#board-bg)" />
          <rect x="0" y="0" width="500" height="500" rx="20" fill="url(#felt-texture)" />

          {/* Border frame */}
          <rect x="10" y="10" width="480" height="480" rx="15"
            fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.25" />
          <rect x="14" y="14" width="472" height="472" rx="13"
            fill="none" stroke="#d4a017" strokeWidth="0.5" opacity="0.15" />
          <OrnamentalBorder />

          {/* Corner ornaments */}
          <KoshkarMuizCorner x={40} y={40} rotation={0} />
          <KoshkarMuizCorner x={460} y={40} rotation={90} />
          <KoshkarMuizCorner x={460} y={460} rotation={180} />
          <KoshkarMuizCorner x={40} y={460} rotation={270} />

          {/* Track */}
          <circle cx={BOARD_CX} cy={BOARD_CY} r={TRACK_RADIUS}
            fill="none" stroke="#d4a017" strokeWidth="6" opacity="0.04" />
          <circle cx={BOARD_CX} cy={BOARD_CY} r={TRACK_RADIUS}
            fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.2"
            strokeDasharray="6 4" />

          {/* Home stretch connector lines */}
          {gameState.players.map((ps) => {
            const outerPos = getHomePosition(ps.playerIndex, 0);
            const innerPos = getHomePosition(ps.playerIndex, HOME_STRETCH_LENGTH - 1);
            const color = playerColors[ps.playerIndex as keyof typeof playerColors];
            return (
              <line
                key={`home-line-${ps.playerIndex}`}
                x1={outerPos.x} y1={outerPos.y}
                x2={innerPos.x} y2={innerPos.y}
                stroke={color?.bg} strokeWidth="3"
                opacity="0.12" strokeLinecap="round"
              />
            );
          })}

          {/* Board cells */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => {
            const pos = getBoardPosition(i);
            const isStart = Object.values(START_POSITIONS).includes(i);
            const startPlayerIdx = Object.entries(START_POSITIONS).find(([, v]) => v === i)?.[0];
            const pColor = startPlayerIdx !== undefined
              ? playerColors[parseInt(startPlayerIdx) as keyof typeof playerColors]
              : null;

            return (
              <g key={`cell-${i}`}>
                {isStart && pColor && (
                  <circle cx={pos.x} cy={pos.y} r={18} fill={pColor.bg} opacity="0.08" />
                )}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isStart ? 13 : 11}
                  fill={isStart && pColor ? pColor.bg + '30' : '#ffffff08'}
                  stroke={isStart && pColor ? pColor.bg + 'aa' : '#c8956c30'}
                  strokeWidth={isStart ? 2 : 0.8}
                />
                <circle
                  cx={pos.x} cy={pos.y - 1}
                  r={isStart ? 8 : 6}
                  fill="#ffffff" opacity="0.03"
                />
                {isStart && pColor && (
                  <StartHorseIcon x={pos.x} y={pos.y + 1} color={pColor.bg} />
                )}
              </g>
            );
          })}

          {/* Home stretch cells */}
          {gameState.players.map((ps) =>
            Array.from({ length: HOME_STRETCH_LENGTH }, (_, i) => {
              const pos = getHomePosition(ps.playerIndex, i);
              const color = playerColors[ps.playerIndex as keyof typeof playerColors];
              const isLast = i === HOME_STRETCH_LENGTH - 1;
              return (
                <g key={`home-${ps.playerIndex}-${i}`}>
                  {isLast && (
                    <circle cx={pos.x} cy={pos.y} r={15} fill={color?.bg} opacity="0.06" />
                  )}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isLast ? 11 : 9}
                    fill={color?.bg + '25'}
                    stroke={color?.bg + (isLast ? 'cc' : '80')}
                    strokeWidth={isLast ? 2 : 1.2}
                  />
                </g>
              );
            })
          )}

          {/* Center Shanyrak */}
          <Shanyrak cx={BOARD_CX} cy={BOARD_CY} />

          {/* Stable areas */}
          {gameState.players.map((ps) => {
            const color = playerColors[ps.playerIndex as keyof typeof playerColors];
            const base = STABLE_CORNERS[ps.playerIndex];
            return (
              <YurtStable
                key={`stable-${ps.playerIndex}`}
                cx={base.x} cy={base.y}
                color={color?.bg}
                playerIndex={ps.playerIndex}
              />
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
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={() => myHorse && handleHorseClick(horse.id)}
                className={canMove ? 'cursor-pointer' : ''}
                filter="url(#horse-shadow)"
              >
                {canMove && (
                  <g filter="url(#valid-glow)">
                    <circle cx={0} cy={0} r={15} fill="none" stroke="#fff" strokeWidth="2">
                      <animate attributeName="r" values="13;17;13" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.25;0.7" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
                <HorseHead fillColor={color?.bg} size={canMove ? 11 : 10} />
              </g>
            );
          })}
        </svg>

        {/* Victory overlay */}
        {gameState.winner && winnerPlayer && winnerColor && (
          <VictoryOverlay winnerName={winnerPlayer.nickname} winnerColor={winnerColor.bg} />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[min(100%,512px)]">
        {!gameState.winner && (
          <DiceRoller
            value={gameState.diceValue}
            rolling={rolling}
            canRoll={isMyTurn && gameState.mustRoll}
            onRoll={handleRoll}
          />
        )}

        {isMyTurn && !gameState.mustRoll && validMoveHorses.length === 0 && !gameState.winner && (
          <p className="text-xs sm:text-sm text-night-300 italic">{t('noMoves')}</p>
        )}

        <ScoreCards
          gameState={gameState}
          players={players}
          currentPlayerTurnId={currentPlayerTurnId}
        />

        {gameState.winner && isHost && (
          <Button onClick={onRestart} variant="secondary" size="lg" className="w-full mt-2">
            {tCommon('restart')}
          </Button>
        )}
      </div>
    </div>
  );
}
