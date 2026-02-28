'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="relative z-10 border-t border-gold-200/50 bg-white/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-night-300">
        <p className="font-serif">{t('appName')}</p>
      </div>
    </footer>
  );
}
