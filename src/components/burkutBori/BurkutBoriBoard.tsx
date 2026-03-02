'use client';

import { useTranslations } from 'next-intl';
import { BurkutBoriGameState, BurkutBoriMove, Player } from '@/game-logic/types';
import { cellToGridPosition } from '@/game-logic/burkutBori/board';
import { EAGLE_MAP, WOLF_MAP, BOARD_SIZE, EXTRA_TURN_VALUE } from '@/game-logic/burkutBori/constants';
import { playerColors } from '@/lib/design-tokens';
import Button from '@/components/ui/Button';
import DiceRoller from './DiceRoller';
import { useState, useMemo, useEffect, useRef } from 'react';

import {
  PADDING, CELL_SIZE, SVG_W, SVG_H,
  STEP_DELAY_MS, EAGLE_WOLF_PAUSE_MS,
  gridToPixel, cellToPixel, computeMovePath,
} from './layout';
import {
  EagleIcon, WolfIcon, HorsemanToken, ConnectionPath,
  Shanyrak, KoshkarMuizBorder, MountainSilhouettes, Stars,
} from './decorations';
import VictoryOverlay from './VictoryOverlay';
import ScoreCards from './ScoreCards';

interface Props {
  gameState: BurkutBoriGameState;
  playerId: string;
  players: Player[];
  onMove: (move: BurkutBoriMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

export default function BurkutBoriBoard({ gameState, playerId, players, onMove, onRestart, isHost }: Props) {
  const t = useTranslations('burkutBori');
  const tCommon = useTranslations('common');
  const [rolling, setRolling] = useState(false);
  const localRollRef = useRef(false);

  // ─── Cell-by-cell animation ───
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const lastMoveKeyRef = useRef('');
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAnimation = () => {
    if (animTimerRef.current !== null) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
  };

  useEffect(() => {
    const move = gameState.lastMove;
    if (!move) return;

    const moveKey = `${move.playerId}-${move.from}-${move.to}-${move.diceValue}`;
    if (moveKey === lastMoveKeyRef.current) return;
    lastMoveKeyRef.current = moveKey;

    const path = computeMovePath(move.from, move.diceValue);
    if (path.length === 0) return;

    cancelAnimation();
    setIsAnimating(true);

    const pid = move.playerId;
    const intermediate = move.intermediatePosition;
    const finalTo = move.to;

    function stepTo(i: number) {
      setDisplayPositions((prev) => ({ ...prev, [pid]: path[i] }));

      if (i < path.length - 1) {
        animTimerRef.current = setTimeout(() => stepTo(i + 1), STEP_DELAY_MS);
      } else {
        if (intermediate !== null && finalTo !== intermediate) {
          animTimerRef.current = setTimeout(() => {
            setDisplayPositions((prev) => ({ ...prev, [pid]: finalTo }));
            animTimerRef.current = setTimeout(() => setIsAnimating(false), 300);
          }, EAGLE_WOLF_PAUSE_MS);
        } else {
          setIsAnimating(false);
          animTimerRef.current = null;
        }
      }
    }

    const wasLocalRoll = localRollRef.current;
    localRollRef.current = false;

    if (wasLocalRoll) {
      setRolling(false);
      stepTo(0);
    } else {
      setRolling(true);
      animTimerRef.current = setTimeout(() => {
        setRolling(false);
        animTimerRef.current = setTimeout(() => stepTo(0), 250);
      }, 300);
    }

    return cancelAnimation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.lastMove]);

  useEffect(() => {
    if (!gameState.lastMove) {
      cancelAnimation();
      setDisplayPositions({});
      setIsAnimating(false);
      setRolling(false);
      lastMoveKeyRef.current = '';
    }
  }, [gameState.lastMove]);

  const pendingMoveKey = gameState.lastMove
    ? `${gameState.lastMove.playerId}-${gameState.lastMove.from}-${gameState.lastMove.to}-${gameState.lastMove.diceValue}`
    : '';
  const hasPendingMove = pendingMoveKey !== '' && pendingMoveKey !== lastMoveKeyRef.current;

  function getDisplayPos(pid: string, realPosition: number): number {
    if (displayPositions[pid] !== undefined) return displayPositions[pid];
    if (hasPendingMove && gameState.lastMove?.playerId === pid) {
      return gameState.lastMove.from;
    }
    return realPosition;
  }

  const currentPlayerTurnId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerTurnId === playerId;
  const currentTurnPlayer = players.find((p) => p.id === currentPlayerTurnId);
  const isExtraTurn = gameState.lastMove?.diceValue === EXTRA_TURN_VALUE && !gameState.winner;

  const winnerPlayer = gameState.winner ? players.find((p) => p.id === gameState.winner) : null;
  const winnerBBPlayer = gameState.winner ? gameState.players.find((p) => p.playerId === gameState.winner) : null;
  const winnerColor = winnerBBPlayer ? playerColors[winnerBBPlayer.playerIndex as keyof typeof playerColors] : null;

  const eagleConnections = useMemo(() =>
    Object.entries(EAGLE_MAP).map(([from, to]) => ({ from: Number(from), to })),
    []
  );
  const wolfConnections = useMemo(() =>
    Object.entries(WOLF_MAP).map(([from, to]) => ({ from: Number(from), to })),
    []
  );

  const playersPerCell = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const p of gameState.players) {
      const pos = getDisplayPos(p.playerId, p.position);
      if (pos > 0) {
        const arr = map.get(pos) ?? [];
        arr.push(p.playerId);
        map.set(pos, arr);
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.players, displayPositions]);

  const handleRoll = () => {
    if (!isMyTurn || rolling || isAnimating) return;
    localRollRef.current = true;
    setRolling(true);
    setTimeout(() => {
      onMove({ type: 'roll' });
    }, 400);
  };

  function getCellFill(cell: number): string {
    if (cell === BOARD_SIZE) return 'rgba(212, 160, 23, 0.15)';
    if (EAGLE_MAP[cell] !== undefined) return 'rgba(212, 160, 23, 0.08)';
    if (WOLF_MAP[cell] !== undefined) return 'rgba(107, 114, 128, 0.08)';
    const { row, col } = cellToGridPosition(cell);
    return (row + col) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4 w-full min-h-[calc(100vh-60px)]">
      {/* Turn indicator */}
      {!gameState.winner && (
        <div className={`
          text-xs sm:text-sm font-medium px-3 py-1 sm:px-4 sm:py-1.5 rounded-full transition-all
          ${isMyTurn
            ? 'bg-turquoise/15 text-turquoise-300 animate-[bb-turn-glow_2s_ease-in-out_infinite]'
            : 'bg-night-600/60 text-night-300'
          }
        `}>
          {isMyTurn ? t('yourTurn') : t('opponentTurn', { name: currentTurnPlayer?.nickname ?? '...' })}
          {isExtraTurn && isMyTurn && (
            <span className="ml-2 inline-block animate-[bb-extra-turn-pop_0.4s_ease-out] text-gold font-semibold">
              {t('extraTurn')}
            </span>
          )}
        </div>
      )}

      {/* Last move notification */}
      {gameState.lastMove && !gameState.winner && (
        <div className="text-xs text-night-400">
          {gameState.lastMove.hitEagle && (
            <span className="text-gold font-medium">
              {t('eagle')} {gameState.lastMove.intermediatePosition} → {gameState.lastMove.to}
            </span>
          )}
          {gameState.lastMove.hitWolf && (
            <span className="text-night-300 font-medium">
              {t('wolf')} {gameState.lastMove.intermediatePosition} → {gameState.lastMove.to}
            </span>
          )}
        </div>
      )}

      {/* Board */}
      <div className="relative w-full max-w-[560px] aspect-square">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full rounded-2xl shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 40px rgba(26,26,46,0.5))' }}
        >
          <defs>
            <radialGradient id="bb-bg" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#1e1e38" />
              <stop offset="100%" stopColor="#0f0f1e" />
            </radialGradient>
            <filter id="bb-token-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
            </filter>
            <filter id="bb-eagle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} rx="16" fill="url(#bb-bg)" />
          <MountainSilhouettes />
          <Stars />

          {/* Decorative border */}
          <rect x="6" y="6" width={SVG_W - 12} height={SVG_H - 12} rx="12"
            fill="none" stroke="#d4a017" strokeWidth="1" opacity="0.15" />
          <KoshkarMuizBorder />

          {/* Eagle connections */}
          {eagleConnections.map(({ from, to }) => (
            <ConnectionPath key={`eagle-${from}`} fromCell={from} toCell={to} color="#d4a017" />
          ))}

          {/* Wolf connections */}
          {wolfConnections.map(({ from, to }) => (
            <ConnectionPath key={`wolf-${from}`} fromCell={from} toCell={to} color="#6b7280" dashed />
          ))}

          {/* Grid cells */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => {
            const cell = i + 1;
            const { row, col } = cellToGridPosition(cell);
            const pos = gridToPixel(row, col);
            const isEagleBase = EAGLE_MAP[cell] !== undefined;
            const isWolfHead = WOLF_MAP[cell] !== undefined;
            const isFinish = cell === BOARD_SIZE;

            return (
              <g key={`cell-${cell}`}>
                <rect
                  x={pos.x - CELL_SIZE / 2 + 1}
                  y={pos.y - CELL_SIZE / 2 + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  rx="4"
                  fill={getCellFill(cell)}
                  stroke={
                    isFinish ? '#d4a01760' :
                    isEagleBase ? '#d4a01730' :
                    isWolfHead ? '#6b728030' :
                    '#ffffff08'
                  }
                  strokeWidth={isFinish ? 1.5 : 0.5}
                />
                <text
                  x={pos.x}
                  y={pos.y + (isEagleBase || isWolfHead || isFinish ? -12 : 1)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                  opacity="0.25"
                >
                  {cell}
                </text>
                {isEagleBase && <EagleIcon x={pos.x} y={pos.y + 5} size={18} />}
                {isWolfHead && <WolfIcon x={pos.x} y={pos.y + 5} size={18} />}
                {isFinish && <Shanyrak cx={pos.x} cy={pos.y} />}
              </g>
            );
          })}

          {/* Eagle destination markers */}
          {Object.values(EAGLE_MAP).map((headCell) => {
            const pos = cellToPixel(headCell);
            return (
              <circle key={`eagle-head-${headCell}`} cx={pos.x} cy={pos.y - 18} r="3"
                fill="#d4a017" opacity="0.4" filter="url(#bb-eagle-glow)" />
            );
          })}

          {/* Wolf destination markers */}
          {Object.values(WOLF_MAP).map((tailCell) => {
            const pos = cellToPixel(tailCell);
            return (
              <circle key={`wolf-tail-${tailCell}`} cx={pos.x} cy={pos.y - 18} r="2.5"
                fill="#6b7280" opacity="0.3" />
            );
          })}

          {/* Player tokens */}
          {gameState.players.map((p) => {
            const displayPos = getDisplayPos(p.playerId, p.position);
            if (displayPos === 0) return null;

            const pos = cellToPixel(displayPos);
            const color = playerColors[p.playerIndex as keyof typeof playerColors];
            const cellPlayers = playersPerCell.get(displayPos) ?? [];
            const stackIdx = cellPlayers.indexOf(p.playerId);
            const offsetX = cellPlayers.length > 1 ? (stackIdx - (cellPlayers.length - 1) / 2) * 12 : 0;
            const offsetY = cellPlayers.length > 1 ? (stackIdx % 2) * -8 : 0;
            const isCurrentTurn = p.playerId === currentPlayerTurnId && !gameState.winner;

            return (
              <g
                key={`token-${p.playerId}`}
                filter="url(#bb-token-shadow)"
                style={{
                  transform: `translate(${pos.x + offsetX}px, ${pos.y + offsetY}px)`,
                  transition: `transform ${STEP_DELAY_MS * 0.8}ms ease-out`,
                }}
              >
                {isCurrentTurn && !isAnimating && (
                  <circle cx={0} cy={0} r={14} fill="none" stroke={color?.bg} strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <HorsemanToken color={color?.bg ?? '#fff'} size={11} />
              </g>
            );
          })}

          {/* Off-board tokens */}
          {gameState.players.map((p) => {
            const displayPos = getDisplayPos(p.playerId, p.position);
            if (displayPos !== 0) return null;
            const color = playerColors[p.playerIndex as keyof typeof playerColors];
            const baseX = 25;
            const baseY = SVG_H - 25 - p.playerIndex * 22;
            return (
              <g key={`offboard-${p.playerId}`}>
                <circle cx={baseX} cy={baseY} r="8" fill={color?.bg} opacity="0.2" />
                <text x={baseX} y={baseY + 1} textAnchor="middle" dominantBaseline="central"
                  fill={color?.bg} fontSize="7" fontWeight="bold" opacity="0.6">
                  {t('start')}
                </text>
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
      <div className="flex flex-col items-center gap-3 w-full max-w-lg">
        {!gameState.winner && (
          <DiceRoller
            value={gameState.lastMove?.diceValue ?? null}
            rolling={rolling}
            canRoll={isMyTurn && !rolling && !isAnimating}
            onRoll={handleRoll}
          />
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
