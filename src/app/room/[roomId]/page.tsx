'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import CentralAsianPattern from '@/components/layout/CentralAsianPattern';
import NicknameForm from '@/components/lobby/NicknameForm';
import PlayerList from '@/components/lobby/PlayerList';
import InviteLink from '@/components/lobby/InviteLink';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GridConfigSelector from '@/components/memory/GridConfigSelector';
import { useGameSocket } from '@/socket/useGameSocket';
import { useLobbyStore } from '@/store/useLobbyStore';
import { SERVER_EVENTS } from '@/socket/events';
import { getSocket } from '@/socket/client';
import { GameType, MemoryGameConfig } from '@/game-logic/types';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/game-logic/memory/constants';
import { clientGameRegistry } from '@/client/gameRegistry';

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const gameTypeFromUrl = (searchParams.get('game') as GameType) || 'petitsChevaux';
  const t = useTranslations();

  const { connected, playerId, joinRoom, leaveRoom, startGame, sendMove, restartGame } =
    useGameSocket(roomId);

  const { players, hostId, status, gameType, joined, error } = useLobbyStore();
  const [gameState, setGameState] = useState<any>(null);
  const [memoryConfig, setMemoryConfig] = useState<MemoryGameConfig>({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });

  // Effective game type: from lobby state or URL
  const effectiveGameType = gameType || gameTypeFromUrl;
  const { Board } = clientGameRegistry[effectiveGameType];

  // Listen for game events
  useEffect(() => {
    const socket = getSocket();

    const handleGameStarted = (data: any) => {
      useLobbyStore.getState().setRoom({
        ...useLobbyStore.getState(),
        status: 'playing',
        id: roomId,
        gameType: effectiveGameType,
        players: data.players,
        hostId: useLobbyStore.getState().hostId,
        maxPlayers: 4,
      });
      setGameState(data.gameState);
    };

    const handleGameOver = (data: any) => setGameState(data.gameState);

    socket.on(SERVER_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(SERVER_EVENTS.GAME_STATE_UPDATE, setGameState);
    socket.on(SERVER_EVENTS.GAME_OVER, handleGameOver);

    return () => {
      socket.off(SERVER_EVENTS.GAME_STARTED, handleGameStarted);
      socket.off(SERVER_EVENTS.GAME_STATE_UPDATE, setGameState);
      socket.off(SERVER_EVENTS.GAME_OVER, handleGameOver);
    };
  }, [roomId, effectiveGameType]);

  const handleJoin = (nickname: string) => {
    joinRoom(nickname, effectiveGameType);
  };

  const isHost = playerId === hostId;
  const canStart = isHost && players.length >= 2;

  // Render game if playing
  if (status === 'playing' || gameState) {
    return (
      <div className="min-h-screen flex flex-col bg-night">
        <Header />
        <main className="flex-1 relative">
          {gameState && (
            <Board
              gameState={gameState}
              playerId={playerId}
              players={players}
              onMove={sendMove}
              onRestart={restartGame}
              isHost={isHost}
            />
          )}
        </main>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="min-h-screen flex flex-col bg-sand relative">
      <CentralAsianPattern variant="suzani" />
      <Header />

      <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-8">
        <Card variant="elevated" className="max-w-md w-full p-6">
          <h1 className="font-serif text-2xl font-bold text-night mb-6 text-center">
            {t('lobby.title')}
          </h1>

          {!joined ? (
            <NicknameForm onSubmit={handleJoin} error={error} />
          ) : (
            <div className="space-y-6">
              <PlayerList
                players={players}
                hostId={hostId}
                currentPlayerId={playerId}
              />

              <InviteLink roomId={roomId} />

              {error && (
                <p className="text-sm text-terracotta text-center">{error}</p>
              )}

              {effectiveGameType === 'memory' && isHost && (
                <GridConfigSelector value={memoryConfig} onChange={setMemoryConfig} />
              )}

              {canStart ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    startGame(effectiveGameType === 'memory' ? memoryConfig : undefined)
                  }
                >
                  {t('lobby.startGame')}
                </Button>
              ) : isHost ? (
                <p className="text-center text-sm text-night-400">
                  {t('lobby.minPlayers', { min: 2 })}
                </p>
              ) : (
                <p className="text-center text-sm text-night-400">
                  {t('lobby.waitingForPlayers')}
                </p>
              )}
            </div>
          )}

          {!connected && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-night-400">
                <div className="w-2 h-2 bg-terracotta rounded-full animate-pulse" />
                {t('common.loading')}
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
