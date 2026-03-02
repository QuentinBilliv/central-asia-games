'use client';

import { useTranslations } from 'next-intl';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '@/game-logic/memory/constants';
import { MemoryGameConfig } from '@/game-logic/types';

interface GridConfigSelectorProps {
  value: MemoryGameConfig;
  onChange: (config: MemoryGameConfig) => void;
}

export default function GridConfigSelector({ value, onChange }: GridConfigSelectorProps) {
  const t = useTranslations('memory');

  const handleRowChange = (rows: number) => {
    let cols = value.cols;
    if ((rows * cols) % 2 !== 0) {
      cols = cols + 1 <= MAX_GRID_SIZE ? cols + 1 : cols - 1;
    }
    onChange({ rows, cols });
  };

  const handleColChange = (cols: number) => {
    let rows = value.rows;
    if ((rows * cols) % 2 !== 0) {
      rows = rows + 1 <= MAX_GRID_SIZE ? rows + 1 : rows - 1;
    }
    onChange({ rows, cols });
  };

  return (
    <div className="space-y-4 rounded-xl bg-night/5 p-4 border border-night/10">
      <h3 className="text-sm font-medium text-night">{t('gridSize')}</h3>

      <div className="space-y-3">
        <div>
          <label className="flex items-center justify-between text-sm text-night-400 mb-1">
            <span>{t('rows')}</span>
            <span className="font-mono text-night font-semibold">{value.rows}</span>
          </label>
          <input
            type="range"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={value.rows}
            onChange={(e) => handleRowChange(Number(e.target.value))}
            className="w-full accent-turquoise"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm text-night-400 mb-1">
            <span>{t('columns')}</span>
            <span className="font-mono text-night font-semibold">{value.cols}</span>
          </label>
          <input
            type="range"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={value.cols}
            onChange={(e) => handleColChange(Number(e.target.value))}
            className="w-full accent-turquoise"
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-night-400">
        <span>{t('totalCards')}: <strong className="text-night">{value.rows * value.cols}</strong></span>
        <span>{t('totalPairs')}: <strong className="text-night">{(value.rows * value.cols) / 2}</strong></span>
      </div>
    </div>
  );
}
