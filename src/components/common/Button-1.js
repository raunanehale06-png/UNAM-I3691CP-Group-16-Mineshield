import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';

const VARIANT_STYLES = {
  primary: {
    backgroundColorKey: 'primary',
    borderColorKey: 'primary',
    textColorKey: 'text',
  },
  secondary: {
    backgroundColorKey: 'surfaceAlt',
    borderColorKey: 'borderStrong',
    textColorKey: 'text',
  },
  ghost: {
    backgroundColorKey: 'backgroundAlt',
    borderColorKey: 'border',
    textColorKey: 'textMuted',
  },
  danger: {
    backgroundColorKey: 'danger',
    borderColorKey: 'danger',
    textColorKey: 'text',
  },
};

export default function Button({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  ...props
}) {
  const theme = useTheme();
  const palette = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors[palette.backgroundColorKey],
          borderColor: theme.colors[palette.borderColorKey],
          borderRadius: theme.radii.md,
          shadowColor: theme.colors.shadow,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors[palette.textColorKey]} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: theme.colors[palette.textColorKey] },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.62,
  },
});
