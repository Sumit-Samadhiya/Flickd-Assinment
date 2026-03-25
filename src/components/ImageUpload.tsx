/**
 * ImageUpload.tsx
 *
 * Reusable image upload area with drag-style tap zones.
 * Full camera/gallery logic lives in useImageUpload hook.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '@styles/tokens';
import { useImageUpload } from '@hooks/useImageUpload';
import { useAppStore } from '@context/AppContext';

interface ImageUploadProps {
  onImageReady?: () => void;
}

export function ImageUpload({ onImageReady: _onImageReady }: ImageUploadProps) {
  const { pickFromGallery, pickFromCamera, isLoading } = useImageUpload();
  const originalImage = useAppStore(s => s.originalImage);
  const error = useAppStore(s => s.error);

  return (
    <View style={styles.container}>
      {/* Preview or placeholder */}
      <TouchableOpacity
        style={styles.uploadZone}
        onPress={pickFromGallery}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {originalImage ? (
          <Image source={{ uri: originalImage.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            {isLoading ? (
              <ActivityIndicator color={colors.brand.primary} size="large" />
            ) : (
              <>
                <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.placeholderText}>Tap to upload photo</Text>
                <Text style={styles.placeholderHint}>JPG · PNG · Up to 10 MB</Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Pick buttons */}
      <View style={styles.pickButtons}>
        <TouchableOpacity
          style={styles.pickButton}
          onPress={pickFromGallery}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.pickButtonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickButton, styles.pickButtonOutline]}
          onPress={pickFromCamera}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.pickButtonText, { color: colors.brand.primary }]}>Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  uploadZone: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  plusIcon: {
    fontSize: 48,
    color: colors.brand.primary,
    lineHeight: 56,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  placeholderHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  errorBox: {
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.sm,
  },
  pickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickButton: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pickButtonOutline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  pickButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
});
