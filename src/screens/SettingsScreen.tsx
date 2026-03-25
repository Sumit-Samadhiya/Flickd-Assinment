import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@context/AppContext';
import { storageService } from '@services/storageService';
import Toast from 'react-native-toast-message';
import { colors, spacing, radius, typography } from '@styles/tokens';
import { globalStyles } from '@styles/globalStyles';
import type { SettingsScreenProps } from '@navigation/types';

export function SettingsScreen(_props: SettingsScreenProps) {
  const resetAll = useAppStore(s => s.resetAll);

  const handleClearCache = async () => {
    await storageService.clearResultsCache();
    Toast.show({ type: 'success', text1: 'Cache cleared', text2: 'All cached results removed.' });
  };

  const handleResetApp = () => {
    resetAll();
    Toast.show({ type: 'success', text1: 'State reset', text2: 'App state has been reset.' });
  };

  return (
    <SafeAreaView style={globalStyles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Section title="About">
          <InfoRow label="App" value="ClipArt AI" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Platform" value="Android" />
        </Section>

        <Section title="Data">
          <SettingsButton label="Clear Results Cache" onPress={handleClearCache} />
          <SettingsButton label="Reset App State" onPress={handleResetApp} destructive />
        </Section>

        <Section title="Security">
          <InfoRow label="API Keys" value="Backend only ✓" />
          <InfoRow label="Image Storage" value="Local cache only" />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SettingsButton({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, destructive && { color: colors.status.error }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rowLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  rowValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  chevron: {
    fontSize: 20,
    color: colors.text.tertiary,
  },
});
