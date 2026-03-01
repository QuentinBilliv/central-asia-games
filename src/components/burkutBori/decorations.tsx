import { useMemo } from 'react';
import { cellToPixel, SVG_W, SVG_H } from './layout';

export function EagleIcon({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
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

export function WolfIcon({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
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

export function HorsemanToken({ color, size = 10 }: { color: string; size?: number }) {
  const s = size / 10;
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="3" rx="6" ry="4" fill={color} />
      <ellipse cx="5" cy="-1" rx="3" ry="2.5" fill={color} transform="rotate(-20, 5, -1)" />
      <circle cx="-1" cy="-3" r="3" fill={color} />
      <circle cx="-1" cy="-3" r="2" fill="#fff" opacity="0.25" />
      <line x1="4" y1="-3" x2="5.5" y2="-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="0" cy="2" rx="4" ry="2.5" fill="#fff" opacity="0.12" />
    </g>
  );
}

export function ConnectionPath({
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

export function Shanyrak({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="16" fill="#d4a017" opacity="0.15" />
      <circle r="11" fill="none" stroke="#d4a017" strokeWidth="1.5" opacity="0.7" />
      <circle r="5" fill="none" stroke="#d4a017" strokeWidth="1" opacity="0.5" />
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

export function KoshkarMuizBorder() {
  const segments: React.ReactNode[] = [];
  const count = 16;
  const w = SVG_W;
  const h = SVG_H;

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

export function MountainSilhouettes() {
  return (
    <g aria-hidden="true" opacity="0.08">
      <path d="M0,520 L40,480 L80,500 L140,440 L180,470 L220,420 L270,460 L320,410 L370,450 L420,400 L460,440 L500,420 L540,460 L560,520Z"
        fill="#6366f1" />
      <path d="M0,520 L60,490 L120,510 L180,460 L240,490 L300,430 L360,470 L400,450 L440,480 L500,440 L540,470 L560,520Z"
        fill="#4338ca" />
    </g>
  );
}

export function Stars() {
  const stars = useMemo(() => [
    { x: 50, y: 15, r: 1.2 }, { x: 130, y: 8, r: 0.8 }, { x: 210, y: 22, r: 1 },
    { x: 310, y: 12, r: 0.9 }, { x: 400, y: 18, r: 1.1 }, { x: 480, y: 10, r: 0.7 },
    { x: 80, y: 30, r: 0.6 }, { x: 350, y: 28, r: 0.8 }, { x: 520, y: 25, r: 1 },
    { x: 20, y: 510, r: 0.8 }, { x: 180, y: 505, r: 0.6 }, { x: 450, y: 515, r: 0.9 },
  ], []);

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
