'use client';

import { useTranslations } from 'next-intl';
import { PetitsChevauxGameState, Player, PetitsChevauxMove } from '@/game-logic/types';
import { getValidMoves } from '@/game-logic/petitsChevaux/moves';
import { playerColors } from '@/lib/design-tokens';
import { START_POSITIONS, BOARD_SIZE, HOME_STRETCH_LENGTH } from '@/game-logic/petitsChevaux/constants';
import Button from '@/components/ui/Button';
import DiceRoller from './DiceRoller';
import { useState, useMemo } from 'react';

interface Props {
  gameState: PetitsChevauxGameState;
  playerId: string;
  players: Player[];
  onMove: (move: PetitsChevauxMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

// ─── Position helpers ───

const BOARD_CX = 250;
const BOARD_CY = 250;
const TRACK_RADIUS = 185;

function getBoardPosition(index: number): { x: number; y: number } {
  const angle = (index / BOARD_SIZE) * Math.PI * 2 - Math.PI / 2;
  return {
    x: BOARD_CX + Math.cos(angle) * TRACK_RADIUS,
    y: BOARD_CY + Math.sin(angle) * TRACK_RADIUS,
  };
}

function getStablePosition(playerIndex: number, horseId: number): { x: number; y: number } {
  const corners = [
    { x: 78, y: 78 },
    { x: 422, y: 78 },
    { x: 422, y: 422 },
    { x: 78, y: 422 },
  ];
  const base = corners[playerIndex];
  const offsets = [
    { x: -18, y: -18 },
    { x: 18, y: -18 },
    { x: -18, y: 18 },
    { x: 18, y: 18 },
  ];
  return { x: base.x + offsets[horseId].x, y: base.y + offsets[horseId].y };
}

function getHomePosition(playerIndex: number, homePos: number): { x: number; y: number } {
  const directions = [
    { dx: 0, dy: -1 },  // Player 0 (Blue): enters from top, home stretch above center
    { dx: 1, dy: 0 },   // Player 1 (Red): enters from right, home stretch right of center
    { dx: 0, dy: 1 },   // Player 2 (Green): enters from bottom, home stretch below center
    { dx: -1, dy: 0 },  // Player 3 (Gold): enters from left, home stretch left of center
  ];
  const startDist = 135;
  const step = 28;
  const dir = directions[playerIndex];
  return {
    x: BOARD_CX + dir.dx * (startDist - homePos * step),
    y: BOARD_CY + dir.dy * (startDist - homePos * step),
  };
}

// ─── SVG sub-components ───

function BoardDefs() {
  return (
    <defs>
      {/* Drop shadow for horse pieces */}
      <filter id="horse-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
      </filter>

      {/* Glow for valid move indicators */}
      <filter id="valid-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft glow for center */}
      <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.2" />
        <stop offset="70%" stopColor="#d4a017" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
      </radialGradient>

      {/* Board background gradient */}
      <radialGradient id="board-bg" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#1e1e38" />
        <stop offset="100%" stopColor="#12121f" />
      </radialGradient>

      {/* Felt texture */}
      <pattern id="felt-texture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r="0.4" fill="#c8956c" opacity="0.06" />
        <circle cx="7" cy="8" r="0.4" fill="#c8956c" opacity="0.04" />
        <circle cx="8" cy="2" r="0.3" fill="#d4a017" opacity="0.03" />
        <circle cx="3" cy="7" r="0.3" fill="#d4a017" opacity="0.03" />
      </pattern>

      {/* Player stable gradients */}
      {Object.entries(playerColors).map(([idx, color]) => (
        <radialGradient key={`sg-${idx}`} id={`stable-glow-${idx}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.bg} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color.bg} stopOpacity="0" />
        </radialGradient>
      ))}
    </defs>
  );
}

function KoshkarMuizCorner({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  return (
    <g aria-hidden="true" transform={`translate(${x},${y}) rotate(${rotation})`}>
      <path
        d="M0,0 C-6,-14 -20,-18 -26,-8 C-30,-2 -24,8 -16,8 C-10,8 -6,2 -6,-2"
        fill="none" stroke="#d4a017" strokeWidth="1.5" opacity="0.5"
      />
      <path
        d="M0,0 C6,-14 20,-18 26,-8 C30,-2 24,8 16,8 C10,8 6,2 6,-2"
        fill="none" stroke="#d4a017" strokeWidth="1.5" opacity="0.5"
      />
      <path d="M0,-2 L-3,-8 L0,-6 L3,-8 Z" fill="#d4a017" opacity="0.35" />
    </g>
  );
}

function OrnamentalBorder() {
  const segments: React.ReactNode[] = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const x = 35 + (i * (430 / count));
    segments.push(
      <path
        key={`bt-${i}`}
        d={`M${x},18 C${x + 8},10 ${x + 14},10 ${x + 22},18`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3"
      />
    );
  }
  for (let i = 0; i < count; i++) {
    const x = 35 + (i * (430 / count));
    segments.push(
      <path
        key={`bb-${i}`}
        d={`M${x},482 C${x + 8},474 ${x + 14},474 ${x + 22},482`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3"
      />
    );
  }
  for (let i = 0; i < count; i++) {
    const y = 35 + (i * (430 / count));
    segments.push(
      <path
        key={`bl-${i}`}
        d={`M18,${y} C10,${y + 8} 10,${y + 14} 18,${y + 22}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3"
      />
    );
  }
  for (let i = 0; i < count; i++) {
    const y = 35 + (i * (430 / count));
    segments.push(
      <path
        key={`br-${i}`}
        d={`M482,${y} C490,${y + 8} 490,${y + 14} 482,${y + 22}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3"
      />
    );
  }
  return <g aria-hidden="true">{segments}</g>;
}

function Shanyrak({ cx, cy }: { cx: number; cy: number }) {
  const spokeCount = 12;
  const outerR = 30;
  const innerR = 12;
  return (
    <g aria-hidden="true">
      {/* Glow behind */}
      <circle cx={cx} cy={cy} r={50} fill="url(#center-glow)" />
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="#d4a01710" stroke="#d4a017" strokeWidth="2" />
      {/* Mid ring */}
      <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="#d4a017" strokeWidth="0.6" opacity="0.4" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#d4a017" strokeWidth="1.5" />
      {/* Cross */}
      <line x1={cx - innerR} y1={cy} x2={cx + innerR} y2={cy} stroke="#d4a017" strokeWidth="1.5" />
      <line x1={cx} y1={cy - innerR} x2={cx} y2={cy + innerR} stroke="#d4a017" strokeWidth="1.5" />
      {/* Spokes */}
      {Array.from({ length: spokeCount }, (_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        return (
          <line
            key={`spoke-${i}`}
            x1={cx + Math.cos(angle) * innerR}
            y1={cy + Math.sin(angle) * innerR}
            x2={cx + Math.cos(angle) * outerR}
            y2={cy + Math.sin(angle) * outerR}
            stroke="#d4a017" strokeWidth="0.8" opacity="0.6"
          />
        );
      })}
      {/* Dots at spoke tips */}
      {Array.from({ length: spokeCount }, (_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        return (
          <circle
            key={`dot-${i}`}
            cx={cx + Math.cos(angle) * outerR}
            cy={cy + Math.sin(angle) * outerR}
            r="1.8" fill="#d4a017" opacity="0.5"
          />
        );
      })}
    </g>
  );
}

function YurtStable({ cx, cy, color, playerIndex }: { cx: number; cy: number; color: string; playerIndex: number }) {
  const w = 68;
  const h = 68;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <g aria-hidden="true">
      {/* Radial glow behind */}
      <circle cx={cx} cy={cy} r={50} fill={`url(#stable-glow-${playerIndex})`} />
      {/* Yurt shape */}
      <path
        d={`M${x},${y + h}
            L${x},${y + 20}
            Q${x},${y + 4} ${x + 10},${y + 2}
            Q${cx},${y - 8} ${x + w - 10},${y + 2}
            Q${x + w},${y + 4} ${x + w},${y + 20}
            L${x + w},${y + h}
            Z`}
        fill={color + '14'}
        stroke={color + '45'}
        strokeWidth="1.2"
      />
      {/* Felt hatching */}
      <clipPath id={`yurt-clip-${cx}-${cy}`}>
        <path
          d={`M${x},${y + h}
              L${x},${y + 20}
              Q${x},${y + 4} ${x + 10},${y + 2}
              Q${cx},${y - 8} ${x + w - 10},${y + 2}
              Q${x + w},${y + 4} ${x + w},${y + 20}
              L${x + w},${y + h}
              Z`}
        />
      </clipPath>
      <g clipPath={`url(#yurt-clip-${cx}-${cy})`}>
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`hd-${i}`}
            x1={x + i * 14} y1={y}
            x2={x + i * 14 + h} y2={y + h}
            stroke={color} strokeWidth="0.4" opacity="0.12"
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`hu-${i}`}
            x1={x + w - i * 14} y1={y}
            x2={x + w - i * 14 - h} y2={y + h}
            stroke={color} strokeWidth="0.4" opacity="0.12"
          />
        ))}
      </g>
      {/* Dome accent */}
      <path
        d={`M${x + 15},${y + 8} Q${cx},${y - 4} ${x + w - 15},${y + 8}`}
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.25"
      />
    </g>
  );
}

function HorseHead({ fillColor, size = 10 }: { fillColor: string; size?: number }) {
  const s = size / 9;
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M0,8 C-1,5 -3,2 -5,-1 C-5,-4 -4,-6 -2,-7.5 C-1,-8.5 1,-9 2.5,-8 C4,-7 5,-5 5.5,-3 C6,-1 6,1 5.5,3 C5,5 3,7 1,8 Z"
        fill={fillColor}
        stroke="#fff"
        strokeWidth={1.2 / s}
      />
      {/* Ear */}
      <path
        d="M-2,-7.5 L-3.5,-10 L-1,-8.5"
        fill={fillColor}
        stroke="#fff"
        strokeWidth={0.7 / s}
      />
      {/* Eye */}
      <circle cx="-1" cy="-4" r={1 / s + 0.5} fill="#fff" opacity="0.9" />
    </g>
  );
}

function StartHorseIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g aria-hidden="true" transform={`translate(${x},${y})`}>
      <path
        d="M0,4 C-0.5,2.5 -1.5,1 -2.5,-0.5 C-2.5,-2 -2,-3 -1,-3.8 C-0.5,-4.2 0.5,-4.5 1.2,-4 C2,-3.5 2.5,-2.5 2.8,-1.5 C3,-0.5 3,0.5 2.8,1.5 C2.5,2.5 1.5,3.5 0.5,4 Z"
        fill={color} opacity="0.5"
      />
    </g>
  );
}

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
      className="w-7 h-7 rounded-md flex-shrink-0 shadow-sm"
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

function VictoryOverlay({ winnerName, winnerColor }: { winnerName: string; winnerColor: string }) {
  const confettiColors = ['#d4a017', '#1e40af', '#c2410c', '#0d9488', '#fef9e7', '#f97316', '#3b82f6'];
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl overflow-hidden"
      style={{ animation: 'pc-victory-in 0.6s ease-out forwards' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      {/* Confetti */}
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${-5 - Math.random() * 10}%`,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            backgroundColor: confettiColors[i % confettiColors.length],
            animation: `pc-confetti ${2.5 + Math.random() * 2.5}s ${Math.random() * 1.5}s ease-in forwards`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Crown SVG */}
        <svg
          viewBox="0 0 60 40"
          className="w-16 h-12 mx-auto mb-3"
          style={{ animation: 'pc-victory-text 0.8s 0.2s ease-out both' }}
        >
          <path
            d="M5,35 L10,12 L20,22 L30,5 L40,22 L50,12 L55,35 Z"
            fill="#d4a017" stroke="#fef9e7" strokeWidth="1.5"
          />
          <circle cx="10" cy="12" r="3" fill="#fef9e7" />
          <circle cx="30" cy="5" r="3" fill="#fef9e7" />
          <circle cx="50" cy="12" r="3" fill="#fef9e7" />
        </svg>

        <h2
          className="text-3xl font-serif font-bold mb-1.5 drop-shadow-lg"
          style={{
            color: winnerColor,
            animation: 'pc-victory-text 0.8s 0.35s ease-out both',
          }}
        >
          {winnerName}
        </h2>
        <p
          className="text-gold text-base font-medium tracking-widest uppercase"
          style={{ animation: 'pc-victory-text 0.8s 0.5s ease-out both' }}
        >
          Victory
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───

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

  // Precompute stable corner positions
  const stableCorners = useMemo(() => [
    { x: 78, y: 78 },
    { x: 422, y: 78 },
    { x: 422, y: 422 },
    { x: 78, y: 422 },
  ], []);

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[calc(100vh-60px)]">
      {/* Status bar */}
      <div
        className={`
          flex items-center justify-between w-full max-w-lg
          rounded-xl px-4 py-3 text-white
          bg-night-800/90 backdrop-blur-md border border-white/[0.06]
          shadow-[0_2px_16px_rgba(0,0,0,0.3)]
          ${isMyTurn && !gameState.winner ? 'animate-[pc-turn-glow_2.5s_ease-in-out_infinite]' : ''}
        `}
      >
        <div className="flex items-center gap-2.5 text-sm">
          {/* Player color dot */}
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
            className="text-[11px] bg-gold/20 text-gold px-2.5 py-1 rounded-md font-semibold tracking-wide"
            style={{ animation: 'pc-extra-turn-pop 0.4s ease-out' }}
          >
            {t('extraTurn')}
          </span>
        )}
      </div>

      {/* Board */}
      <div className="relative w-full max-w-lg aspect-square select-none">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <BoardDefs />

          {/* Background */}
          <rect x="0" y="0" width="500" height="500" rx="20" fill="url(#board-bg)" />
          <rect x="0" y="0" width="500" height="500" rx="20" fill="url(#felt-texture)" />

          {/* Border frame */}
          <rect
            x="10" y="10" width="480" height="480" rx="15"
            fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.25"
          />
          <rect
            x="14" y="14" width="472" height="472" rx="13"
            fill="none" stroke="#d4a017" strokeWidth="0.5" opacity="0.15"
          />
          <OrnamentalBorder />

          {/* Corner ornaments */}
          <KoshkarMuizCorner x={40} y={40} rotation={0} />
          <KoshkarMuizCorner x={460} y={40} rotation={90} />
          <KoshkarMuizCorner x={460} y={460} rotation={180} />
          <KoshkarMuizCorner x={40} y={460} rotation={270} />

          {/* === Track === */}
          {/* Outer glow */}
          <circle
            cx={BOARD_CX} cy={BOARD_CY} r={TRACK_RADIUS}
            fill="none" stroke="#d4a017" strokeWidth="6" opacity="0.04"
          />
          {/* Main track ring */}
          <circle
            cx={BOARD_CX} cy={BOARD_CY} r={TRACK_RADIUS}
            fill="none" stroke="#d4a017" strokeWidth="1.2" opacity="0.2"
            strokeDasharray="6 4"
          />

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
                {/* Cell glow for start positions */}
                {isStart && pColor && (
                  <circle
                    cx={pos.x} cy={pos.y} r={18}
                    fill={pColor.bg} opacity="0.08"
                  />
                )}
                {/* Outer ring */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isStart ? 13 : 11}
                  fill={isStart && pColor ? pColor.bg + '30' : '#ffffff08'}
                  stroke={isStart && pColor ? pColor.bg + 'aa' : '#c8956c30'}
                  strokeWidth={isStart ? 2 : 0.8}
                />
                {/* Inner highlight */}
                <circle
                  cx={pos.x} cy={pos.y - 1}
                  r={isStart ? 8 : 6}
                  fill="#ffffff" opacity="0.03"
                />
                {/* Horse icon on start positions */}
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
            const base = stableCorners[ps.playerIndex];
            return (
              <YurtStable
                key={`stable-${ps.playerIndex}`}
                cx={base.x} cy={base.y}
                color={color?.bg}
                playerIndex={ps.playerIndex}
              />
            );
          })}

          {/* === Horses === */}
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
                {/* Valid move glow ring */}
                {canMove && (
                  <g filter="url(#valid-glow)">
                    <circle cx={0} cy={0} r={15} fill="none" stroke="#fff" strokeWidth="2">
                      <animate
                        attributeName="r" values="13;17;13"
                        dur="1.2s" repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity" values="0.7;0.25;0.7"
                        dur="1.2s" repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}
                {/* Horse piece */}
                <HorseHead
                  fillColor={color?.bg}
                  size={canMove ? 11 : 10}
                />
              </g>
            );
          })}
        </svg>

        {/* Victory overlay */}
        {gameState.winner && winnerPlayer && winnerColor && (
          <VictoryOverlay
            winnerName={winnerPlayer.nickname}
            winnerColor={winnerColor.bg}
          />
        )}
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

        {/* No valid moves */}
        {isMyTurn && !gameState.mustRoll && validMoveHorses.length === 0 && !gameState.winner && (
          <p className="text-sm text-night-300 italic">{t('noMoves')}</p>
        )}

        {/* Player score cards */}
        <div className="flex gap-2.5 w-full">
          {gameState.players.map((ps) => {
            const color = playerColors[ps.playerIndex as keyof typeof playerColors];
            const player = players.find((p) => p.id === ps.playerId);
            const isActive = currentPlayerTurnId === ps.playerId && !gameState.winner;

            return (
              <div
                key={ps.playerId}
                className={`
                  flex-1 rounded-xl px-3 py-2.5 text-center text-sm overflow-hidden
                  transition-all duration-300
                  ${isActive
                    ? 'bg-night-600/90 ring-1 ring-white/20 animate-[pc-score-active_2s_ease-in-out_infinite]'
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
                  {gameState.lastRolls[ps.playerId] ? (
                    <MiniDie value={gameState.lastRolls[ps.playerId]} color={color?.bg} />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-white/5 border border-white/[0.06] flex items-center justify-center">
                      <span className="text-[10px] text-night-300">-</span>
                    </div>
                  )}
                  <span className="text-night-200 text-[11px] tabular-nums">
                    {t('horsesHome', { count: ps.horsesHome })}
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
