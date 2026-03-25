import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STYLES, STYLE_LABELS, STYLE_DESCRIPTIONS, STYLE_EMOJIS } from '@utils/prompts';
import { useAppState } from '@hooks/useAppState';
import { colors, spacing, radius, typography } from '@styles/tokens';
import type { ClipArtStyle } from '@appTypes/index';

interface StyleSelectorProps {
  onSelectionChange?: (selected: ClipArtStyle[]) => void;
}

export function StyleSelector({ onSelectionChange }: StyleSelectorProps) {
  const { state, setSelectedStyles } = useAppState();
  const selectedStyles = state.selectedStyles;

  const toggle = (style: ClipArtStyle) => {
    const next = selectedStyles.includes(style)
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];

    if (next.length === 0) return; // Always keep at least one selected

    setSelectedStyles(next);
    onSelectionChange?.(next);
  };

  const selectAll = () => {
    setSelectedStyles([...STYLES]);
    onSelectionChange?.([...STYLES]);
  };

  const allSelected = selectedStyles.length === STYLES.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Styles</Text>
        <TouchableOpacity onPress={selectAll} disabled={allSelected} activeOpacity={0.7}>
          <Text style={[styles.selectAll, allSelected && styles.selectAllDisabled]}>
            Select All
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {STYLES.map(style => {
          const isSelected = selectedStyles.includes(style);
          return (
            <TouchableOpacity
              key={style}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggle(style)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={styles.emoji}>{STYLE_EMOJIS[style]}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {STYLE_LABELS[style]}
              </Text>
              <Text style={styles.description}>{STYLE_DESCRIPTIONS[style]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>
        {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected
        {selectedStyles.length > 1 ? ' — generated in parallel' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  selectAll: {
    fontSize: typography.fontSize.sm,
    color: colors.brand.primary,
    fontWeight: typography.fontWeight.medium,
  },
  selectAllDisabled: {
    color: colors.text.tertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: { fontSize: 24 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  checkmark: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
