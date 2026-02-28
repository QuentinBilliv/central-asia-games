'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CentralAsianPattern from '@/components/layout/CentralAsianPattern';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const createGame = async (gameType: 'azul' | 'petitsChevaux') => {
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType }),
      });
      const data = await res.json();
      if (data.roomId) {
        router.push(`/${locale}/room/${data.roomId}?game=${gameType}`);
      }
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand relative">
      <CentralAsianPattern variant="suzani" />
      <Header />

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-night mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-night-400 max-w-md mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-turquoise via-gold to-lapis mx-auto rounded-full" />
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Azul Card */}
          <Card variant="game" className="group" onClick={() => createGame('azul')}>
            <div className="relative h-48 bg-gradient-to-br from-lapis to-turquoise overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2">
                  {['bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise', 'bg-night-400', 'bg-lapis', 'bg-gold', 'bg-terracotta', 'bg-turquoise'].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 ${color} rounded-sm shadow-md transform transition-transform group-hover:scale-110 duration-300`}
                        style={{ transitionDelay: `${i * 30}ms` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-serif text-xl font-bold text-night mb-2">
                {t('home.azul.title')}
              </h2>
              <p className="text-sm text-night-400 mb-3">
                {t('home.azul.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-turquoise font-medium bg-turquoise-50 px-2 py-1 rounded">
                  {t('home.azul.players')}
                </span>
                <Button size="sm" variant="primary">
                  {t('home.createGame')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Petits Chevaux Card */}
          <Card variant="game" className="group" onClick={() => createGame('petitsChevaux')}>
            <div className="relative h-48 bg-gradient-to-br from-gold to-terracotta overflow-hidden">
              <CentralAsianPattern variant="ikat" className="opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Simplified board preview */}
                  <div className="w-24 h-24 border-2 border-white/40 rounded-lg rotate-45 relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-lapis shadow transform -rotate-45" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-terracotta shadow transform -rotate-45" />
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-turquoise shadow transform -rotate-45" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow transform -rotate-45" />
                  </div>
                  {/* Dice */}
                  <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transform group-hover:rotate-[360deg] transition-transform duration-700">
                    <span className="text-lg font-bold text-night">6</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-serif text-xl font-bold text-night mb-2">
                {t('home.petitsChevaux.title')}
              </h2>
              <p className="text-sm text-night-400 mb-3">
                {t('home.petitsChevaux.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gold-600 font-medium bg-gold-50 px-2 py-1 rounded">
                  {t('home.petitsChevaux.players')}
                </span>
                <Button size="sm" variant="secondary">
                  {t('home.createGame')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
