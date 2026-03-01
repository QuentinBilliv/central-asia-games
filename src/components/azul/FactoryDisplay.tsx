'use client';

import { AzulFactory, AzulTileColor } from '@/game-logic/types';
import { tileColors } from '@/lib/design-tokens';

interface Props {
  factory: AzulFactory;
  selectedFactory: { type: 'factory' | 'center'; id: number } | null;
  selectedColor: AzulTileColor | null;
  isMyTurn: boolean;
  onTileClick: (color: AzulTileColor) => void;
}

/**
 * Uzbek ceramic plate SVG border — concentric rings with dotted motifs.
 */
function CeramicPlateBorder({ isSelected }: { isSelected: boolean }) {
  const accent = isSelected ? '#5eead4' : '#d4a017';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 130 130"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <circle cx="65" cy="65" r="62" fill="none" stroke={accent} strokeWidth={isSelected ? 2.5 : 1.5} opacity={isSelected ? 1 : 0.6} />
      <circle cx="65" cy="65" r="57" fill="none" stroke="#0d9488" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="65" cy="65" r="52" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.3" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12;
        const rad = (angle * Math.PI) / 180;
        const x = 65 + 55 * Math.cos(rad);
        const y = 65 + 55 * Math.sin(rad);
        return (
          <rect
            key={i}
            x={x - 1.5} y={y - 1.5} width="3" height="3"
            fill={accent}
            transform={`rotate(45 ${x} ${y})`}
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}

/** Glazed tile style */
function tileGlaze(color: AzulTileColor) {
  const tc = tileColors[color];
  return {
    background: `linear-gradient(135deg, ${tc.light} 0%, ${tc.bg} 40%, ${tc.dark} 100%)`,
    boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  };
}

export default function FactoryDisplay({
  factory,
  selectedFactory,
  selectedColor,
  isMyTurn,
  onTileClick,
}: Props) {
  if (factory.tiles.length === 0) return null;

  const isThisFactorySelected =
    selectedFactory?.type === 'factory' && selectedFactory.id === factory.id;

  return (
    <div
      className={`relative w-[130px] h-[130px] flex items-center justify-center transition-all duration-300 ${
        isThisFactorySelected ? 'scale-105' : isMyTurn ? 'hover:scale-[1.03]' : ''
      }`}
      style={{
        background: isThisFactorySelected
          ? 'radial-gradient(circle at 40% 35%, rgba(13,148,136,0.15) 0%, rgba(26,26,46,0.95) 70%)'
          : 'radial-gradient(circle at 40% 35%, rgba(254,249,231,0.08) 0%, rgba(26,26,46,0.95) 70%)',
        borderRadius: '50%',
      }}
    >
      <CeramicPlateBorder isSelected={isThisFactorySelected} />

      <div className="grid grid-cols-2 gap-2 relative z-10">
        {factory.tiles.map((color, i) => {
          const isSelected = isThisFactorySelected && selectedColor === color;
          return (
            <button
              key={i}
              onClick={() => isMyTurn && onTileClick(color)}
              className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                isMyTurn ? 'hover:scale-110 hover:brightness-110 cursor-pointer' : ''
              } ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-night scale-110' : ''}`}
              style={tileGlaze(color)}
              disabled={!isMyTurn}
            />
          );
        })}
      </div>
    </div>
  );
}
