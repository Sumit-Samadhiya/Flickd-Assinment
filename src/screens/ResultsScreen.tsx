import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppState } from '@hooks/useAppState';
import { shareService } from '@services/shareService';
import { STYLE_LABELS, STYLE_EMOJIS, STYLES } from '@utils/prompts';
import { colors, spacing, radius, typography, shadows } from '@styles/tokens';
import { globalStyles } from '@styles/globalStyles';
import { generateId } from '@utils/helpers';
import type { ResultsScreenProps } from '@navigation/types';
import type { ClipArtStyle } from '@appTypes/index';

export function ResultsScreen({ navigation }: ResultsScreenProps) {
  const { state } = useAppState();
  const { generatedImages } = state;
  const [selectedStyle, setSelectedStyle] = useState<ClipArtStyle>('cartoon');
  const [downloadingStyle, setDownloadingStyle] = useState<ClipArtStyle | null>(null);

  const availableStyles = STYLES.filter(s => generatedImages[s] !== null);
  const currentResult = generatedImages[selectedStyle];

  const handleSave = async (style: ClipArtStyle) => {
    const result = generatedImages[style];
    if (!result) return;
    setDownloadingStyle(style);
    try {
      const source = result.imageBase64 ?? result.imageUrl;
      await shareService.saveToGallery(source, `clipartai_${style}_${generateId()}`);
      Toast.show({ type: 'success', text1: 'Saved to Gallery', text2: `${STYLE_LABELS[style]} saved.` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setDownloadingStyle(null);
    }
  };

  const handleShare = async (style: ClipArtStyle) => {
    const result = generatedImages[style];
    if (!result) return;
    try {
      const source = result.imageBase64 ?? result.imageUrl;
      await shareService.shareImage(source, `clipartai_${style}_${generateId()}`);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Share failed', text2: err instanceof Error ? err.message : 'Please try again.' });
    }
  };

  if (availableStyles.length === 0) {
    return (
      <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
        <View style={globalStyles.centered}>
          <Text style={styles.emptyText}>No results yet. Please generate first.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Style tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {availableStyles.map(style => (
            <TouchableOpacity
              key={style}
              style={[styles.tab, selectedStyle === style && styles.tabActive]}
              onPress={() => setSelectedStyle(style)}
              activeOpacity={0.75}
            >
              <Text style={styles.tabEmoji}>{STYLE_EMOJIS[style]}</Text>
              <Text style={[styles.tabLabel, selectedStyle === style && styles.tabLabelActive]}>
                {STYLE_LABELS[style]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main preview */}
        {currentResult && (
          <View style={styles.mainCard}>
            <Image
              source={{
                uri: currentResult.imageBase64
                  ? `data:image/jpeg;base64,${currentResult.imageBase64}`
                  : currentResult.imageUrl,
              }}
              style={styles.mainImage}
              resizeMode="cover"
            />

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleSave(selectedStyle)}
                disabled={downloadingStyle === selectedStyle}
                activeOpacity={0.8}
              >
                {downloadingStyle === selectedStyle ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <Text style={styles.actionButtonTextPrimary}>↓  Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => handleShare(selectedStyle)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonTextSecondary}>↑  Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Full grid */}
        <Text style={styles.gridTitle}>All Styles</Text>
        <View style={styles.grid}>
          {availableStyles.map(style => {
            const result = generatedImages[style];
            if (!result) return null;
            return (
              <TouchableOpacity
                key={style}
                style={[styles.gridCard, selectedStyle === style && styles.gridCardSelected]}
                onPress={() => setSelectedStyle(style)}
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri: result.imageBase64
                      ? `data:image/jpeg;base64,${result.imageBase64}`
                      : result.imageUrl,
                  }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <Text style={styles.gridLabel}>{STYLE_LABELS[style]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* New generation */}
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('Upload')}
          activeOpacity={0.8}
        >
          <Text style={styles.newButtonText}>+ Try Another Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  tabBar: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tabActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  tabEmoji: { fontSize: 14 },
  tabLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabLabelActive: {
    color: colors.text.primary,
  },
  mainCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.md,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonPrimary: {
    backgroundColor: colors.brand.primary,
  },
  actionButtonSecondary: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionButtonTextPrimary: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  actionButtonTextSecondary: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  gridTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    width: '47%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  gridCardSelected: {
    borderColor: colors.brand.primary,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
  },
  gridLabel: {
    padding: spacing.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  newButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  newButtonText: {
    color: colors.brand.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  goBackButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
  },
  goBackText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
});
