'use client';

import { useTranslations } from 'next-intl';
import { BurkutBoriGameState, BurkutBoriMove, Player } from '@/game-logic/types';
import { cellToGridPosition } from '@/game-logic/burkutBori/board';
import { EAGLE_MAP, WOLF_MAP, BOARD_SIZE, GRID_ROWS, GRID_COLS, EXTRA_TURN_VALUE } from '@/game-logic/burkutBori/constants';
import { playerColors } from '@/lib/design-tokens';
import Button from '@/components/ui/Button';
import DiceRoller from './DiceRoller';
import { useState, useMemo, useEffect, useRef } from 'react';

interface Props {
  gameState: BurkutBoriGameState;
  playerId: string;
  players: Player[];
  onMove: (move: BurkutBoriMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

// ─── Layout constants ───

const PADDING = 40;
const CELL_SIZE = 46;
const BOARD_W = GRID_COLS * CELL_SIZE;
const BOARD_H = GRID_ROWS * CELL_SIZE;
const SVG_W = BOARD_W + PADDING * 2;
const SVG_H = BOARD_H + PADDING * 2;

/**
 * Convert grid row/col to SVG pixel coordinates (center of cell).
 * Row 0 is the BOTTOM row visually, row 9 is the TOP.
 */
function gridToPixel(row: number, col: number): { x: number; y: number } {
  return {
    x: PADDING + col * CELL_SIZE + CELL_SIZE / 2,
    y: PADDING + (GRID_ROWS - 1 - row) * CELL_SIZE + CELL_SIZE / 2,
  };
}

function cellToPixel(cell: number): { x: number; y: number } {
  const { row, col } = cellToGridPosition(cell);
  return gridToPixel(row, col);
}

// ─── Eagle SVG path (golden eagle silhouette) ───

function EagleIcon({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
  const s = size / 24;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g transform="translate(-12,-12)">
        <path
          d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z"
          fill="#d4a017" opacity="0.85"
        />
        <circle cx="10" cy="9" r="0.8" fill="#1a1a2e" />
      </g>
    </g>
  );
}

// ─── Wolf SVG path (grey wolf silhouette) ───

function WolfIcon({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
  const s = size / 24;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g transform="translate(-12,-12)">
        <path
          d="M4 4 L6 10 C6 10 3 14 3 18 C3 20 5 22 8 22 L10 22 L11 18 L12 22 L13 18 L14 22 L16 22 C19 22 21 20 21 18 C21 14 18 10 18 10 L20 4 L16 8 C14 7 10 7 8 8 Z"
          fill="#6b7280" opacity="0.85"
        />
        <circle cx="10" cy="11" r="0.8" fill="#fbbf24" />
        <circle cx="14" cy="11" r="0.8" fill="#fbbf24" />
      </g>
    </g>
  );
}

// ─── Horseman token (rider) ───

function HorsemanToken({ color, size = 10 }: { color: string; size?: number }) {
  const s = size / 10;
  return (
    <g transform={`scale(${s})`}>
      {/* Horse body */}
      <ellipse cx="0" cy="3" rx="6" ry="4" fill={color} />
      {/* Horse head */}
      <ellipse cx="5" cy="-1" rx="3" ry="2.5" fill={color} transform="rotate(-20, 5, -1)" />
      {/* Rider */}
      <circle cx="-1" cy="-3" r="3" fill={color} />
      <circle cx="-1" cy="-3" r="2" fill="#fff" opacity="0.25" />
      {/* Ear */}
      <line x1="4" y1="-3" x2="5.5" y2="-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Highlight */}
      <ellipse cx="0" cy="2" rx="4" ry="2.5" fill="#fff" opacity="0.12" />
    </g>
  );
}

// ─── Curved path between two cells ───

function ConnectionPath({
  fromCell,
  toCell,
  color,
  dashed = false,
}: {
  fromCell: number;
  toCell: number;
  color: string;
  dashed?: boolean;
}) {
  const from = cellToPixel(fromCell);
  const to = cellToPixel(toCell);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Offset control point perpendicular to the line
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(len * 0.35, 50);
  const cpx = midX + (-dy / len) * offset;
  const cpy = midY + (dx / len) * offset;

  return (
    <path
      d={`M${from.x},${from.y} Q${cpx},${cpy} ${to.x},${to.y}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashed ? '4 3' : 'none'}
      opacity="0.35"
      strokeLinecap="round"
    />
  );
}

// ─── Shanyrak (yurt crown) for cell 100 ───

function Shanyrak({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="16" fill="#d4a017" opacity="0.15" />
      <circle r="11" fill="none" stroke="#d4a017" strokeWidth="1.5" opacity="0.7" />
      <circle r="5" fill="none" stroke="#d4a017" strokeWidth="1" opacity="0.5" />
      {/* Cross struts */}
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1={5 * Math.cos((angle * Math.PI) / 180)}
          y1={5 * Math.sin((angle * Math.PI) / 180)}
          x2={11 * Math.cos((angle * Math.PI) / 180)}
          y2={11 * Math.sin((angle * Math.PI) / 180)}
          stroke="#d4a017"
          strokeWidth="0.8"
          opacity="0.5"
        />
      ))}
    </g>
  );
}

// ─── Koshkar Muiz (ram horn) border pattern ───

function KoshkarMuizBorder() {
  const segments: React.ReactNode[] = [];
  const count = 16;
  const w = SVG_W;
  const h = SVG_H;

  // Top & bottom borders
  for (let i = 0; i < count; i++) {
    const x = 20 + (i * ((w - 40) / count));
    segments.push(
      <path key={`t-${i}`} d={`M${x},12 C${x + 6},6 ${x + 12},6 ${x + 18},12`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
    segments.push(
      <path key={`b-${i}`} d={`M${x},${h - 12} C${x + 6},${h - 6} ${x + 12},${h - 6} ${x + 18},${h - 12}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }
  // Left & right borders
  for (let i = 0; i < count; i++) {
    const y = 20 + (i * ((h - 40) / count));
    segments.push(
      <path key={`l-${i}`} d={`M12,${y} C6,${y + 6} 6,${y + 12} 12,${y + 18}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
    segments.push(
      <path key={`r-${i}`} d={`M${w - 12},${y} C${w - 6},${y + 6} ${w - 6},${y + 12} ${w - 12},${y + 18}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }

  // Corner ornaments
  const corners = [
    { x: 20, y: 20, rot: 0 },
    { x: w - 20, y: 20, rot: 90 },
    { x: w - 20, y: h - 20, rot: 180 },
    { x: 20, y: h - 20, rot: 270 },
  ];
  for (const c of corners) {
    segments.push(
      <g key={`c-${c.rot}`} transform={`translate(${c.x},${c.y}) rotate(${c.rot})`}>
        <path d="M0,0 C-5,-10 -15,-14 -20,-6 C-22,-2 -18,6 -12,6 C-8,6 -5,2 -5,-1"
          fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.4" />
        <path d="M0,0 C5,-10 15,-14 20,-6 C22,-2 18,6 12,6 C8,6 5,2 5,-1"
          fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.4" />
      </g>
    );
  }

  return <g aria-hidden="true">{segments}</g>;
}

// ─── Mountain silhouettes ───

function MountainSilhouettes() {
  return (
    <g aria-hidden="true" opacity="0.08">
      <path d="M0,520 L40,480 L80,500 L140,440 L180,470 L220,420 L270,460 L320,410 L370,450 L420,400 L460,440 L500,420 L540,460 L560,520Z"
        fill="#6366f1" />
      <path d="M0,520 L60,490 L120,510 L180,460 L240,490 L300,430 L360,470 L400,450 L440,480 L500,440 L540,470 L560,520Z"
        fill="#4338ca" />
    </g>
  );
}

// ─── Star twinkles ───

function Stars() {
  const stars = useMemo(() => {
    const seed = [
      { x: 50, y: 15, r: 1.2 }, { x: 130, y: 8, r: 0.8 }, { x: 210, y: 22, r: 1 },
      { x: 310, y: 12, r: 0.9 }, { x: 400, y: 18, r: 1.1 }, { x: 480, y: 10, r: 0.7 },
      { x: 80, y: 30, r: 0.6 }, { x: 350, y: 28, r: 0.8 }, { x: 520, y: 25, r: 1 },
      { x: 20, y: 510, r: 0.8 }, { x: 180, y: 505, r: 0.6 }, { x: 450, y: 515, r: 0.9 },
    ];
    return seed;
  }, []);

  return (
    <g aria-hidden="true">
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.3">
          <animate
            attributeName="opacity"
            values="0.1;0.5;0.1"
            dur={`${2 + (i % 3)}s`}
            repeatCount="indefinite"
            begin={`${(i * 0.4) % 2}s`}
          />
        </circle>
      ))}
    </g>
  );
}

// ─── Victory overlay ───

function VictoryOverlay({ winnerName, winnerColor }: { winnerName: string; winnerColor: string }) {
  const t = useTranslations('burkutBori');
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden animate-[bb-victory-in_0.5s_ease-out]">
      <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" />
      {/* Confetti */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-[bb-confetti_3s_ease-in_forwards]"
          style={{
            left: `${5 + (i * 3.1) % 90}%`,
            top: '-4px',
            backgroundColor: ['#d4a017', '#0d9488', '#c2410c', '#1e40af', '#fbbf24'][i % 5],
            animationDelay: `${(i * 0.08)}s`,
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
      {/* Eagle soaring */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-[bb-eagle-soar_2s_ease-out_infinite]">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z"
            fill={winnerColor} opacity="0.9"
          />
        </svg>
      </div>
      {/* Winner text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-[bb-victory-text_0.6s_ease-out_0.3s_both]">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2"
            style={{ textShadow: `0 0 30px ${winnerColor}60` }}>
            {t('winner', { name: winnerName })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step-by-step path computation ───

const STEP_DELAY_MS = 280; // pause per cell
const EAGLE_WOLF_PAUSE_MS = 600; // pause before eagle/wolf jump

function computeMovePath(from: number, diceValue: number): number[] {
  const path: number[] = [];
  const rawTarget = from + diceValue;

  if (rawTarget <= BOARD_SIZE) {
    for (let i = from + 1; i <= rawTarget; i++) path.push(i);
  } else {
    // Go forward to 100, then bounce back
    for (let i = from + 1; i <= BOARD_SIZE; i++) path.push(i);
    const bounceTarget = BOARD_SIZE - (rawTarget - BOARD_SIZE);
    for (let i = BOARD_SIZE - 1; i >= bounceTarget; i--) path.push(i);
  }

  return path;
}

// ─── Mini die for score cards ───

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

// ═══════════════════════════════════════════════
// ─── Main Board Component ───
// ═══════════════════════════════════════════════

export default function BurkutBoriBoard({ gameState, playerId, players, onMove, onRestart, isHost }: Props) {
  const t = useTranslations('burkutBori');
  const tCommon = useTranslations('common');
  const [rolling, setRolling] = useState(false);
  const localRollRef = useRef(false); // true when the human clicked "roll"

  // ─── Cell-by-cell animation ───
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const lastMoveKeyRef = useRef('');
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any running animation
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

    // Capture values for the nested function (avoids TS null-narrowing issues)
    const pid = move.playerId;
    const intermediate = move.intermediatePosition;
    const finalTo = move.to;

    // Recursive setTimeout: each step schedules the next one,
    // guaranteeing React renders the current position before advancing.
    function stepTo(i: number) {
      setDisplayPositions((prev) => ({ ...prev, [pid]: path[i] }));

      if (i < path.length - 1) {
        // Schedule next cell
        animTimerRef.current = setTimeout(() => stepTo(i + 1), STEP_DELAY_MS);
      } else {
        // All cells traversed — handle eagle/wolf redirect
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

    // Check if the human already triggered the dice spin via handleRoll
    const wasLocalRoll = localRollRef.current;
    localRollRef.current = false;

    if (wasLocalRoll) {
      // Human player — dice already animated, go straight to movement
      stepTo(0);
    } else {
      // Bot / remote player — animate the dice spin first
      setRolling(true);
      animTimerRef.current = setTimeout(() => {
        setRolling(false);
        // Brief pause for the dice reveal animation
        animTimerRef.current = setTimeout(() => stepTo(0), 250);
      }, 300);
    }

    return cancelAnimation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.lastMove]);

  // Reset everything when a new game starts (lastMove goes back to null)
  useEffect(() => {
    if (!gameState.lastMove) {
      cancelAnimation();
      setDisplayPositions({});
      setIsAnimating(false);
      setRolling(false);
      lastMoveKeyRef.current = '';
    }
  }, [gameState.lastMove]);

  // Detect during render if a new move arrived that hasn't been animated yet.
  // This prevents a one-frame flash at the final position.
  const pendingMoveKey = gameState.lastMove
    ? `${gameState.lastMove.playerId}-${gameState.lastMove.from}-${gameState.lastMove.to}-${gameState.lastMove.diceValue}`
    : '';
  const hasPendingMove = pendingMoveKey !== '' && pendingMoveKey !== lastMoveKeyRef.current;

  /** Resolve display position: use animation override if present, else real position */
  function getDisplayPos(playerId: string, realPosition: number): number {
    if (displayPositions[playerId] !== undefined) return displayPositions[playerId];
    // A new move just arrived for this player but the effect hasn't started yet:
    // show the token at "from" (0 = off-board) instead of the final position.
    if (hasPendingMove && gameState.lastMove?.playerId === playerId) {
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

  // Eagle/wolf connection data
  const eagleConnections = useMemo(() =>
    Object.entries(EAGLE_MAP).map(([from, to]) => ({ from: Number(from), to })),
    []
  );
  const wolfConnections = useMemo(() =>
    Object.entries(WOLF_MAP).map(([from, to]) => ({ from: Number(from), to })),
    []
  );

  // Count players per cell for stacking offset (uses display positions)
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
      setRolling(false);
    }, 400);
  };

  // Cell background color
  function getCellFill(cell: number): string {
    if (cell === BOARD_SIZE) return 'rgba(212, 160, 23, 0.15)';
    if (EAGLE_MAP[cell] !== undefined) return 'rgba(212, 160, 23, 0.08)';
    if (WOLF_MAP[cell] !== undefined) return 'rgba(107, 114, 128, 0.08)';
    const { row, col } = cellToGridPosition(cell);
    return (row + col) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Turn indicator */}
      {!gameState.winner && (
        <div className={`
          text-sm font-medium px-4 py-1.5 rounded-full transition-all
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
          {/* SVG Defs */}
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
                {/* Cell background */}
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

                {/* Cell number */}
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

                {/* Eagle icon on base cells */}
                {isEagleBase && <EagleIcon x={pos.x} y={pos.y + 5} size={18} />}

                {/* Wolf icon on head cells */}
                {isWolfHead && <WolfIcon x={pos.x} y={pos.y + 5} size={18} />}

                {/* Shanyrak on cell 100 */}
                {isFinish && <Shanyrak cx={pos.x} cy={pos.y} />}
              </g>
            );
          })}

          {/* Eagle destination markers (head cells) */}
          {Object.values(EAGLE_MAP).map((headCell) => {
            const pos = cellToPixel(headCell);
            return (
              <circle key={`eagle-head-${headCell}`} cx={pos.x} cy={pos.y - 18} r="3"
                fill="#d4a017" opacity="0.4" filter="url(#bb-eagle-glow)" />
            );
          })}

          {/* Wolf destination markers (tail cells) */}
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
            if (displayPos === 0) return null; // off-board

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
                {/* Active turn ring */}
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

          {/* Off-board tokens (position 0) displayed in corner */}
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
        {/* Dice */}
        {!gameState.winner && (
          <DiceRoller
            value={gameState.lastMove?.diceValue ?? null}
            rolling={rolling}
            canRoll={isMyTurn && !rolling && !isAnimating}
            onRoll={handleRoll}
          />
        )}

        {/* Player score cards */}
        <div className="flex gap-2.5 w-full">
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
                {/* Colored top accent */}
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
                  <span className="text-night-200 text-[11px] tabular-nums">
                    {t('position')}: {p.position === 0 ? t('offBoard') : p.position}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart */}
        {gameState.winner && isHost && (
          <Button onClick={onRestart} variant="secondary" size="lg" className="w-full mt-2">
            {tCommon('restart')}
          </Button>
        )}
      </div>
    </div>
  );
}
