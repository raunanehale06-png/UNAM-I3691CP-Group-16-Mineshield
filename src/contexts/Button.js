/**
 * File: Button.js
 * Author: Tegameno Iyambo
 * Role: UI/UX Lead
 * FR: FR-001, FR-003, FR-009, FR-010, FR-011
 * Description: Reusable button component with variants: primary, secondary, danger, warning.
 *              Follows the MineShield color palette and accessibility guidelines.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger, warning, outline
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.divider;
    switch (variant) {
      case 'primary':
        return theme.colors.primaryOrange;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'danger':
        return theme.colors.criticalFill;
      case 'warning':
        return theme.colors.warningFill;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.primaryOrange;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    switch (variant) {
      case 'primary':
        return theme.colors.surface;
      case 'secondary':
        return theme.colors.surface;
      case 'danger':
        return theme.colors.surface;
      case 'warning':
        return theme.colors.warningText;
      case 'outline':
        return theme.colors.primaryOrange;
      default:
        return theme.colors.surface;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.colors.primaryOrange;
    return 'transparent';
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: getBorderColor(),
      opacity: disabled ? 0.6 : 1,
    },
    text: {
      color: getTextColor(),
      fontSize: 16,
      fontWeight: '600',
      fontFamily: theme.typography.fontFamily,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
