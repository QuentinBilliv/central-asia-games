'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameType,
  Player,
  AzulGameState,
  AzulMove,
  PetitsChevauxGameState,
  PetitsChevauxMove,
} from '@/game-logic/types';
import { createInitialState as createAzulState } from '@/game-logic/azul/state';
import { validateAndApplyMove as azulApplyMove } from '@/game-logic/azul/moves';
import { createInitialState as createPCState } from '@/game-logic/petitsChevaux/state';
import { validateAndApplyMove as pcApplyMove } from '@/game-logic/petitsChevaux/moves';
import { pickAzulBotMove, pickPetitsChevauxBotMove } from '@/game-logic/bot';

export interface LocalPlayer {
  id: string;
  nickname: string;
  isBot: boolean;
  index: number;
}

type GameState = AzulGameState | PetitsChevauxGameState;

export function useLocalGame(gameType: GameType, localPlayers: LocalPlayer[]) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [previousPlayerId, setPreviousPlayerId] = useState<string | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (gameType === 'azul') {
      setGameState(createAzulState(players));
    } else {
      setGameState(createPCState(players));
    }
    setPreviousPlayerId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, JSON.stringify(localPlayers)]);

  const sendMove = useCallback(
    (move: AzulMove | PetitsChevauxMove) => {
      if (!gameState || !activePlayerId) return;

      const prevId = activePlayerId;
      let result;

      if (gameType === 'azul') {
        result = azulApplyMove(
          gameState as AzulGameState,
          activePlayerId,
          move as AzulMove
        );
      } else {
        result = pcApplyMove(
          gameState as PetitsChevauxGameState,
          activePlayerId,
          move as PetitsChevauxMove
        );
      }

      if (result.valid) {
        setPreviousPlayerId(prevId);
        setGameState(result.state);
      }
    },
    [gameState, activePlayerId, gameType]
  );

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Bot auto-play
  useEffect(() => {
    if (!gameState || gameState.winner || ('gameOver' in gameState && gameState.gameOver)) return;

    const currentId = gameState.turnOrder[gameState.currentPlayerIndex];
    const currentLocal = localPlayers.find((lp) => lp.id === currentId);
    if (!currentLocal?.isBot) return;

    botTimeoutRef.current = setTimeout(() => {
      let move: AzulMove | PetitsChevauxMove | null = null;

      if (gameType === 'azul') {
        move = pickAzulBotMove(gameState as AzulGameState, currentId);
      } else {
        move = pickPetitsChevauxBotMove(
          gameState as PetitsChevauxGameState,
          currentId
        );
      }

      if (move) {
        sendMove(move);
      }
    }, 800);

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, [gameState, gameType, localPlayers, sendMove]);

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
