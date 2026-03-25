import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography } from '@styles/tokens';
import { STYLE_LABELS, STYLE_EMOJIS } from '@utils/prompts';
import type { ClipArtStyle } from '@appTypes/index';

interface GenerationLoaderProps {
  progress: number;
  completedStyles: ClipArtStyle[];
  activeStyles: ClipArtStyle[];
}

function SkeletonCard({ style, index, isComplete }: {
  style: ClipArtStyle;
  index: number;
  isComplete: boolean;
}) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (!isComplete) {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 + index * 120, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800 + index * 120, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }
  }, [isComplete, index, shimmer]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: isComplete ? 1 : 0.4 + shimmer.value * 0.6,
  }));

  return (
    <View style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.card,
          isComplete ? styles.cardDone : styles.cardPending,
          animStyle,
        ]}
      >
        <View style={[styles.cardImage, isComplete ? styles.cardImageDone : styles.cardImagePending]} />
        <View style={styles.cardFooter}>
          <Text style={[styles.cardLabel, isComplete && styles.cardLabelDone]}>
            {isComplete ? `${STYLE_EMOJIS[style]} ${STYLE_LABELS[style]}` : STYLE_LABELS[style]}
          </Text>
          {isComplete && <Text style={styles.doneCheck}>✓</Text>}
        </View>
      </Animated.View>
    </View>
  );
}

export function GenerationLoader({
  progress,
  completedStyles,
  activeStyles,
}: GenerationLoaderProps) {
  const completedSet = new Set(completedStyles);

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {completedStyles.length > 0
            ? `${completedStyles.length} / ${activeStyles.length} ready`
            : 'Generating cliparts…'}
        </Text>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Skeleton grid */}
      <View style={styles.grid}>
        {activeStyles.map((style, i) => (
          <SkeletonCard
            key={style}
            style={style}
            index={i}
            isComplete={completedSet.has(style)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand.primary,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: radius.full,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardWrapper: { width: '47%' },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardPending: {
    backgroundColor: colors.skeleton.base,
    borderColor: colors.border.subtle,
  },
  cardDone: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.status.success,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardImagePending: {
    backgroundColor: colors.skeleton.highlight,
  },
  cardImageDone: {
    backgroundColor: colors.background.tertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  cardLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  cardLabelDone: {
    color: colors.status.success,
  },
  doneCheck: {
    color: colors.status.success,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
  },
});
