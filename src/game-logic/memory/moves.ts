import { MemoryGameState, MemoryMove } from '../types';

export interface MoveResult {
  valid: boolean;
  state: MemoryGameState;
  error?: string;
}

export function validateAndApplyMove(
  state: MemoryGameState,
  playerId: string,
  move: MemoryMove
): MoveResult {
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
  if (playerId !== currentPlayerId) {
    return { valid: false, state, error: 'Not your turn' };
  }

  if (state.gameOver) {
    return { valid: false, state, error: 'Game is over' };
  }

  if (move.type !== 'flip') {
    return { valid: false, state, error: 'Invalid move type' };
  }

  const { cardIndex } = move;
  if (cardIndex < 0 || cardIndex >= state.cards.length) {
    return { valid: false, state, error: 'Invalid card index' };
  }

  const newState: MemoryGameState = structuredClone(state);

  // Reset pending cards from previous turn's mismatch
  if (newState.pendingReset) {
    const [idx1, idx2] = newState.pendingReset;
    newState.cards[idx1].flipped = false;
    newState.cards[idx2].flipped = false;
    newState.pendingReset = null;
  }

  const card = newState.cards[cardIndex];

  if (card.matched) {
    return { valid: false, state, error: 'Card already matched' };
  }
  if (card.flipped) {
    return { valid: false, state, error: 'Card already flipped' };
  }

  // Flip the card
  card.flipped = true;

  if (newState.firstFlippedIndex === null) {
    // First card of the turn
    newState.firstFlippedIndex = cardIndex;
  } else {
    // Second card of the turn
    const firstCard = newState.cards[newState.firstFlippedIndex];

    if (firstCard.pairId === card.pairId) {
      // Match found
      firstCard.matched = true;
      card.matched = true;

      const playerState = newState.players.find((p) => p.playerId === playerId);
      if (playerState) {
        playerState.pairsFound++;
      }

      // Same player gets to go again
      newState.firstFlippedIndex = null;

      // Check game over
      const allMatched = newState.cards.every((c) => c.matched);
      if (allMatched) {
        newState.gameOver = true;
        // Determine winner (most pairs)
        const sorted = [...newState.players].sort((a, b) => b.pairsFound - a.pairsFound);
        if (sorted.length >= 2 && sorted[0].pairsFound === sorted[1].pairsFound) {
          newState.winner = null; // tie
        } else {
          newState.winner = sorted[0].playerId;
        }
      }
    } else {
      // No match — cards stay visible, will be reset on next flip
      newState.pendingReset = [newState.firstFlippedIndex, cardIndex];
      newState.firstFlippedIndex = null;

      // Next player's turn
      newState.currentPlayerIndex =
        (newState.currentPlayerIndex + 1) % newState.turnOrder.length;
    }
  }

  return { valid: true, state: newState };
}
