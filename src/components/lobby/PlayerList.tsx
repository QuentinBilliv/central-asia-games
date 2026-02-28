'use client';

import { useTranslations } from 'next-intl';
import { Player } from '@/game-logic/types';
import { playerColors } from '@/lib/design-tokens';

interface PlayerListProps {
  players: Player[];
  hostId: string | null;
  currentPlayerId: string;
}

export default function PlayerList({ players, hostId, currentPlayerId }: PlayerListProps) {
  const t = useTranslations('lobby');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-night-400 uppercase tracking-wide">
        {tCommon('players')} ({players.length}/4)
      </h3>
      <div className="space-y-1.5">
        {players.map((player) => {
          const color = playerColors[player.index as keyof typeof playerColors];
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-sand-200"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color?.bg || '#999' }}
              />
              <span className="font-medium text-night flex-1">
                {player.nickname}
                {player.id === currentPlayerId && (
                  <span className="text-xs text-turquoise ml-1.5">({tCommon('you')})</span>
                )}
              </span>
              {player.id === hostId && (
                <span className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded font-medium">
                  {t('host')}
                </span>
              )}
              {!player.connected && (
                <span className="text-xs text-terracotta animate-pulse">
                  {t('reconnecting', { name: '' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
