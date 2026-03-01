export const colors = {
  turquoise: '#0d9488',
  gold: '#d4a017',
  lapis: '#1e40af',
  terracotta: '#c2410c',
  sand: '#fef9e7',
  night: '#1a1a2e',
} as const;

// Azul tile colors mapped to Central Asian theme
// Each tile has a base color, a lighter glaze highlight, and a darker shadow
export const tileColors = {
  lapis: { bg: '#1e40af', light: '#3b6ef5', dark: '#152e7a', text: '#ffffff', name: 'Lapis' },
  gold: { bg: '#d4a017', light: '#f0c040', dark: '#9a7510', text: '#ffffff', name: 'Or' },
  terracotta: { bg: '#c2410c', light: '#e8632e', dark: '#8a2e08', text: '#ffffff', name: 'Terre cuite' },
  obsidian: { bg: '#4b5563', light: '#6b7280', dark: '#1f2937', text: '#ffffff', name: 'Obsidienne' },
  turquoise: { bg: '#0d9488', light: '#2dd4bf', dark: '#065f56', text: '#ffffff', name: 'Turquoise' },
} as const;

// Petits Chevaux player colors
export const playerColors = {
  0: { bg: '#1e40af', light: '#dbeafe', name: 'Bleu' },
  1: { bg: '#c2410c', light: '#ffedd5', name: 'Rouge' },
  2: { bg: '#0d9488', light: '#ccfbf1', name: 'Vert' },
  3: { bg: '#d4a017', light: '#fef9c3', name: 'Jaune' },
} as const;

export type TileColor = keyof typeof tileColors;
export type PlayerColorIndex = keyof typeof playerColors;
