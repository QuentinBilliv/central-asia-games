'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { BackgammonGameState, BackgammonMove, Player } from '@/game-logic/types';
import { getValidMovesForDie } from '@/game-logic/backgammon/moves';
import { BAR } from '@/game-logic/backgammon/constants';

interface Props {
  gameState: BackgammonGameState;
  playerId: string;
  players: Player[];
  onMove: (move: BackgammonMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

const PLAYER_COLORS = ['#d4a017', '#1e40af'] as const;
const CHECKER_SIZE = 28; // sm:28, matches w-7 h-7

// --- Dice face with dots ---
function DieFace({ value, used, rolling }: { value: number; used: boolean; rolling: boolean }) {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  };

  return (
    <div
      className={`w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg shadow-lg relative transition-opacity duration-300 ${
        used ? 'opacity-25' : ''
      }`}
      style={rolling ? {
        animation: 'bg-dice-roll 0.7s cubic-bezier(0.22, 1, 0.36, 1), bg-dice-bounce 0.4s ease-out 0.7s',
      } : undefined}
    >
      {dotPositions[value]?.map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-night"
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </div>
  );
}

// --- Checker stack (static, no animation here) ---
function CheckerStack({
  count,
  playerIndex,
  isBar,
  isSelected,
}: {
  count: number;
  playerIndex: number;
  isBar?: boolean;
  isSelected?: boolean;
}) {
  if (count === 0) return null;
  const color = PLAYER_COLORS[playerIndex];
  const display = Math.min(count, 5);

  return (
    <div className={`flex flex-col items-center ${isBar ? 'gap-0.5' : 'gap-0'}`}>
      {Array.from({ length: display }).map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 shadow-md flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-200 ${
            isSelected && i === display - 1
              ? 'border-yellow-400 scale-110 ring-2 ring-yellow-400/50'
              : 'border-white/30'
          }`}
          style={{
            backgroundColor: color,
            marginTop: i > 0 ? '-4px' : '0',
          }}
        >
          {i === display - 1 && count > 1 ? count : ''}
        </div>
      ))}
    </div>
  );
}

// --- Floating animated checker ---
interface FlyingChecker {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  playerIndex: number;
  key: number;
}

export default function BackgammonBoard({ gameState, playerId, players, onMove, onRestart, isHost }: Props) {
  const t = useTranslations('backgammon');
  const [selectedFrom, setSelectedFrom] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [flyingChecker, setFlyingChecker] = useState<FlyingChecker | null>(null);
  const prevStateRef = useRef<BackgammonGameState | null>(null);
  const animKeyRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const pointRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const barRef = useRef<HTMLDivElement>(null);

  const myPlayerIndex = gameState.turnOrder.indexOf(playerId);
  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerId === playerId;
  const currentPlayerName = players.find((p) => p.id === currentPlayerId)?.nickname || '?';

  // Register point DOM refs
  const setPointRef = useCallback((pointIndex: number, el: HTMLDivElement | null) => {
    if (el) pointRefs.current.set(pointIndex, el);
    else pointRefs.current.delete(pointIndex);
  }, []);

  // Get center position of a point element relative to the board
  const getPointCenter = useCallback((pointIndex: number): { x: number; y: number } | null => {
    const board = boardRef.current;
    if (!board) return null;

    let el: HTMLDivElement | null | undefined;
    if (pointIndex === BAR) {
      el = barRef.current;
    } else {
      el = pointRefs.current.get(pointIndex);
    }
    if (!el) return null;

    const boardRect = board.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.left + elRect.width / 2 - boardRect.left,
      y: elRect.top + elRect.height / 2 - boardRect.top,
    };
  }, []);

  // Detect state changes for animations
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = gameState;

    if (!prev) return;

    // Dice roll animation
    if (prev.mustRoll && !gameState.mustRoll && gameState.dice) {
      setDiceRolling(true);
      const timer = setTimeout(() => setDiceRolling(false), 1100);
      return () => clearTimeout(timer);
    }

    // Move animation: detect which points changed
    if (!prev.mustRoll && prev.remainingMoves.length > gameState.remainingMoves.length) {
      const pi = prev.currentPlayerIndex;
      let fromPt = -1;
      let toPt = -1;

      if (prev.bar[pi] > gameState.bar[pi]) fromPt = BAR;

      for (let i = 0; i < 24; i++) {
        const diff = gameState.points[i] - prev.points[i];
        if (pi === 0) {
          if (diff < 0 && fromPt === -1) fromPt = i;
          if (diff > 0) toPt = i;
        } else {
          if (diff > 0 && fromPt === -1) fromPt = i;
          if (diff < 0) toPt = i;
        }
      }

      if (gameState.borneOff[pi] > prev.borneOff[pi]) toPt = 25;

      if (fromPt !== -1 && toPt !== -1) {
        const fromPos = getPointCenter(fromPt);
        // For bear off (25), fly to edge of board
        let toPos = toPt === 25 ? null : getPointCenter(toPt);
        if (toPt === 25 && boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect();
          toPos = { x: pi === 0 ? 20 : rect.width - 20, y: rect.height / 2 };
        }

        if (fromPos && toPos) {
          animKeyRef.current++;
          setFlyingChecker({
            fromX: fromPos.x,
            fromY: fromPos.y,
            toX: toPos.x,
            toY: toPos.y,
            playerIndex: pi,
            key: animKeyRef.current,
          });
          const timer = setTimeout(() => setFlyingChecker(null), 450);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState, getPointCenter]);

  // Clear selection on turn change
  useEffect(() => {
    setSelectedFrom(null);
  }, [gameState.currentPlayerIndex]);

  // Dice used tracking for doubles
  const diceUsedCount = useMemo(() => {
    if (!gameState.dice) return [0, 0];
    const d1 = gameState.dice[0];
    const d2 = gameState.dice[1];
    if (d1 === d2) {
      const used = 4 - gameState.remainingMoves.length;
      return [Math.min(used, 2), Math.max(used - 2, 0)];
    }
    return [
      gameState.remainingMoves.includes(d1) ? 0 : 1,
      gameState.remainingMoves.includes(d2) ? 0 : 1,
    ];
  }, [gameState.dice, gameState.remainingMoves]);

  const validDestinations = useMemo(() => {
    if (selectedFrom === null || !isMyTurn || gameState.mustRoll) return [];
    const dests: number[] = [];
    for (const die of gameState.remainingMoves) {
      const moves = getValidMovesForDie(gameState, gameState.currentPlayerIndex, die);
      for (const m of moves) {
        if (m.from === selectedFrom && !dests.includes(m.to)) dests.push(m.to);
      }
    }
    return dests;
  }, [selectedFrom, isMyTurn, gameState]);

  const validSources = useMemo(() => {
    if (!isMyTurn || gameState.mustRoll) return [];
    const sources: number[] = [];
    for (const die of gameState.remainingMoves) {
      const moves = getValidMovesForDie(gameState, gameState.currentPlayerIndex, die);
      for (const m of moves) {
        if (!sources.includes(m.from)) sources.push(m.from);
      }
    }
    return sources;
  }, [isMyTurn, gameState]);

  const handlePointClick = useCallback((pointIndex: number) => {
    if (!isMyTurn || gameState.mustRoll) return;
    if (selectedFrom === null) {
      if (validSources.includes(pointIndex)) setSelectedFrom(pointIndex);
    } else if (selectedFrom === pointIndex) {
      setSelectedFrom(null);
    } else if (validDestinations.includes(pointIndex)) {
      onMove({ type: 'move', from: selectedFrom, to: pointIndex });
      setSelectedFrom(null);
    } else if (validSources.includes(pointIndex)) {
      setSelectedFrom(pointIndex);
    } else {
      setSelectedFrom(null);
    }
  }, [isMyTurn, gameState.mustRoll, selectedFrom, validSources, validDestinations, onMove]);

  const handleBarClick = useCallback(() => {
    if (!isMyTurn || gameState.mustRoll) return;
    if (gameState.bar[gameState.currentPlayerIndex] > 0) setSelectedFrom(BAR);
  }, [isMyTurn, gameState]);

  const handleBearOff = useCallback(() => {
    if (!isMyTurn || selectedFrom === null) return;
    if (validDestinations.includes(25)) {
      onMove({ type: 'move', from: selectedFrom, to: 25 });
      setSelectedFrom(null);
    }
  }, [isMyTurn, selectedFrom, validDestinations, onMove]);

  // Render a point
  const renderPoint = (pointIndex: number, isTop: boolean) => {
    const val = gameState.points[pointIndex];
    const playerIdx = val > 0 ? 0 : val < 0 ? 1 : -1;
    const count = Math.abs(val);
    const isSelected = selectedFrom === pointIndex;
    const isValidSource = validSources.includes(pointIndex);
    const isValidDest = validDestinations.includes(pointIndex);
    const isEven = pointIndex % 2 === 0;

    return (
      <div
        key={pointIndex}
        ref={(el) => setPointRef(pointIndex, el)}
        className={`flex-1 flex flex-col items-center cursor-pointer relative min-w-0 ${
          isTop ? 'justify-start' : 'justify-end'
        } ${isSelected || isValidDest ? 'z-10' : ''}`}
        onClick={() => handlePointClick(pointIndex)}
      >
        {/* Triangle */}
        <div
          className={`w-full ${isTop ? 'h-24 sm:h-32' : 'h-24 sm:h-32'} relative`}
          style={{
            clipPath: isTop
              ? 'polygon(50% 100%, 0% 0%, 100% 0%)'
              : 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-200 ${
              isEven ? 'bg-terracotta/70' : 'bg-turquoise/70'
            } ${isSelected ? 'bg-yellow-400/40' : ''} ${
              isValidSource && !isSelected ? 'opacity-100' : !isValidSource && !isValidDest ? 'opacity-60' : ''
            } ${isValidDest ? 'bg-green-500/40' : ''}`}
          />
        </div>

        {/* Checkers */}
        <div className={`absolute ${isTop ? 'top-1' : 'bottom-1'} flex flex-col items-center`}>
          {count > 0 && (
            <CheckerStack count={count} playerIndex={playerIdx} isSelected={isSelected} />
          )}
        </div>

        {/* Valid destination indicator */}
        {isValidDest && (
          <div className={`absolute ${isTop ? 'top-0.5' : 'bottom-0.5'} z-20 pointer-events-none`}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-dashed border-green-400 animate-pulse flex items-center justify-center bg-green-400/20">
              {count > 0 && playerIdx !== gameState.currentPlayerIndex && (
                <span className="text-green-400 text-xs font-bold">✕</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Board layout
  const topPoints = Array.from({ length: 12 }, (_, i) => 12 + i);
  const bottomPoints = Array.from({ length: 12 }, (_, i) => 11 - i);
  const flipBoard = myPlayerIndex === 1;
  const topRow = flipBoard ? [...topPoints].reverse() : topPoints;
  const bottomRow = flipBoard ? [...bottomPoints].reverse() : bottomPoints;
  const isDoubles = gameState.dice && gameState.dice[0] === gameState.dice[1];

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-2xl mx-auto px-2">
      {/* Status bar */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white/30"
            style={{ backgroundColor: PLAYER_COLORS[gameState.currentPlayerIndex] }}
          />
          <span className="text-sm sm:text-base font-medium text-white">
            {gameState.winner
              ? t('winner', { name: players.find((p) => p.id === gameState.winner)?.nickname || '?' })
              : isMyTurn
                ? t('yourTurn')
                : t('opponentTurn', { name: currentPlayerName })}
          </span>
        </div>

        {/* Dice */}
        {gameState.dice && (
          <div className="flex items-center gap-1.5">
            <DieFace value={gameState.dice[0]} used={diceUsedCount[0] > 0} rolling={diceRolling} />
            <DieFace value={gameState.dice[1]} used={diceUsedCount[1] > 0} rolling={diceRolling} />
            {isDoubles && (
              <span className="text-[10px] sm:text-xs text-yellow-400 font-bold ml-1">
                ×{gameState.remainingMoves.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Borne off */}
      <div className="w-full flex justify-between px-2 text-xs sm:text-sm text-white/60">
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAYER_COLORS[0] }} />
          {gameState.borneOff[0]}/15
        </span>
        <span className="flex items-center gap-1.5">
          {gameState.borneOff[1]}/15
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAYER_COLORS[1] }} />
        </span>
      </div>

      {/* Board wrapper — relative for flying checker overlay */}
      <div ref={boardRef} className="w-full bg-[#2a1810] rounded-xl border-4 border-[#5c3a1e] shadow-2xl overflow-hidden relative">
        {/* Flying checker animation overlay */}
        {flyingChecker && (
          <div
            key={flyingChecker.key}
            className="absolute z-50 pointer-events-none rounded-full border-2 border-white/50 shadow-xl"
            style={{
              width: CHECKER_SIZE,
              height: CHECKER_SIZE,
              backgroundColor: PLAYER_COLORS[flyingChecker.playerIndex],
              left: flyingChecker.fromX - CHECKER_SIZE / 2,
              top: flyingChecker.fromY - CHECKER_SIZE / 2,
              animation: `bg-fly-checker 0.4s ease-in-out forwards`,
              '--fly-tx': `${flyingChecker.toX - flyingChecker.fromX}px`,
              '--fly-ty': `${flyingChecker.toY - flyingChecker.fromY}px`,
              boxShadow: `0 0 12px ${PLAYER_COLORS[flyingChecker.playerIndex]}80, 0 4px 12px rgba(0,0,0,0.4)`,
            } as React.CSSProperties}
          />
        )}

        {/* Top row */}
        <div className="flex px-1 pt-1 gap-px">
          <div className="flex flex-1 gap-px">
            {topRow.slice(0, 6).map((pi) => renderPoint(pi, true))}
          </div>
          {/* Bar (top) */}
          <div
            ref={barRef}
            className={`w-8 sm:w-10 flex flex-col items-center justify-start pt-2 bg-[#3d2415] cursor-pointer ${
              selectedFrom === BAR ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={handleBarClick}
          >
            {gameState.bar[flipBoard ? 0 : 1] > 0 && (
              <CheckerStack
                count={gameState.bar[flipBoard ? 0 : 1]}
                playerIndex={flipBoard ? 0 : 1}
                isBar
                isSelected={selectedFrom === BAR}
              />
            )}
          </div>
          <div className="flex flex-1 gap-px">
            {topRow.slice(6, 12).map((pi) => renderPoint(pi, true))}
          </div>
        </div>

        {/* Middle divider */}
        <div className="h-4 sm:h-6 bg-[#3d2415] flex items-center justify-center">
          <div className="w-3/4 h-px bg-[#5c3a1e]" />
        </div>

        {/* Bottom row */}
        <div className="flex px-1 pb-1 gap-px">
          <div className="flex flex-1 gap-px">
            {bottomRow.slice(0, 6).map((pi) => renderPoint(pi, false))}
          </div>
          {/* Bar (bottom) */}
          <div
            className={`w-8 sm:w-10 flex flex-col items-center justify-end pb-2 bg-[#3d2415] cursor-pointer ${
              selectedFrom === BAR ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={handleBarClick}
          >
            {gameState.bar[flipBoard ? 1 : 0] > 0 && (
              <CheckerStack
                count={gameState.bar[flipBoard ? 1 : 0]}
                playerIndex={flipBoard ? 1 : 0}
                isBar
                isSelected={selectedFrom === BAR}
              />
            )}
          </div>
          <div className="flex flex-1 gap-px">
            {bottomRow.slice(6, 12).map((pi) => renderPoint(pi, false))}
          </div>
        </div>
      </div>

      {/* Bear off button */}
      {validDestinations.includes(25) && (
        <button
          onClick={handleBearOff}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm animate-pulse"
        >
          {t('bearOff')}
        </button>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {isMyTurn && gameState.mustRoll && !gameState.winner && (
          <button
            onClick={() => onMove({ type: 'roll' })}
            className="px-6 py-3 bg-gradient-to-r from-gold to-terracotta text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {t('rollDice')}
          </button>
        )}

        {gameState.winner && isHost && (
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-gradient-to-r from-turquoise to-lapis text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
          >
            {t('playAgain')}
          </button>
        )}
      </div>

      {/* Remaining moves indicator */}
      {!gameState.mustRoll && !gameState.winner && isMyTurn && gameState.remainingMoves.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>{t('movesLeft')}:</span>
          <div className="flex gap-1">
            {gameState.remainingMoves.map((v, i) => (
              <span key={i} className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-white/70 font-bold text-[10px]">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
