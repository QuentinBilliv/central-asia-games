export default function VictoryOverlay({ winnerName, winnerColor }: { winnerName: string; winnerColor: string }) {
  const confettiColors = ['#d4a017', '#1e40af', '#c2410c', '#0d9488', '#fef9e7', '#f97316', '#3b82f6'];
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl overflow-hidden"
      style={{ animation: 'pc-victory-in 0.6s ease-out forwards' }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${-5 - Math.random() * 10}%`,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            backgroundColor: confettiColors[i % confettiColors.length],
            animation: `pc-confetti ${2.5 + Math.random() * 2.5}s ${Math.random() * 1.5}s ease-in forwards`,
            opacity: 0.9,
          }}
        />
      ))}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <svg
          viewBox="0 0 60 40"
          className="w-12 h-9 sm:w-16 sm:h-12 mx-auto mb-2 sm:mb-3"
          style={{ animation: 'pc-victory-text 0.8s 0.2s ease-out both' }}
        >
          <path
            d="M5,35 L10,12 L20,22 L30,5 L40,22 L50,12 L55,35 Z"
            fill="#d4a017" stroke="#fef9e7" strokeWidth="1.5"
          />
          <circle cx="10" cy="12" r="3" fill="#fef9e7" />
          <circle cx="30" cy="5" r="3" fill="#fef9e7" />
          <circle cx="50" cy="12" r="3" fill="#fef9e7" />
        </svg>
        <h2
          className="text-2xl sm:text-3xl font-serif font-bold mb-1 sm:mb-1.5 drop-shadow-lg"
          style={{
            color: winnerColor,
            animation: 'pc-victory-text 0.8s 0.35s ease-out both',
          }}
        >
          {winnerName}
        </h2>
        <p
          className="text-gold text-sm sm:text-base font-medium tracking-widest uppercase"
          style={{ animation: 'pc-victory-text 0.8s 0.5s ease-out both' }}
        >
          Victory
        </p>
      </div>
    </div>
  );
}
