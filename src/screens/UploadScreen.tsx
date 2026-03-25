import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useImageUpload } from '@hooks/useImageUpload';
import { useAppState } from '@hooks/useAppState';
import { colors, spacing, radius, typography, shadows } from '@styles/tokens';
import { globalStyles } from '@styles/globalStyles';
import type { UploadScreenProps } from '@navigation/types';

export function UploadScreen({ navigation }: UploadScreenProps) {
  const { pickFromGallery, pickFromCamera, isLoading } = useImageUpload();
  const { state } = useAppState();
  const { originalImage, uploadError } = state;

  const canProceed = !!originalImage && !isLoading;

  const handleContinue = () => {
    if (!originalImage) return;
    navigation.navigate('Generation', { imageUri: originalImage.uri });
  };

  return (
    <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload area */}
        <View style={styles.uploadArea}>
          {originalImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: originalImage.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={pickFromGallery}
                activeOpacity={0.7}
              >
                <Text style={styles.changeButtonText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>📷</Text>
              <Text style={styles.placeholderTitle}>Upload Your Photo</Text>
              <Text style={styles.placeholderSubtitle}>
                JPG or PNG · Up to 10 MB · Square crop recommended
              </Text>
            </View>
          )}
        </View>

        {/* Error message */}
        {uploadError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{uploadError}</Text>
          </View>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.brand.primary} size="small" />
            <Text style={styles.loadingText}>Processing image…</Text>
          </View>
        )}

        {/* Pick buttons */}
        {!originalImage && !isLoading && (
          <View style={styles.pickButtons}>
            <TouchableOpacity style={styles.pickButton} onPress={pickFromGallery} activeOpacity={0.8}>
              <Text style={styles.pickButtonText}>📱  Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickButton, styles.pickButtonSecondary]} onPress={pickFromCamera} activeOpacity={0.8}>
              <Text style={[styles.pickButtonText, { color: colors.text.secondary }]}>
                📷  Take a Photo
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Continue CTA */}
      {canProceed && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={colors.brand.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Generate Clipart →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  uploadArea: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  changeButton: {
    position: 'absolute',
    bottom: spacing.md,
    backgroundColor: 'rgba(15, 15, 26, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  changeButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  placeholder: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  placeholderSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(255,82,82,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  pickButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pickButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  pickButtonSecondary: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pickButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
  },
  continueButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
