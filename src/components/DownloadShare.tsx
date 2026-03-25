import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { shareService } from '@services/shareService';
import { generateId } from '@utils/helpers';
import { colors, spacing, radius, typography } from '@styles/tokens';
import type { ClipArtStyle, GenerationResponse } from '@appTypes/index';
import { STYLE_LABELS } from '@utils/prompts';

interface DownloadShareProps {
  style: ClipArtStyle;
  result: GenerationResponse;
}

export function DownloadShare({ style, result }: DownloadShareProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const imageSource = result.imageBase64
    ? `data:image/jpeg;base64,${result.imageBase64}`
    : result.imageUrl;

  const fileName = `clipartai_${style}_${generateId()}`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await shareService.saveToGallery(imageSource, fileName);
      Toast.show({
        type: 'success',
        text1: 'Saved to Gallery',
        text2: `${STYLE_LABELS[style]} saved as PNG.`,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareService.shareImage(imageSource, fileName);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={handleSave}
        disabled={isSaving || isSharing}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.text.primary} size="small" />
        ) : (
          <Text style={styles.saveButtonText}>↓  Save to Gallery</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.shareButton]}
        onPress={handleShare}
        disabled={isSaving || isSharing}
        activeOpacity={0.8}
      >
        {isSharing ? (
          <ActivityIndicator color={colors.brand.primary} size="small" />
        ) : (
          <Text style={styles.shareButtonText}>↑  Share</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: colors.brand.primary,
  },
  shareButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  saveButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  shareButtonText: {
    color: colors.brand.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
});
