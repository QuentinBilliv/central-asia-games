/**
 * Crypto-secure random integer in [0, max).
 * Uses Web Crypto API (works in browsers and Node.js 19+).
 * Falls back to Math.random() if crypto is unavailable.
 */
export function secureRandomInt(max: number): number {
  try {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  } catch {
    return Math.floor(Math.random() * max);
  }
}

/**
 * Crypto-secure dice roll (1 to sides inclusive, default 6).
 */
export function secureDiceRoll(sides: number = 6): number {
  return secureRandomInt(sides) + 1;
}
