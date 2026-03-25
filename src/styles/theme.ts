import { colors, spacing, radius, typography, shadows, zIndex } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  zIndex,
} as const;

export type Theme = typeof theme;
