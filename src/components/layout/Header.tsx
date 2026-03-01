'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n/routing';

const languages: { code: Locale; flag: string; name: string }[] = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
];

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const switchLocale = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  const openDropdown = useCallback(() => {
    setOpen(true);
    setFocusedIndex(languages.findIndex((l) => l.code === locale));
  }, [locale]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // Focus the active item when dropdown opens or focusedIndex changes
  useEffect(() => {
    if (open && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keyboard navigation
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((index + 1) % languages.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((index - 1 + languages.length) % languages.length);
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
  };

  return (
    <header className="relative z-20 border-b border-gold-200/50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
          <Image src="/shanyrak.svg" alt="" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="font-serif font-bold text-base sm:text-lg text-night group-hover:text-turquoise transition-colors truncate">
            {t('appName')}
          </span>
        </Link>

        {/* Language dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={triggerRef}
            onClick={() => (open ? closeDropdown() : openDropdown())}
            onKeyDown={handleTriggerKeyDown}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={t('changeLanguage')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 transition-colors text-sm font-medium text-night"
          >
            <span className="text-lg leading-none">{currentLang.flag}</span>
            <svg
              className={`w-4 h-4 text-night-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div
              role="listbox"
              aria-label={t('changeLanguage')}
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gold-200/50 py-1 min-w-[160px]"
              style={{ animation: 'dropdown-in 150ms ease-out' }}
            >
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  role="option"
                  aria-selected={locale === lang.code}
                  onClick={() => switchLocale(lang.code)}
                  onKeyDown={(e) => handleItemKeyDown(e, index)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-turquoise ${
                    locale === lang.code
                      ? 'bg-turquoise-50 text-turquoise font-medium'
                      : 'text-night hover:bg-sand-50'
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden="true">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
