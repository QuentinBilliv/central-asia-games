import { PetitsChevauxGameState, PetitsChevauxMove, Horse } from '../types';
import { calculateNewPosition, findCapturedHorse } from './board';
import { EXIT_STABLE_VALUE, HORSES_PER_PLAYER, HOME_STRETCH_LENGTH } from './constants';
import { secureDiceRoll } from '../random';

interface MoveResult {
  valid: boolean;
  state: PetitsChevauxGameState;
  error?: string;
}

export function validateAndApplyMove(
  state: PetitsChevauxGameState,
  playerId: string,
  move: PetitsChevauxMove
): MoveResult {
  const currentPlayer = state.turnOrder[state.currentPlayerIndex];
  if (currentPlayer !== playerId) {
    return { valid: false, state, error: 'Not your turn' };
  }

  if (move.type === 'roll') {
    return handleRoll(state);
  }

  if (move.type === 'moveHorse') {
    return handleMoveHorse(state, playerId, move.horseId!);
  }

  return { valid: false, state, error: 'Invalid move type' };
}

function handleRoll(state: PetitsChevauxGameState): MoveResult {
  if (!state.mustRoll) {
    return { valid: false, state, error: 'Must select a horse to move' };
  }

  const diceValue = secureDiceRoll();
  const rollingPlayerId = state.turnOrder[state.currentPlayerIndex];
  const newState = {
    ...state,
    diceValue,
    mustRoll: false,
    lastRolls: { ...state.lastRolls, [rollingPlayerId]: diceValue },
  };

  // Check if player has any valid moves
  const playerState = newState.players.find(
    (p) => p.playerId === newState.turnOrder[newState.currentPlayerIndex]
  )!;

  const hasValidMove = playerState.horses.some((horse) => {
    if (horse.status === 'stable') return diceValue === EXIT_STABLE_VALUE;
    return calculateNewPosition(horse, diceValue) !== null;
  });

  if (!hasValidMove) {
    // No valid moves - skip to next player
    return { valid: true, state: advanceTurn(newState, diceValue === 6) };
  }

  return { valid: true, state: newState };
}

function handleMoveHorse(
  state: PetitsChevauxGameState,
  playerId: string,
  horseId: number
): MoveResult {
  if (state.mustRoll) {
    return { valid: false, state, error: 'Must roll first' };
  }

  if (state.diceValue === null) {
    return { valid: false, state, error: 'No dice value' };
  }

  const playerIndex = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIndex === -1) {
    return { valid: false, state, error: 'Player not found' };
  }

  const playerState = state.players[playerIndex];
  const horse = playerState.horses.find((h) => h.id === horseId);
  if (!horse) {
    return { valid: false, state, error: 'Horse not found' };
  }

  const newPos = calculateNewPosition(horse, state.diceValue);
  if (!newPos) {
    return { valid: false, state, error: 'Invalid move for this horse' };
  }

  // Deep clone state
  const newState: PetitsChevauxGameState = structuredClone(state);
  const newPlayerState = newState.players[playerIndex];
  const newHorse = newPlayerState.horses.find((h) => h.id === horseId)!;

  // Apply the move
  newHorse.status = newPos.status;
  newHorse.boardPosition = newPos.boardPosition;
  newHorse.homePosition = newPos.homePosition;

  // Check for capture (only on board positions, not home)
  if (newPos.status === 'board') {
    const allHorses = newState.players.flatMap((p) => p.horses);
    const captured = findCapturedHorse(allHorses, newPos.boardPosition, playerState.playerIndex);
    if (captured) {
      // Send captured horse back to stable
      const capturedPlayerState = newState.players.find(
        (p) => p.playerIndex === captured.playerIndex
      )!;
      const capturedHorse = capturedPlayerState.horses.find((h) => h.id === captured.id)!;
      capturedHorse.status = 'stable';
      capturedHorse.boardPosition = -1;
      capturedHorse.homePosition = -1;
    }
  }

  // Update horses home count (only horses at the final home position count)
  if (newPos.status === 'home') {
    newPlayerState.horsesHome = newPlayerState.horses.filter(
      (h) => h.status === 'home' && h.homePosition === HOME_STRETCH_LENGTH - 1
    ).length;

    // Check win condition
    if (newPlayerState.horsesHome === HORSES_PER_PLAYER) {
      newState.winner = playerId;
      return { valid: true, state: newState };
    }
  }

  // Advance turn
  const rolledSix = state.diceValue === 6;
  return { valid: true, state: advanceTurn(newState, rolledSix) };
}

function advanceTurn(state: PetitsChevauxGameState, extraTurn: boolean): PetitsChevauxGameState {
  const newState = { ...state };

  if (extraTurn) {
    // Same player rolls again
    newState.mustRoll = true;
    newState.diceValue = null;
    newState.extraTurn = true;
  } else {
    // Next player
    newState.currentPlayerIndex =
      (newState.currentPlayerIndex + 1) % newState.turnOrder.length;
    newState.mustRoll = true;
    newState.diceValue = null;
    newState.extraTurn = false;
  }

  return newState;
}

export function getValidMoves(
  state: PetitsChevauxGameState,
  playerId: string
): number[] {
  if (state.diceValue === null || state.mustRoll) return [];

  const playerState = state.players.find((p) => p.playerId === playerId);
  if (!playerState) return [];

  return playerState.horses
    .filter((horse) => {
      if (horse.status === 'stable') return state.diceValue === EXIT_STABLE_VALUE;
      return calculateNewPosition(horse, state.diceValue!) !== null;
    })
    .map((h) => h.id);
}
