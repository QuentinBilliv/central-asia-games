import {
  AzulGameState,
  AzulMove,
  AzulTileColor,
  PetitsChevauxGameState,
  PetitsChevauxMove,
} from './types';
import { getWallColumn } from './azul/scoring';
import { getValidMoves } from './petitsChevaux/moves';

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
  return candidates[Math.floor(Math.random() * candidates.length)];
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

  const horseId = validHorses[Math.floor(Math.random() * validHorses.length)];
  return { type: 'moveHorse', horseId };
}
