import { AzulGameState, AzulMove, AzulTileColor } from '../types';
import { WALL_PATTERN, FACTORIES_BY_PLAYERS } from './constants';
import { scoreTilePlacement, calculateFloorPenalty, calculateEndGameBonuses, isGameOver, getWallColumn } from './scoring';
import { createFactories } from './state';
import { secureRandomInt } from '../random';

interface MoveResult {
  valid: boolean;
  state: AzulGameState;
  error?: string;
}

export function validateAndApplyMove(
  state: AzulGameState,
  playerId: string,
  move: AzulMove
): MoveResult {
  const currentPlayer = state.turnOrder[state.currentPlayerIndex];
  if (currentPlayer !== playerId) {
    return { valid: false, state, error: 'Not your turn' };
  }

  if (state.phase !== 'picking') {
    return { valid: false, state, error: 'Not in picking phase' };
  }

  if (move.type !== 'pick') {
    return { valid: false, state, error: 'Invalid move type' };
  }

  // Deep clone
  const newState: AzulGameState = structuredClone(state);

  const board = newState.playerBoards.find((b) => b.playerId === playerId)!;

  let pickedTiles: AzulTileColor[] = [];
  let otherTiles: AzulTileColor[] = [];

  if (move.sourceType === 'factory') {
    const factory = newState.factories.find((f) => f.id === move.sourceId);
    if (!factory || factory.tiles.length === 0) {
      return { valid: false, state, error: 'Invalid factory' };
    }

    // Pick all tiles of the chosen color
    pickedTiles = factory.tiles.filter((t) => t === move.color);
    otherTiles = factory.tiles.filter((t) => t !== move.color);

    if (pickedTiles.length === 0) {
      return { valid: false, state, error: 'Color not in factory' };
    }

    // Move other tiles to center
    newState.center.push(...otherTiles);
    factory.tiles = [];
  } else if (move.sourceType === 'center') {
    if (newState.center.length === 0) {
      return { valid: false, state, error: 'Center is empty' };
    }

    pickedTiles = newState.center.filter((t) => t === move.color);
    if (pickedTiles.length === 0) {
      return { valid: false, state, error: 'Color not in center' };
    }

    newState.center = newState.center.filter((t) => t !== move.color);

    // First player to take from center gets the first-player token (penalty)
    if (newState.hasFirstPlayerToken) {
      newState.hasFirstPlayerToken = false;
      newState.firstPlayerNextRound = playerId;
      board.hasFirstPlayerTokenPenalty = true;
    }
  } else {
    return { valid: false, state, error: 'Invalid source' };
  }

  // Place tiles on pattern line or floor
  if (move.patternLineIndex >= 0 && move.patternLineIndex < 5) {
    const line = board.patternLines[move.patternLineIndex];

    // Validate: line must be empty or same color
    if (line.color !== null && line.color !== move.color) {
      return { valid: false, state, error: 'Pattern line has different color' };
    }

    // Validate: corresponding wall position must not be filled
    const wallCol = getWallColumn(move.patternLineIndex, move.color);
    if (wallCol < 0 || wallCol >= 5) {
      return { valid: false, state, error: 'Invalid wall column' };
    }
    if (board.wall[move.patternLineIndex][wallCol] !== null) {
      return { valid: false, state, error: 'Wall position already filled' };
    }

    line.color = move.color;
    const spaceAvailable = line.maxCount - line.count;
    const tilesToPlace = Math.min(pickedTiles.length, spaceAvailable);
    line.count += tilesToPlace;

    // Overflow goes to floor line
    const overflow = pickedTiles.length - tilesToPlace;
    for (let i = 0; i < overflow; i++) {
      board.floorLine.push(move.color);
    }
  } else {
    // All tiles go to floor line
    board.floorLine.push(...pickedTiles);
  }

  // Advance turn
  newState.currentPlayerIndex =
    (newState.currentPlayerIndex + 1) % newState.turnOrder.length;

  // Check if picking phase is over (all factories and center empty)
  const allEmpty =
    newState.factories.every((f) => f.tiles.length === 0) &&
    newState.center.length === 0;

  if (allEmpty) {
    // Wall tiling phase
    return { valid: true, state: performWallTiling(newState) };
  }

  return { valid: true, state: newState };
}

function performWallTiling(state: AzulGameState): AzulGameState {
  const newState = { ...state };

  for (const board of newState.playerBoards) {
    // Process each complete pattern line
    for (let row = 0; row < 5; row++) {
      const line = board.patternLines[row];
      if (line.count === line.maxCount && line.color !== null) {
        // Place one tile on the wall
        const col = getWallColumn(row, line.color);
        if (col < 0 || col >= 5) continue;
        board.wall[row][col] = line.color;

        // Score the placement
        board.score += scoreTilePlacement(board.wall, row, col);

        // Discard remaining tiles
        for (let i = 0; i < line.count - 1; i++) {
          newState.discard.push(line.color);
        }

        // Clear the pattern line
        line.color = null;
        line.count = 0;
      }
    }

    // Apply floor line penalty (token counts as +1 tile on floor)
    const floorCount = board.floorLine.length + (board.hasFirstPlayerTokenPenalty ? 1 : 0);
    const penalty = calculateFloorPenalty(floorCount);
    board.score = Math.max(0, board.score + penalty);

    // Discard floor tiles (only real tiles, not the token)
    newState.discard.push(...board.floorLine);
    board.floorLine = [];
    board.hasFirstPlayerTokenPenalty = false;
  }

  // Check game end
  if (isGameOver(newState.playerBoards)) {
    // Apply end-of-game bonuses
    for (const board of newState.playerBoards) {
      board.score += calculateEndGameBonuses(board.wall);
    }

    // Determine winner (tie-break: most complete horizontal rows)
    const sorted = [...newState.playerBoards].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aRows = a.wall.filter(row => row.every(t => t !== null)).length;
      const bRows = b.wall.filter(row => row.every(t => t !== null)).length;
      return bRows - aRows;
    });
    // If top players are still tied on both score and rows, it's a shared victory
    const top = sorted[0];
    const topRows = top.wall.filter(row => row.every(t => t !== null)).length;
    const runners = sorted.filter(b => b.score === top.score &&
      b.wall.filter(row => row.every(t => t !== null)).length === topRows);
    newState.winner = runners.length === 1 ? top.playerId : null;
    newState.gameOver = true;
    return newState;
  }

  // Start new round
  newState.round++;
  newState.phase = 'picking';
  newState.hasFirstPlayerToken = true;

  // Set first player for new round
  if (newState.firstPlayerNextRound) {
    const fpIndex = newState.turnOrder.indexOf(newState.firstPlayerNextRound);
    if (fpIndex !== -1) {
      newState.currentPlayerIndex = fpIndex;
    }
  }
  newState.firstPlayerNextRound = null;

  // Refill bag if needed
  if (newState.bag.length < newState.factories.length * 4) {
    // Shuffle discard into bag
    const shuffled = [...newState.discard];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    newState.bag = [...newState.bag, ...shuffled];
    newState.discard = [];
  }

  // Create new factories
  const numFactories = FACTORIES_BY_PLAYERS[newState.turnOrder.length] || 5;
  const { factories, remainingBag } = createFactories(newState.bag, numFactories);
  newState.factories = factories;
  newState.bag = remainingBag;
  newState.center = [];

  return newState;
}
