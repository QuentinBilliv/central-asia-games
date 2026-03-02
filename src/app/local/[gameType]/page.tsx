'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GameType } from '@/game-logic/types';
import { useLocalGame, LocalPlayer } from '@/hooks/useLocalGame';
import { clientGameRegistry } from '@/client/gameRegistry';
import TurnTransitionScreen from '@/components/local/TurnTransitionScreen';
import Button from '@/components/ui/Button';

export default function LocalGamePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('local');
  const gameType = params.gameType as GameType;
  const { Board } = clientGameRegistry[gameType];

  const [localPlayers, setLocalPlayers] = useState<LocalPlayer[] | null>(null);
  const [gameConfig, setGameConfig] = useState<any>(undefined);
  const [showTransition, setShowTransition] = useState(false);
  const hasStarted = useRef(false);

  // Read players and config from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('localGamePlayers');
    if (!stored) {
      router.replace('/local');
      return;
    }
    try {
      const parsed = JSON.parse(stored) as LocalPlayer[];
      setLocalPlayers(parsed);
    } catch {
      router.replace('/local');
    }

    const storedConfig = sessionStorage.getItem('localGameConfig');
    if (storedConfig) {
      try {
        setGameConfig(JSON.parse(storedConfig));
      } catch { /* ignore */ }
    }
  }, [router]);

  const {
    gameState,
    activePlayerId,
    previousPlayerId,
    players,
    sendMove,
    restartGame,
    startGame,
  } = useLocalGame(gameType, localPlayers || [], gameConfig);

  // Auto-start game once players are loaded
  useEffect(() => {
    if (localPlayers && localPlayers.length > 0 && !hasStarted.current) {
      hasStarted.current = true;
      startGame();
    }
  }, [localPlayers, startGame]);

  // Handle turn transition screen for hot-seat
  useEffect(() => {
    if (!gameState || !activePlayerId || !localPlayers) return;
    if (gameState.winner || ('gameOver' in gameState && gameState.gameOver)) return;

    const currentLocal = localPlayers.find((p) => p.id === activePlayerId);
    const previousLocal = previousPlayerId
      ? localPlayers.find((p) => p.id === previousPlayerId)
      : null;

    // Show transition only when:
    // - 2+ human players
    // - Current player is human
    // - Previous player was a different human
    const humanCount = localPlayers.filter((p) => !p.isBot).length;
    if (humanCount < 2) return;
    if (!currentLocal || currentLocal.isBot) return;
    if (!previousLocal || previousLocal.isBot) return;
    if (previousPlayerId === activePlayerId) return;

    setShowTransition(true);
  }, [activePlayerId, previousPlayerId, gameState, localPlayers]);

  if (!localPlayers || !gameState) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center text-white">
        {t('loading' as any) || 'Loading...'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night relative p-2 sm:p-4">
      {/* Back link */}
      <div className="absolute top-4 left-4 sm:top-3 sm:left-3 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/local')}
          className="text-white/70 hover:text-white"
        >
          &larr; {t('backToSetup')}
        </Button>
      </div>

      {/* Turn transition overlay */}
      {showTransition && (
        <TurnTransitionScreen
          playerName={
            localPlayers.find((p) => p.id === activePlayerId)?.nickname || ''
          }
          onReady={() => setShowTransition(false)}
        />
      )}

      {/* Game board */}
      <div className="flex items-center justify-center min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-32px)]">
        <Board
          gameState={gameState}
          playerId={activePlayerId!}
          players={players}
          onMove={sendMove}
          onRestart={restartGame}
          isHost={true}
        />
      </div>
    </div>
  );
}
