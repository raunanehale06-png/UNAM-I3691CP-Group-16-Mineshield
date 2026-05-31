import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';

const BADGE_PALETTE = {
  critical: { colorKey: 'danger', softKey: 'dangerSoft' },
  danger: { colorKey: 'danger', softKey: 'dangerSoft' },
  error: { colorKey: 'danger', softKey: 'dangerSoft' },
  warning: { colorKey: 'warning', softKey: 'warningSoft' },
  info: { colorKey: 'brandBlue', softKey: 'brandBlueSoft' },
  neutral: { colorKey: 'textMuted', softKey: 'surfaceAlt' },
  safe: { colorKey: 'success', softKey: 'successSoft' },
  success: { colorKey: 'success', softKey: 'successSoft' },
  offline: { colorKey: 'textMuted', softKey: 'surfaceAlt' },
};

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

export const resolveStatusBadgePalette = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized.includes('critical')) {
    return BADGE_PALETTE.critical;
  }

  if (normalized.includes('danger')) {
    return BADGE_PALETTE.danger;
  }

  if (normalized.includes('warning') || normalized.includes('pending')) {
    return BADGE_PALETTE.warning;
  }

  if (normalized.includes('safe') || normalized.includes('resolved') || normalized.includes('good')) {
    return BADGE_PALETTE.safe;
  }

  if (normalized.includes('online') || normalized.includes('active')) {
    return BADGE_PALETTE.success;
  }

  if (normalized.includes('offline') || normalized.includes('inactive')) {
    return BADGE_PALETTE.offline;
  }

  return BADGE_PALETTE.neutral;
};

export default function StatusBadge({
  status,
  label,
  compact = false,
  style,
  textStyle,
}) {
  const theme = useTheme();
  const palette = useMemo(() => resolveStatusBadgePalette(status || label), [label, status]);
  const resolvedLabel = label || status || 'Status';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors[palette.softKey],
          borderColor: theme.colors[palette.colorKey],
        },
        compact && styles.compactBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.colors[palette.colorKey],
          },
          compact && styles.compactLabel,
          textStyle,
        ]}
      >
        {resolvedLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  compactLabel: {
    fontSize: 10,
  },
});
