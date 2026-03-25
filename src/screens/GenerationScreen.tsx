import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useImageGeneration } from '@hooks/useImageGeneration';
import { useAppStore } from '@context/AppContext';
import { STYLE_LABELS, STYLE_EMOJIS } from '@utils/prompts';
import { colors, spacing, radius, typography } from '@styles/tokens';
import { globalStyles } from '@styles/globalStyles';
import type { GenerationScreenProps } from '@navigation/types';
import type { ClipArtStyle } from '@appTypes/index';

const ALL_STYLES: ClipArtStyle[] = ['cartoon', 'flat', 'anime', 'pixel', 'sketch'];

function SkeletonCard({ index }: { index: number }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 + index * 100, easing: Easing.ease }),
        withTiming(0.4, { duration: 700 + index * 100, easing: Easing.ease }),
      ),
      -1,
    );
  }, [index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.skeletonCard, animatedStyle]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonLabel} />
    </Animated.View>
  );
}

export function GenerationScreen({ navigation }: GenerationScreenProps) {
  const { generate, cancel } = useImageGeneration();

  const generationStatus = useAppStore(s => s.generationStatus);
  const generationProgress = useAppStore(s => s.generationProgress);
  const generatedImages = useAppStore(s => s.generatedImages);
  const error = useAppStore(s => s.error);

  const completedCount = Object.keys(generatedImages).length;

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    if (generationStatus === 'completed' || generationStatus === 'partial') {
      const timer = setTimeout(() => navigation.replace('Results', {}), 800);
      return () => clearTimeout(timer);
    }
  }, [generationStatus, navigation]);

  if (error && generationStatus === 'failed') {
    return (
      <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
        <View style={[globalStyles.centered, styles.errorContainer]}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => generate()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Creating your cliparts</Text>
          <Text style={styles.subtitle}>
            {completedCount > 0
              ? `${completedCount} of 5 styles ready`
              : 'Starting generation…'}
          </Text>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(generationProgress, completedCount > 0 ? 10 : 0)}%` },
              ]}
            />
          </View>
        </View>

        {/* Skeleton grid */}
        <View style={styles.grid}>
          {ALL_STYLES.map((style, i) => {
            const done = !!generatedImages[style];
            return (
              <View key={style} style={styles.cardWrapper}>
                {done ? (
                  <View style={[styles.skeletonCard, styles.skeletonCardDone]}>
                    <View style={[styles.skeletonImage, styles.skeletonImageDone]} />
                    <Text style={styles.cardLabel}>
                      {STYLE_EMOJIS[style]} {STYLE_LABELS[style]}
                    </Text>
                  </View>
                ) : (
                  <SkeletonCard index={i} />
                )}
              </View>
            );
          })}
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelButton} onPress={cancel} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: radius.full,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardWrapper: {
    width: '47%',
  },
  skeletonCard: {
    backgroundColor: colors.skeleton.base,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  skeletonCardDone: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.status.success,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.skeleton.highlight,
  },
  skeletonImageDone: {
    backgroundColor: colors.background.tertiary,
  },
  skeletonLabel: {
    height: 14,
    backgroundColor: colors.skeleton.highlight,
    borderRadius: radius.sm,
    margin: spacing.sm,
  },
  cardLabel: {
    padding: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.status.success,
  },
  errorContainer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorEmoji: { fontSize: 48 },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  retryText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  backLink: { padding: spacing.sm },
  backLinkText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
});
