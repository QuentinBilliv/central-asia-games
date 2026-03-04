'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CentralAsianPattern from '@/components/layout/CentralAsianPattern';
import Card from '@/components/ui/Card';
import PlayerSetupForm, { PlayerConfig } from '@/components/local/PlayerSetupForm';
import GridConfigSelector from '@/components/memory/GridConfigSelector';
import RulesModal from '@/components/rules/RulesModal';
import { GameType, GAME_TYPES, MemoryGameConfig } from '@/game-logic/types';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/game-logic/memory/constants';

const gameGradients: Record<GameType, string> = {
  azul: 'from-lapis to-turquoise',
  petitsChevaux: 'from-gold to-terracotta',
  burkutBori: 'from-[#1a1a2e] to-[#2d1b69]',
  memory: 'from-turquoise to-gold',
  toguzKorgool: 'from-[#78350f] to-[#d4a017]',
};

function GameIcon({ game }: { game: GameType }) {
  switch (game) {
    case 'azul':
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {['bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise', 'bg-night-400', 'bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise'].map(
            (color, i) => (
              <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${color} rounded-sm`} />
            )
          )}
        </div>
      );
    case 'petitsChevaux':
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white/40 rounded-lg rotate-45 relative">
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-lapis transform -rotate-45" />
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-terracotta transform -rotate-45" />
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-turquoise transform -rotate-45" />
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gold transform -rotate-45" />
        </div>
      );
    case 'burkutBori':
      return (
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z" fill="#d4a017" opacity="0.9" />
          </svg>
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
            <path d="M4 4 L6 10 C6 10 3 14 3 18 C3 20 5 22 8 22 L10 22 L11 18 L12 22 L13 18 L14 22 L16 22 C19 22 21 20 21 18 C21 14 18 10 18 10 L20 4 L16 8 C14 7 10 7 8 8 Z" fill="#9ca3af" opacity="0.85" />
          </svg>
        </div>
      );
    case 'memory':
      return (
        <div className="grid grid-cols-4 gap-1">
          {['🏔️', '?', '🐎', '?', '?', '🦅', '?', '🏔️', '🐎', '?', '?', '🦅', '?', '?', '?', '?'].map(
            (sym, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm flex items-center justify-center text-[7px] sm:text-[8px] ${
                  sym === '?' ? 'bg-lapis/60' : 'bg-white/80'
                }`}
              >
                {sym !== '?' && sym}
              </div>
            )
          )}
        </div>
      );
    case 'toguzKorgool':
      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-0.5">
            {[9, 7, 5, 8, 6, 4, 9, 3, 7].map((n, i) => (
              <div key={i} className="w-4 h-5 sm:w-5 sm:h-6 bg-white/10 rounded border border-white/20 flex items-center justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-white/70">{n}</span>
              </div>
            ))}
          </div>
          <div className="w-10 h-px bg-white/30" />
          <div className="flex gap-0.5">
            {Array(9).fill(9).map((n, i) => (
              <div key={i} className="w-4 h-5 sm:w-5 sm:h-6 bg-white/20 rounded border border-white/30 flex items-center justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-white/90">{n}</span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export default function LocalSetupPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get('game');
  const [showRules, setShowRules] = useState(false);
  const [memoryConfig, setMemoryConfig] = useState<MemoryGameConfig>({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });

  const selectedGame = gameParam && (GAME_TYPES as readonly string[]).includes(gameParam)
    ? (gameParam as GameType)
    : null;

  // No game selected — go back to home
  if (!selectedGame) {
    router.replace('/');
    return null;
  }

  const handleStart = (playerConfigs: PlayerConfig[]) => {
    const localPlayers = playerConfigs.map((config, idx) => ({
      id: nanoid(8),
      nickname: config.nickname,
      isBot: config.isBot,
      index: idx,
    }));

    sessionStorage.setItem('localGamePlayers', JSON.stringify(localPlayers));
    if (selectedGame === 'memory') {
      sessionStorage.setItem('localGameConfig', JSON.stringify(memoryConfig));
    } else {
      sessionStorage.removeItem('localGameConfig');
    }
    router.push(`/local/${selectedGame}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand relative">
      <CentralAsianPattern variant="suzani" />
      <Header />

      <main className="flex-1 relative z-10 flex flex-col items-center px-4 py-6 sm:py-12">
        {/* Back to home */}
        <div className="w-full max-w-md mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-night-400 hover:text-turquoise transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Link>
        </div>

        {/* Game card */}
        <Card variant="elevated" className="max-w-md w-full overflow-hidden mb-6 sm:mb-8">
          <div className={`relative h-28 sm:h-36 bg-gradient-to-br ${gameGradients[selectedGame]} flex items-center justify-center`}>
            <CentralAsianPattern variant="geometric" className="opacity-15" />
            <button
              onClick={() => setShowRules(true)}
              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
            >
              ?
            </button>
            <div className="relative z-10">
              <GameIcon game={selectedGame} />
            </div>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-night mb-1">
              {t(`home.${selectedGame}.title`)}
            </h1>
            <p className="text-xs sm:text-sm text-night-400">
              {t(`home.${selectedGame}.description`)}
            </p>
          </div>
        </Card>

        {/* Memory grid config */}
        {selectedGame === 'memory' && (
          <div className="max-w-md w-full mb-6">
            <GridConfigSelector value={memoryConfig} onChange={setMemoryConfig} />
          </div>
        )}

        {/* Player setup */}
        <PlayerSetupForm onStart={handleStart} maxPlayers={selectedGame === 'toguzKorgool' ? 2 : 4} />

        {/* Rules modal */}
        <RulesModal gameType={selectedGame} open={showRules} onClose={() => setShowRules(false)} />
      </main>

      <Footer />
    </div>
  );
}
