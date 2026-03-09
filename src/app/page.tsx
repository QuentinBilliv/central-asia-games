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
import RulesModal from '@/components/rules/RulesModal';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [rulesGame, setRulesGame] = useState<GameType | null>(null);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 max-w-7xl w-full">
          {/* Azul Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('azul')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-lapis to-turquoise overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-20" />
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('azul'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
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
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('petitsChevaux'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
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
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('burkutBori'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
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

          {/* Memory Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('memory')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-turquoise to-gold overflow-hidden">
              <CentralAsianPattern variant="ikat" className="opacity-15" />
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('memory'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {['🏔️', '🐎', '?', '🦅', '?', '🐫', '🐎', '?', '🏔️', '?', '🐫', '🦅', '?', '?', '?', '?'].map(
                    (sym, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md shadow-md flex items-center justify-center text-xs sm:text-sm transform transition-transform group-hover:scale-110 duration-300 ${
                          sym === '?'
                            ? 'bg-gradient-to-br from-lapis to-turquoise'
                            : 'bg-white/90'
                        }`}
                        style={{ transitionDelay: `${i * 30}ms` }}
                      >
                        {sym === '?' ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border border-white/40 rounded-sm rotate-45" />
                        ) : (
                          sym
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.memory.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.memory.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-turquoise font-medium bg-turquoise-50 px-2 py-1 rounded">
                  {t('home.memory.players')}
                </span>
                <span className="text-sm font-medium text-turquoise">
                  {t('home.play')}
                </span>
              </div>
            </div>
          </Card>
          {/* Toguz Korgool Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('toguzKorgool')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-[#78350f] to-[#d4a017] overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-15" />
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('toguzKorgool'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  {/* Top row (opponent) */}
                  <div className="flex gap-1">
                    {[9, 7, 5, 8, 6, 4, 9, 3, 7].map((n, i) => (
                      <div
                        key={`t-${i}`}
                        className="w-5 h-6 sm:w-6 sm:h-7 bg-white/10 rounded border border-white/20 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-300"
                        style={{ transitionDelay: `${i * 30}ms` }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/70">{n}</span>
                      </div>
                    ))}
                  </div>
                  {/* Separator */}
                  <div className="w-16 h-px bg-white/30" />
                  {/* Bottom row (player) */}
                  <div className="flex gap-1">
                    {[9, 9, 9, 9, 9, 9, 9, 9, 9].map((n, i) => (
                      <div
                        key={`b-${i}`}
                        className="w-5 h-6 sm:w-6 sm:h-7 bg-white/20 rounded border border-white/30 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-300"
                        style={{ transitionDelay: `${(i + 9) * 30}ms` }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/90">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.toguzKorgool.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.toguzKorgool.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#78350f] font-medium bg-amber-50 px-2 py-1 rounded">
                  {t('home.toguzKorgool.players')}
                </span>
                <span className="text-sm font-medium text-[#78350f]">
                  {t('home.play')}
                </span>
              </div>
            </div>
          </Card>
          {/* Backgammon Card */}
          <Card variant="game" className="group" onClick={() => setSelectedGame('backgammon')}>
            <div className="relative h-36 sm:h-48 bg-gradient-to-br from-[#2a1810] to-[#5c3a1e] overflow-hidden">
              <CentralAsianPattern variant="geometric" className="opacity-10" />
              <button
                onClick={(e) => { e.stopPropagation(); setRulesGame('backgammon'); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold transition-colors"
              >
                ?
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  {/* Triangles */}
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={`t-${i}`}
                        className={`w-4 h-10 sm:w-5 sm:h-12 ${i % 2 === 0 ? 'bg-terracotta/70' : 'bg-turquoise/70'} transform transition-transform group-hover:scale-110 duration-300`}
                        style={{
                          clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                          transitionDelay: `${i * 40}ms`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Checkers */}
                  <div className="flex gap-2">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <div key={`g-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold border-2 border-white/30 shadow-md transform transition-transform group-hover:scale-110 duration-300" style={{ transitionDelay: `${(i + 6) * 40}ms` }} />
                      ))}
                    </div>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <div key={`l-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-lapis border-2 border-white/30 shadow-md transform transition-transform group-hover:scale-110 duration-300" style={{ transitionDelay: `${(i + 9) * 40}ms` }} />
                      ))}
                    </div>
                  </div>
                  {/* Bottom triangles */}
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={`b-${i}`}
                        className={`w-4 h-10 sm:w-5 sm:h-12 ${i % 2 === 0 ? 'bg-turquoise/70' : 'bg-terracotta/70'} transform transition-transform group-hover:scale-110 duration-300`}
                        style={{
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                          transitionDelay: `${(i + 12) * 40}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-night mb-1.5 sm:mb-2">
                {t('home.backgammon.title')}
              </h2>
              <p className="text-xs sm:text-sm text-night-400 mb-2 sm:mb-3">
                {t('home.backgammon.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5c3a1e] font-medium bg-amber-50 px-2 py-1 rounded">
                  {t('home.backgammon.players')}
                </span>
                <span className="text-sm font-medium text-[#5c3a1e]">
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

        {/* Rules modal */}
        {rulesGame && (
          <RulesModal
            gameType={rulesGame}
            open={true}
            onClose={() => setRulesGame(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
