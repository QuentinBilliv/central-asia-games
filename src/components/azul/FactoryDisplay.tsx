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
      className={`bg-night-600 rounded-full w-24 h-24 flex items-center justify-center border-2 transition-all ${
        isThisFactorySelected ? 'border-white shadow-lg' : 'border-night-400'
      }`}
    >
      <div className="grid grid-cols-2 gap-1.5">
        {factory.tiles.map((color, i) => {
          const tc = tileColors[color];
          const isSelected = isThisFactorySelected && selectedColor === color;
          return (
            <button
              key={i}
              onClick={() => isMyTurn && onTileClick(color)}
              className={`w-8 h-8 rounded-md transition-all duration-200 ${
                isMyTurn ? 'hover:scale-110 cursor-pointer' : ''
              } ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}
              style={{ backgroundColor: tc.bg }}
              disabled={!isMyTurn}
            />
          );
        })}
      </div>
    </div>
  );
}
