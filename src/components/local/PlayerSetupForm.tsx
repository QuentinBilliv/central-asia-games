'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

const BOT_NAMES = ['Timur', 'Babur', 'Ulugh Beg', 'Alisher'];

export interface PlayerConfig {
  nickname: string;
  isBot: boolean;
}

interface Props {
  onStart: (players: PlayerConfig[]) => void;
  maxPlayers?: number;
}

export default function PlayerSetupForm({ onStart, maxPlayers = 4 }: Props) {
  const t = useTranslations('local');

  const [players, setPlayers] = useState<PlayerConfig[]>([
    { nickname: '', isBot: false },
    { nickname: BOT_NAMES[0], isBot: true },
  ]);

  const canAdd = players.length < maxPlayers;
  const canRemove = players.length > 2;

  const humanCount = players.filter((p) => !p.isBot).length;
  const allHumansNamed = players
    .filter((p) => !p.isBot)
    .every((p) => p.nickname.trim().length > 0);
  const isValid = humanCount >= 1 && allHumansNamed;

  const addPlayer = () => {
    if (!canAdd) return;
    const botIdx = players.filter((p) => p.isBot).length;
    setPlayers([
      ...players,
      { nickname: BOT_NAMES[botIdx] || `Bot ${botIdx + 1}`, isBot: true },
    ]);
  };

  const removePlayer = (index: number) => {
    if (!canRemove) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, update: Partial<PlayerConfig>) => {
    setPlayers(
      players.map((p, i) => {
        if (i !== index) return p;
        const updated = { ...p, ...update };
        // When switching to bot, assign a bot name if empty
        if (update.isBot === true && !p.isBot) {
          const usedNames = players
            .filter((pp, ii) => pp.isBot && ii !== index)
            .map((pp) => pp.nickname);
          const availableName = BOT_NAMES.find((n) => !usedNames.includes(n)) || `Bot ${index + 1}`;
          updated.nickname = availableName;
        }
        // When switching to human, clear the bot name
        if (update.isBot === false && p.isBot) {
          updated.nickname = '';
        }
        return updated;
      })
    );
  };

  return (
    <Card variant="elevated" className="p-4 sm:p-6 w-full max-w-md">
      <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-3 sm:mb-4">
        {t('setupTitle')}
      </h2>

      <div className="space-y-2.5 sm:space-y-3">
        {players.map((player, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm text-night-400 w-5 shrink-0">{idx + 1}.</span>

            <Input
              value={player.nickname}
              onChange={(e) => updatePlayer(idx, { nickname: e.target.value })}
              placeholder={player.isBot ? BOT_NAMES[idx] : t('namePlaceholder')}
              disabled={player.isBot}
              className="flex-1 min-w-0 text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4"
            />

            <button
              onClick={() => updatePlayer(idx, { isBot: !player.isBot })}
              className={`shrink-0 text-xs px-2.5 sm:px-3 py-2 rounded-lg border transition-colors font-medium min-h-[40px] ${
                player.isBot
                  ? 'bg-lapis/10 border-lapis text-lapis'
                  : 'bg-turquoise/10 border-turquoise text-turquoise'
              }`}
            >
              {player.isBot ? t('bot') : t('human')}
            </button>

            {canRemove && (
              <button
                onClick={() => removePlayer(idx)}
                className="shrink-0 text-night-300 hover:text-terracotta transition-colors text-lg min-w-[32px] min-h-[40px] flex items-center justify-center"
                aria-label={t('removePlayer')}
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          onClick={addPlayer}
          className="mt-3 text-sm text-turquoise hover:text-turquoise-700 font-medium min-h-[40px]"
        >
          + {t('addPlayer')}
        </button>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full mt-5 sm:mt-6"
        disabled={!isValid}
        onClick={() => onStart(players)}
      >
        {t('startGame')}
      </Button>
    </Card>
  );
}
