// Toguz Korgool (Toguz Kumalak) — Traditional Central Asian Mancala
// Popular in Kazakhstan and Kyrgyzstan

/** Number of pits per player */
export const PITS_PER_PLAYER = 9;

/** Initial stones per pit */
export const INITIAL_STONES_PER_PIT = 9;

/** Total stones in the game: 9 pits x 9 stones x 2 players = 162 */
export const TOTAL_STONES = PITS_PER_PLAYER * INITIAL_STONES_PER_PIT * 2;

/** Stones needed to win (strict majority of 162) */
export const STONES_TO_WIN = 82;

/** Stones for a draw (exactly half) */
export const STONES_FOR_DRAW = 81;

/** When a sow lands in opponent pit making it exactly this count, it becomes a tuz candidate */
export const TUZ_TRIGGER_COUNT = 3;

/** Pit index 9 (the last pit, index 8) cannot be claimed as tuz */
export const TUZ_FORBIDDEN_PIT = 8;
