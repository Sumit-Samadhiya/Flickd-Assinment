// ─── Design Tokens ────────────────────────────────────────────────────────────
// Single source of truth for all visual constants.

// ─── Colors ───────────────────────────────────────────────────────────────────
export const colors = {
  brand: {
    primary: '#7C4DFF',   // vibrant purple
    secondary: '#00E5FF', // electric cyan
    tertiary: '#FF4081',  // neon pink accent
    gradient: ['#7C4DFF', '#00B4D8'] as const,
  },
  background: {
    primary: '#0F0F1A',   // deep dark navy — main screen bg
    secondary: '#1A1A2E', // card / surface
    tertiary: '#252540',  // elevated element
    overlay: 'rgba(15, 15, 26, 0.88)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0C0',
    tertiary: '#60607A',
    inverse: '#0F0F1A',
  },
  border: {
    default: '#2A2A45',
    focused: '#7C4DFF',
    subtle: '#1E1E35',
  },
  status: {
    success: '#00C48C',
    warning: '#FFB800',
    error: '#FF5252',
    info: '#2196F3',
  },
  skeleton: {
    base: '#1E1E35',
    highlight: '#2D2D50',
  },
  transparent: 'transparent',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.5,
    widest: 2.5,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  raised: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
} as const;
