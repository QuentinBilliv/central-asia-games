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
import { GameType, GAME_TYPES } from '@/game-logic/types';

export default function LocalSetupPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get('game');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(
    gameParam && (GAME_TYPES as readonly string[]).includes(gameParam) ? (gameParam as GameType) : null
  );

  const handleStart = (playerConfigs: PlayerConfig[]) => {
    if (!selectedGame) return;

    const localPlayers = playerConfigs.map((config, idx) => ({
      id: nanoid(8),
      nickname: config.nickname,
      isBot: config.isBot,
      index: idx,
    }));

    sessionStorage.setItem('localGamePlayers', JSON.stringify(localPlayers));
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

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-night mb-2">
            {t('local.title')}
          </h1>
          <p className="text-sm sm:text-base text-night-400">{t('local.subtitle')}</p>
          <div className="mt-3 w-20 h-1 bg-gradient-to-r from-turquoise via-gold to-lapis mx-auto rounded-full" />
        </div>

        {/* Game selection */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl w-full mb-6 sm:mb-8">
          <Card
            variant="game"
            className={`cursor-pointer text-center p-3 sm:p-4 transition-all ${
              selectedGame === 'azul'
                ? 'ring-2 ring-turquoise border-turquoise'
                : ''
            }`}
            onClick={() => setSelectedGame('azul')}
          >
            <div className="h-14 sm:h-16 bg-gradient-to-br from-lapis to-turquoise rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                {['bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise', 'bg-night-400', 'bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise'].map(
                  (color, i) => (
                    <div key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${color} rounded-sm`} />
                  )
                )}
              </div>
            </div>
            <h3 className="font-serif font-bold text-night text-sm sm:text-base">
              {t('home.azul.title')}
            </h3>
          </Card>

          <Card
            variant="game"
            className={`cursor-pointer text-center p-3 sm:p-4 transition-all ${
              selectedGame === 'petitsChevaux'
                ? 'ring-2 ring-turquoise border-turquoise'
                : ''
            }`}
            onClick={() => setSelectedGame('petitsChevaux')}
          >
            <div className="h-14 sm:h-16 bg-gradient-to-br from-gold to-terracotta rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/40 rounded-lg rotate-45 relative">
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-lapis transform -rotate-45" />
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-terracotta transform -rotate-45" />
                <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-turquoise transform -rotate-45" />
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gold transform -rotate-45" />
              </div>
            </div>
            <h3 className="font-serif font-bold text-night text-sm sm:text-base">
              {t('home.petitsChevaux.title')}
            </h3>
          </Card>

          <Card
            variant="game"
            className={`cursor-pointer text-center p-3 sm:p-4 transition-all ${
              selectedGame === 'burkutBori'
                ? 'ring-2 ring-turquoise border-turquoise'
                : ''
            }`}
            onClick={() => setSelectedGame('burkutBori')}
          >
            <div className="h-14 sm:h-16 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69] rounded-lg mb-2 sm:mb-3 flex items-center justify-center gap-1.5">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z"
                  fill="#d4a017" opacity="0.9"
                />
              </svg>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4 L6 10 C6 10 3 14 3 18 C3 20 5 22 8 22 L10 22 L11 18 L12 22 L13 18 L14 22 L16 22 C19 22 21 20 21 18 C21 14 18 10 18 10 L20 4 L16 8 C14 7 10 7 8 8 Z"
                  fill="#9ca3af" opacity="0.85"
                />
              </svg>
            </div>
            <h3 className="font-serif font-bold text-night text-sm sm:text-base">
              {t('home.burkutBori.title')}
            </h3>
          </Card>
        </div>

        {/* Player setup */}
        {selectedGame && <PlayerSetupForm onStart={handleStart} />}
      </main>

      <Footer />
    </div>
  );
}
