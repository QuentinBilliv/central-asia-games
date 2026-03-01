'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CentralAsianPattern from '@/components/layout/CentralAsianPattern';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { GameType } from '@/game-logic/types';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const createGame = async (gameType: GameType) => {
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType }),
      });
      const data = await res.json();
      if (data.roomId) {
        router.push(`/room/${data.roomId}?game=${gameType}`);
      }
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand relative">
      <CentralAsianPattern variant="suzani" />
      <Header />

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-night mb-3 sm:mb-4">
            {t('home.title')}
          </h1>
          <p className="text-base sm:text-lg text-night-400 max-w-md mx-auto px-2">
            {t('home.subtitle')}
          </p>
          <div className="mt-3 sm:mt-4 w-20 sm:w-24 h-1 bg-gradient-to-r from-turquoise via-gold to-lapis mx-auto rounded-full" />
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full">
          {/* Azul Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('azul')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-lapis to-turquoise overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {['bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise', 'bg-night-400', 'bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise'].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${color} rounded-sm shadow-md transform transition-transform group-hover:scale-110 duration-300`}
                        style={{ transitionDelay: `${i * 30}ms` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.azul.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.azul.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-turquoise font-medium bg-turquoise-50 px-2 py-1 rounded">
                  {t('home.azul.players')}
                </span>
                <span className="text-sm font-medium text-turquoise">
                  {t('home.play')}
                </span>
              </div>
            </div>
          </Card>

          {/* Petits Chevaux Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('petitsChevaux')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-gold to-terracotta overflow-hidden">
              <CentralAsianPattern variant="ikat" className="opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-white/40 rounded-lg rotate-45 relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-lapis shadow transform -rotate-45" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-terracotta shadow transform -rotate-45" />
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-turquoise shadow transform -rotate-45" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gold shadow transform -rotate-45" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold text-night">6</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.petitsChevaux.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.petitsChevaux.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gold-600 font-medium bg-gold-50 px-2 py-1 rounded">
                  {t('home.petitsChevaux.players')}
                </span>
                <span className="text-sm font-medium text-gold-600">
                  {t('home.play')}
                </span>
              </div>
            </div>
          </Card>

          {/* Bürküt & Böri Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('burkutBori')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69] overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-4">
                {/* Eagle */}
                <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -translate-y-2 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z"
                    fill="#d4a017" opacity="0.9"
                  />
                </svg>
                {/* Wolf */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14 transform translate-y-2 group-hover:scale-110 transition-transform duration-300 delay-75" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4 L6 10 C6 10 3 14 3 18 C3 20 5 22 8 22 L10 22 L11 18 L12 22 L13 18 L14 22 L16 22 C19 22 21 20 21 18 C21 14 18 10 18 10 L20 4 L16 8 C14 7 10 7 8 8 Z"
                    fill="#9ca3af" opacity="0.85"
                  />
                </svg>
              </div>
              {/* Stars decoration */}
              <div className="absolute top-3 left-4 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-4 left-8 w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.burkutBori.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.burkutBori.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7c3aed] font-medium bg-purple-50 px-2 py-1 rounded">
                  {t('home.burkutBori.players')}
                </span>
                <span className="text-sm font-medium text-[#7c3aed]">
                  {t('home.play')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Game mode selection modal */}
        <Modal
          open={selectedGame !== null}
          onClose={() => setSelectedGame(null)}
          title={t('home.chooseMode')}
        >
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-3"
              onClick={() => {
                createGame(selectedGame!);
                setSelectedGame(null);
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {t('home.playOnline')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={() => {
                router.push(`/local?game=${selectedGame}`);
                setSelectedGame(null);
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {t('home.playLocally')}
            </Button>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
