'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

interface Props {
  playerName: string;
  onReady: () => void;
}

export default function TurnTransitionScreen({ playerName, onReady }: Props) {
  const t = useTranslations('local');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/90 backdrop-blur-sm px-6">
      <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
        <p className="text-xl sm:text-2xl md:text-3xl text-white font-serif leading-snug">
          {t('passDevice', { name: playerName })}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onReady}
          className="text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4"
        >
          {t('imReady')}
        </Button>
      </div>
    </div>
  );
}
