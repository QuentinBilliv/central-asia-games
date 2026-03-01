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

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<'azul' | 'petitsChevaux' | null>(null);

  const createGame = async (gameType: 'azul' | 'petitsChevaux') => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl w-full">
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
                  <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transform group-hover:rotate-[360deg] transition-transform duration-700">
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
