import { playerColors } from '@/lib/design-tokens';

export function BoardDefs() {
  return (
    <defs>
      <filter id="horse-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
      </filter>
      <filter id="valid-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.2" />
        <stop offset="70%" stopColor="#d4a017" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="board-bg" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#1e1e38" />
        <stop offset="100%" stopColor="#12121f" />
      </radialGradient>
      <pattern id="felt-texture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r="0.4" fill="#c8956c" opacity="0.06" />
        <circle cx="7" cy="8" r="0.4" fill="#c8956c" opacity="0.04" />
        <circle cx="8" cy="2" r="0.3" fill="#d4a017" opacity="0.03" />
        <circle cx="3" cy="7" r="0.3" fill="#d4a017" opacity="0.03" />
      </pattern>
      {Object.entries(playerColors).map(([idx, color]) => (
        <radialGradient key={`sg-${idx}`} id={`stable-glow-${idx}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.bg} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color.bg} stopOpacity="0" />
        </radialGradient>
      ))}
    </defs>
  );
}

export function KoshkarMuizCorner({ x, y, rotation }: { x: number; y: number; rotation: number }) {
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

export function OrnamentalBorder() {
  const segments: React.ReactNode[] = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const x = 35 + (i * (430 / count));
    segments.push(
      <path key={`bt-${i}`} d={`M${x},18 C${x + 8},10 ${x + 14},10 ${x + 22},18`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }
  for (let i = 0; i < count; i++) {
    const x = 35 + (i * (430 / count));
    segments.push(
      <path key={`bb-${i}`} d={`M${x},482 C${x + 8},474 ${x + 14},474 ${x + 22},482`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }
  for (let i = 0; i < count; i++) {
    const y = 35 + (i * (430 / count));
    segments.push(
      <path key={`bl-${i}`} d={`M18,${y} C10,${y + 8} 10,${y + 14} 18,${y + 22}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }
  for (let i = 0; i < count; i++) {
    const y = 35 + (i * (430 / count));
    segments.push(
      <path key={`br-${i}`} d={`M482,${y} C490,${y + 8} 490,${y + 14} 482,${y + 22}`}
        fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.3" />
    );
  }
  return <g aria-hidden="true">{segments}</g>;
}

export function Shanyrak({ cx, cy }: { cx: number; cy: number }) {
  const spokeCount = 12;
  const outerR = 30;
  const innerR = 12;
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r={50} fill="url(#center-glow)" />
      <circle cx={cx} cy={cy} r={outerR} fill="#d4a01710" stroke="#d4a017" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="#d4a017" strokeWidth="0.6" opacity="0.4" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#d4a017" strokeWidth="1.5" />
      <line x1={cx - innerR} y1={cy} x2={cx + innerR} y2={cy} stroke="#d4a017" strokeWidth="1.5" />
      <line x1={cx} y1={cy - innerR} x2={cx} y2={cy + innerR} stroke="#d4a017" strokeWidth="1.5" />
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

export function YurtStable({ cx, cy, color, playerIndex }: { cx: number; cy: number; color: string; playerIndex: number }) {
  const w = 68;
  const h = 68;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r={50} fill={`url(#stable-glow-${playerIndex})`} />
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
          <line key={`hd-${i}`} x1={x + i * 14} y1={y} x2={x + i * 14 + h} y2={y + h}
            stroke={color} strokeWidth="0.4" opacity="0.12" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`hu-${i}`} x1={x + w - i * 14} y1={y} x2={x + w - i * 14 - h} y2={y + h}
            stroke={color} strokeWidth="0.4" opacity="0.12" />
        ))}
      </g>
      <path
        d={`M${x + 15},${y + 8} Q${cx},${y - 4} ${x + w - 15},${y + 8}`}
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.25"
      />
    </g>
  );
}

export function HorseHead({ fillColor, size = 10 }: { fillColor: string; size?: number }) {
  const s = size / 9;
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M0,8 C-1,5 -3,2 -5,-1 C-5,-4 -4,-6 -2,-7.5 C-1,-8.5 1,-9 2.5,-8 C4,-7 5,-5 5.5,-3 C6,-1 6,1 5.5,3 C5,5 3,7 1,8 Z"
        fill={fillColor}
        stroke="#fff"
        strokeWidth={1.2 / s}
      />
      <path
        d="M-2,-7.5 L-3.5,-10 L-1,-8.5"
        fill={fillColor}
        stroke="#fff"
        strokeWidth={0.7 / s}
      />
      <circle cx="-1" cy="-4" r={1 / s + 0.5} fill="#fff" opacity="0.9" />
    </g>
  );
}

export function StartHorseIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g aria-hidden="true" transform={`translate(${x},${y})`}>
      <path
        d="M0,4 C-0.5,2.5 -1.5,1 -2.5,-0.5 C-2.5,-2 -2,-3 -1,-3.8 C-0.5,-4.2 0.5,-4.5 1.2,-4 C2,-3.5 2.5,-2.5 2.8,-1.5 C3,-0.5 3,0.5 2.8,1.5 C2.5,2.5 1.5,3.5 0.5,4 Z"
        fill={color} opacity="0.5"
      />
    </g>
  );
}
