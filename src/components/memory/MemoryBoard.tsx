'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MemoryGameState, MemoryMove, Player } from '@/game-logic/types';
import { playerColors } from '@/lib/design-tokens';
import Button from '@/components/ui/Button';
import MemoryCard from './MemoryCard';

const MISMATCH_REVEAL_MS = 1000;
const VICTORY_DELAY_MS = 1200; // let the last card flip animate before showing results

interface Props {
  gameState: MemoryGameState;
  playerId: string;
  players: Player[];
  onMove: (move: MemoryMove) => void;
  onRestart: () => void;
  isHost: boolean;
}

export default function MemoryBoard({ gameState, playerId, players, onMove, onRestart, isHost }: Props) {
  const t = useTranslations('memory');
  const tCommon = useTranslations('common');

  // Cards that the client should visually flip back (after mismatch delay)
  const [hiddenOverride, setHiddenOverride] = useState<Set<number>>(new Set());
  // Lock interactions during the mismatch reveal delay
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPendingRef = useRef<[number, number] | null>(null);

  // Delay victory overlay so the last card flip animation plays out
  const [showVictory, setShowVictory] = useState(false);
  const prevGameOverRef = useRef(false);
  const victoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect when a new pendingReset appears → show cards 1s then flip back
  useEffect(() => {
    const prev = prevPendingRef.current;
    const curr = gameState.pendingReset;
    prevPendingRef.current = curr;

    // New mismatch detected
    if (curr && (!prev || prev[0] !== curr[0] || prev[1] !== curr[1])) {
      // Clear any previous override / timer
      if (timerRef.current) clearTimeout(timerRef.current);
      setHiddenOverride(new Set());
      setIsLocked(true);

      timerRef.current = setTimeout(() => {
        setHiddenOverride(new Set(curr));
        setIsLocked(false);
        timerRef.current = null;
      }, MISMATCH_REVEAL_MS);
    }

    // pendingReset cleared (next player flipped) → clean up override
    if (!curr && prev) {
      setHiddenOverride(new Set());
      setIsLocked(false);
    }
  }, [gameState.pendingReset]);

  // Detect gameOver transition → delay victory overlay
  useEffect(() => {
    const wasOver = prevGameOverRef.current;
    prevGameOverRef.current = gameState.gameOver;

    if (gameState.gameOver && !wasOver) {
      victoryTimerRef.current = setTimeout(() => {
        setShowVictory(true);
        victoryTimerRef.current = null;
      }, VICTORY_DELAY_MS);
    }
    if (!gameState.gameOver && wasOver) {
      // Game restarted
      setShowVictory(false);
    }
  }, [gameState.gameOver]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (victoryTimerRef.current) clearTimeout(victoryTimerRef.current);
    };
  }, []);

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerId === playerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const canInteract = isMyTurn && !gameState.gameOver && !isLocked;

  const handleFlip = (cardIndex: number) => {
    if (!canInteract) return;
    onMove({ type: 'flip', cardIndex });
  };

  const totalPairs = gameState.cards.length / 2;

  // Victory overlay (delayed to let the last flip animate)
  if (showVictory) {
    const winnerPlayer = gameState.winner
      ? players.find((p) => p.id === gameState.winner)
      : null;

    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto p-4">
        {/* Final scores */}
        <div className="flex gap-4 flex-wrap justify-center">
          {gameState.players.map((ps) => {
            const p = players.find((pl) => pl.id === ps.playerId);
            const colorSet = playerColors[(p?.index ?? 0) as keyof typeof playerColors];
            return (
              <div
                key={ps.playerId}
                className="rounded-xl px-4 py-3 text-center min-w-[120px]"
                style={{ backgroundColor: colorSet.bg, border: `2px solid ${colorSet.light}` }}
              >
                <div className="text-sm font-medium" style={{ color: colorSet.light }}>
                  {p?.nickname ?? '?'}
                  {ps.playerId === playerId && ` (${tCommon('you')})`}
                </div>
                <div className="text-2xl font-bold text-white mt-1">{ps.pairsFound}</div>
                <div className="text-xs text-white/60">{t('pairs')}</div>
              </div>
            );
          })}
        </div>

        {/* Victory message */}
        <div
          className="text-center"
          style={{ animation: 'memory-victory-text 0.8s ease-out' }}
        >
          <div className="text-3xl sm:text-4xl font-serif font-bold text-gold mb-2">
            {winnerPlayer ? t('winner', { name: winnerPlayer.nickname }) : t('tie')}
          </div>
        </div>

        {isHost && (
          <Button onClick={onRestart} size="lg" className="mt-2">
            {tCommon('restart')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto p-2 sm:p-4">
      {/* Status bar */}
      <div className="flex items-center gap-3 text-white">
        <div
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={isMyTurn
            ? { backgroundColor: 'rgba(13,148,136,0.3)', animation: 'memory-turn-glow 2s infinite' }
            : { backgroundColor: 'rgba(255,255,255,0.1)' }
          }
        >
          {isMyTurn ? t('yourTurn') : t('opponentTurn', { name: currentPlayer?.nickname ?? '?' })}
        </div>
        {gameState.firstFlippedIndex !== null && (
          <div className="px-3 py-1 rounded-full text-xs bg-gold/20 text-gold">
            {t('flipSecond')}
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="flex gap-3 flex-wrap justify-center">
        {gameState.players.map((ps) => {
          const p = players.find((pl) => pl.id === ps.playerId);
          const colorSet = playerColors[(p?.index ?? 0) as keyof typeof playerColors];
          const isActive = ps.playerId === currentPlayerId;
          return (
            <div
              key={ps.playerId}
              className={`rounded-lg px-3 py-1.5 text-center transition-all ${
                isActive ? 'ring-2 ring-turquoise scale-105' : ''
              }`}
              style={{ backgroundColor: colorSet.bg }}
            >
              <div className="text-xs" style={{ color: colorSet.light }}>
                {p?.nickname ?? '?'}
                {ps.playerId === playerId && ` (${tCommon('you')})`}
              </div>
              <div className="text-lg font-bold text-white">
                {ps.pairsFound}/{totalPairs}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card grid */}
      <div
        className="grid gap-1.5 sm:gap-2 md:gap-3 justify-center"
        style={{ gridTemplateColumns: `repeat(${gameState.cols}, auto)` }}
      >
        {gameState.cards.map((card) => (
          <MemoryCard
            key={card.index}
            card={card}
            gridSize={Math.max(gameState.rows, gameState.cols)}
            onClick={() => handleFlip(card.index)}
            disabled={!canInteract}
            forceHidden={hiddenOverride.has(card.index)}
          />
        ))}
      </div>
    </div>
  );
}
