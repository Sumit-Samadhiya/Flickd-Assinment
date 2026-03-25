import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from './tokens';

export const globalStyles = StyleSheet.create({
  // ─── Layout ────────────────────────────────────────────────────────────────
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },

  // ─── Cards & Surfaces ──────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardElevated: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  heading: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subheading: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  body: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },

  // ─── Buttons ───────────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // ─── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },

  // ─── Padding helpers ───────────────────────────────────────────────────────
  pagePadding: {
    paddingHorizontal: spacing.lg,
  },
});
