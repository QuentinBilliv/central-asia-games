'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Locale } from '@/i18n/routing';

export default function Header() {
  const t = useTranslations('common');
  const tLang = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const locales: Locale[] = ['fr', 'ru', 'en'];

  return (
    <header className="relative z-10 border-b border-gold-200/50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href={`/${locale}`} className="flex items-center gap-2 group">
          <span className="text-2xl">🏛️</span>
          <span className="font-serif font-bold text-lg text-night group-hover:text-turquoise transition-colors">
            {t('appName')}
          </span>
        </a>

        <div className="flex items-center gap-1 bg-sand-100 rounded-lg p-1">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                locale === loc
                  ? 'bg-turquoise text-white shadow-sm'
                  : 'text-night-400 hover:text-night hover:bg-white'
              }`}
            >
              {tLang(loc)}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
