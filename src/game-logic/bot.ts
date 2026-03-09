import {
  AzulGameState,
  AzulMove,
  AzulTileColor,
  PetitsChevauxGameState,
  PetitsChevauxMove,
  BurkutBoriGameState,
  BurkutBoriMove,
  MemoryGameState,
  MemoryMove,
  ToguzKorgoolGameState,
  ToguzKorgoolMove,
  BackgammonGameState,
  BackgammonMove,
} from './types';
import { getWallColumn } from './azul/scoring';
import { getValidMoves } from './petitsChevaux/moves';
import { getValidMovesForDie } from './backgammon/moves';
import { secureRandomInt } from './random';

/**
 * Pick a random valid Azul move for a bot player.
 * Prefers pattern-line placements over floor dumps.
 */
export function pickAzulBotMove(
  state: AzulGameState,
  playerId: string
): AzulMove | null {
  if (state.phase !== 'picking') return null;

  const board = state.playerBoards.find((b) => b.playerId === playerId);
  if (!board) return null;

  // Collect all available sources (factories + center)
  type Source = { sourceType: 'factory' | 'center'; sourceId: number; colors: AzulTileColor[] };
  const sources: Source[] = [];

  for (const factory of state.factories) {
    if (factory.tiles.length > 0) {
      const uniqueColors = [...new Set(factory.tiles)] as AzulTileColor[];
      sources.push({ sourceType: 'factory', sourceId: factory.id, colors: uniqueColors });
    }
  }
  if (state.center.length > 0) {
    const uniqueColors = [...new Set(state.center)] as AzulTileColor[];
    sources.push({ sourceType: 'center', sourceId: -1, colors: uniqueColors });
  }

  if (sources.length === 0) return null;

  // Enumerate all valid moves
  const patternLineMoves: AzulMove[] = [];
  const floorMoves: AzulMove[] = [];

  for (const source of sources) {
    for (const color of source.colors) {
      // Try each pattern line (0-4)
      for (let lineIdx = 0; lineIdx < 5; lineIdx++) {
        const line = board.patternLines[lineIdx];
        // Line must be empty or same color
        if (line.color !== null && line.color !== color) continue;
        // Line must not be full
        if (line.count >= line.maxCount) continue;
        // Wall position must not already be filled
        const wallCol = getWallColumn(lineIdx, color);
        if (wallCol < 0 || wallCol >= 5) continue;
        if (board.wall[lineIdx][wallCol] !== null) continue;

        patternLineMoves.push({
          type: 'pick',
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          color,
          patternLineIndex: lineIdx,
        });
      }

      // Floor is always valid as a fallback
      floorMoves.push({
        type: 'pick',
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        color,
        patternLineIndex: -1,
      });
    }
  }

  // Prefer pattern-line placements, fall back to floor
  const candidates = patternLineMoves.length > 0 ? patternLineMoves : floorMoves;
  return candidates[secureRandomInt(candidates.length)];
}

/**
 * Pick a move for a Petits Chevaux bot.
 * Rolls if must roll, otherwise picks a random valid horse to move.
 */
export function pickPetitsChevauxBotMove(
  state: PetitsChevauxGameState,
  playerId: string
): PetitsChevauxMove {
  if (state.mustRoll) {
    return { type: 'roll' };
  }

  const validHorses = getValidMoves(state, playerId);
  if (validHorses.length === 0) {
    // Should not happen (game auto-skips when no moves), but fallback
    return { type: 'roll' };
  }

  const horseId = validHorses[secureRandomInt(validHorses.length)];
  return { type: 'moveHorse', horseId };
}

/**
 * Pick a move for a Bürküt & Böri bot.
 * Only action is rolling the die.
 */
export function pickBurkutBoriBotMove(
  _state: BurkutBoriGameState,
  _playerId: string
): BurkutBoriMove {
  return { type: 'roll' };
}

/**
 * Pick a move for a Memory bot.
 * "Fair" bot: picks a random non-matched, non-flipped card.
 */
export function pickMemoryBotMove(
  state: MemoryGameState,
  _playerId: string
): MemoryMove | null {
  const available = state.cards.filter((c) => !c.matched && !c.flipped);
  if (available.length === 0) return null;

  const card = available[secureRandomInt(available.length)];
  return { type: 'flip', cardIndex: card.index };
}

/**
 * Pick a move for a Toguz Korgool bot.
 * Prefers pits with more stones for bigger captures.
 */
export function pickToguzKorgoolBotMove(
  state: ToguzKorgoolGameState,
  _playerId: string
): ToguzKorgoolMove | null {
  const playerIdx = state.currentPlayerIndex;
  const pits = state.players[playerIdx].pits;

  // Get non-empty pits
  const validPits: number[] = [];
  for (let i = 0; i < pits.length; i++) {
    if (pits[i] > 0) validPits.push(i);
  }
  if (validPits.length === 0) return null;

  // Pick randomly among valid pits
  const pitIndex = validPits[secureRandomInt(validPits.length)];
  return { type: 'sow', pitIndex };
}

/**
 * Pick a move for a Backgammon bot.
 * Rolls if must roll, otherwise picks a random valid checker move.
 */
export function pickBackgammonBotMove(
  state: BackgammonGameState,
  _playerId: string
): BackgammonMove | null {
  if (state.mustRoll) {
    return { type: 'roll' };
  }

  const playerIndex = state.currentPlayerIndex;

  // Try each remaining die and collect all valid moves
  const allMoves: { from: number; to: number; die: number }[] = [];
  for (const die of state.remainingMoves) {
    const moves = getValidMovesForDie(state, playerIndex, die);
    for (const m of moves) {
      allMoves.push({ ...m, die });
    }
  }

  if (allMoves.length === 0) {
    return { type: 'endTurn' };
  }

  // Prefer bearing off, then hitting, then random
  const bearOff = allMoves.filter((m) => m.to === 25);
  if (bearOff.length > 0) {
    const pick = bearOff[secureRandomInt(bearOff.length)];
    return { type: 'move', from: pick.from, to: pick.to };
  }

  const pick = allMoves[secureRandomInt(allMoves.length)];
  return { type: 'move', from: pick.from, to: pick.to };
}
