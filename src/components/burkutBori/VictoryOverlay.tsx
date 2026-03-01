import { useTranslations } from 'next-intl';

export default function VictoryOverlay({ winnerName, winnerColor }: { winnerName: string; winnerColor: string }) {
  const t = useTranslations('burkutBori');
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden animate-[bb-victory-in_0.5s_ease-out]">
      <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" />
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-[bb-confetti_3s_ease-in_forwards]"
          style={{
            left: `${5 + (i * 3.1) % 90}%`,
            top: '-4px',
            backgroundColor: ['#d4a017', '#0d9488', '#c2410c', '#1e40af', '#fbbf24'][i % 5],
            animationDelay: `${(i * 0.08)}s`,
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-[bb-eagle-soar_2s_ease-out_infinite]">
        <svg className="w-14 h-14 sm:w-20 sm:h-20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 C10 6 4 8 2 12 C4 11 6 11 8 12 C6 14 5 18 6 22 C8 19 10 17 12 16 C14 17 16 19 18 22 C19 18 18 14 16 12 C18 11 20 11 22 12 C20 8 14 6 12 2Z"
            fill={winnerColor} opacity="0.9"
          />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-[bb-victory-text_0.6s_ease-out_0.3s_both]">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2"
            style={{ textShadow: `0 0 30px ${winnerColor}60` }}>
            {t('winner', { name: winnerName })}
          </p>
        </div>
      </div>
    </div>
  );
}
