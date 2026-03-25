import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { shareService } from '@services/shareService';
import { STYLE_LABELS, STYLE_EMOJIS } from '@utils/prompts';
import { generateId } from '@utils/helpers';
import { colors, spacing, radius, typography, shadows } from '@styles/tokens';
import type { ClipArtStyle, GenerationResponse } from '@appTypes/index';

interface ResultsGridProps {
  results: Partial<Record<ClipArtStyle, GenerationResponse>>;
  onStylePress?: (style: ClipArtStyle) => void;
}

function ResultCard({
  style,
  result,
  onPress,
}: {
  style: ClipArtStyle;
  result: GenerationResponse;
  onPress: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const imageUri = result.imageBase64
    ? `data:image/jpeg;base64,${result.imageBase64}`
    : result.imageUrl;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await shareService.saveToGallery(imageUri, `clipartai_${style}_${generateId()}`);
      Toast.show({ type: 'success', text1: 'Saved!', text2: `${STYLE_LABELS[style]} saved to gallery.` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: err instanceof Error ? err.message : 'Try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareService.shareImage(imageUri, `clipartai_${style}_${generateId()}`);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Share failed', text2: err instanceof Error ? err.message : 'Try again.' });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardLabel}>
        <Text style={styles.cardLabelText}>
          {STYLE_EMOJIS[style]} {STYLE_LABELS[style]}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.cardActionButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.text.primary} size="small" />
          ) : (
            <Text style={styles.cardActionText}>↓ Save</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardActionButton, styles.cardActionButtonOutline]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Text style={[styles.cardActionText, { color: colors.brand.primary }]}>↑ Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function ResultsGrid({ results, onStylePress }: ResultsGridProps) {
  const entries = Object.entries(results) as [ClipArtStyle, GenerationResponse][];

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No results yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={([style]) => style}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      renderItem={({ item: [style, result] }) => (
        <ResultCard
          style={style}
          result={result}
          onPress={() => onStylePress?.(style)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardLabel: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  cardLabelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  cardActionButton: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    minHeight: 32,
    justifyContent: 'center',
  },
  cardActionButtonOutline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  cardActionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.md,
  },
});
