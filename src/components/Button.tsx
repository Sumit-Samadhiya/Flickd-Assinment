import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, radius, typography } from '@styles/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  labelStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.primary : colors.brand.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            labelSizeStyles[size],
            variantLabelStyles[variant],
            isDisabled && styles.labelDisabled,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
  },
  labelDisabled: {},
});

// Plain objects — accessed dynamically by variant/size, so StyleSheet.create
// would produce false "unused style" lint warnings.
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.brand.primary,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
};

const labelSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: typography.fontSize.sm,
  },
  md: {
    fontSize: typography.fontSize.md,
  },
  lg: {
    fontSize: typography.fontSize.lg,
  },
};

const variantLabelStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  secondary: {
    color: colors.text.primary,
  },
  outline: {
    color: colors.brand.primary,
  },
  ghost: {
    color: colors.brand.primary,
  },
};
