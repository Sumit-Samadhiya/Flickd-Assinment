import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '@styles/tokens';
import type { HomeScreenProps } from '@navigation/types';

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.badge}>AI CLIPART GENERATOR</Text>
          <Text style={styles.title}>{'Transform\nYour Photos'}</Text>
          <Text style={styles.subtitle}>
            Turn any portrait into stunning clipart with 5 unique AI art styles — all generated in
            parallel.
          </Text>

          {/* Style preview pills */}
          <View style={styles.pills}>
            {['Cartoon', 'Anime', 'Pixel Art', 'Sketch', 'Flat'].map(label => (
              <View key={label} style={styles.pill}>
                <Text style={styles.pillText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Upload')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors.brand.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsLink}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand.primary,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 40,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    maxWidth: 300,
    marginBottom: spacing.xl,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  footer: {
    gap: spacing.md,
  },
  ctaButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
  },
  settingsLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
