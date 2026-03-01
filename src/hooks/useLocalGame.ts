'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameType, Player } from '@/game-logic/types';
import { clientGameRegistry } from '@/client/gameRegistry';

export interface LocalPlayer {
  id: string;
  nickname: string;
  isBot: boolean;
  index: number;
}

export function useLocalGame(gameType: GameType, localPlayers: LocalPlayer[]) {
  const [gameState, setGameState] = useState<any>(null);
  const [previousPlayerId, setPreviousPlayerId] = useState<string | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handler = clientGameRegistry[gameType];

  const players: Player[] = localPlayers.map((lp) => ({
    id: lp.id,
    nickname: lp.nickname,
    connected: true,
    index: lp.index,
  }));

  const activePlayerId = gameState
    ? gameState.turnOrder[gameState.currentPlayerIndex]
    : null;

  const startGame = useCallback(() => {
    setGameState(handler.createInitialState(players));
    setPreviousPlayerId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, JSON.stringify(localPlayers)]);

  const sendMove = useCallback(
    (move: any) => {
      if (!gameState || !activePlayerId) return;

      const prevId = activePlayerId;
      const result = handler.validateAndApplyMove(gameState, activePlayerId, move);

      if (result.valid) {
        setPreviousPlayerId(prevId);
        setGameState(result.state);
      }
    },
    [gameState, activePlayerId, handler]
  );

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Bot auto-play
  useEffect(() => {
    if (!gameState || handler.isGameOver(gameState)) return;

    const currentId = gameState.turnOrder[gameState.currentPlayerIndex];
    const currentLocal = localPlayers.find((lp) => lp.id === currentId);
    if (!currentLocal?.isBot) return;

    // Compute delay so the bot waits for any step-by-step animation to finish.
    // BurkutBori: 650ms dice spin/reveal + 280ms/step + eagle/wolf pause.
    let delay = 800;
    if (gameState.type === 'burkutBori' && gameState.lastMove) {
      const lm = gameState.lastMove;
      delay = 600 + lm.diceValue * 300 + 500;
      if (lm.hitEagle || lm.hitWolf) {
        delay += 1000;
      }
    }

    botTimeoutRef.current = setTimeout(() => {
      const move = handler.pickBotMove(gameState, currentId);

      if (move) {
        sendMove(move);
      }
    }, delay);

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, [gameState, handler, localPlayers, sendMove]);

  return {
    gameState,
    activePlayerId,
    previousPlayerId,
    players,
    sendMove,
    restartGame,
    startGame,
  };
}
