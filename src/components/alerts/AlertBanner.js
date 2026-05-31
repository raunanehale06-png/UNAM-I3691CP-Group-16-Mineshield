import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import Card from '../common/Card';
import { SupervisorIconBadge } from '../supervisor/SupervisorNavigationChrome';
import { resolveAlertPresentation } from './alertPresentation';

export default function AlertBanner({
  alert,
  title,
  body,
  location,
  timestamp,
  badgeLabel,
  iconKey,
  accentColor,
  backgroundColor,
  borderColor,
  onPress,
  style,
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const presentation = resolveAlertPresentation(alert, theme);
  const resolvedAccentColor = accentColor || presentation.accentColor;
  const resolvedBackgroundColor = backgroundColor || presentation.backgroundColor;
  const resolvedBorderColor = borderColor || presentation.borderColor;
  const resolvedIconKey = iconKey || presentation.iconKey;
  const resolvedBadgeLabel = badgeLabel || presentation.badgeLabel;
  const resolvedTitle = title || alert?.title || 'Safety update';
  const resolvedBody = body || alert?.body || alert?.message || '';
  const resolvedLocation = location || alert?.zone || alert?.location || '';
  const resolvedTimestamp = timestamp || alert?.timestamp || '';

  const banner = (
    <Card
      accentColor={resolvedAccentColor}
      padding={0}
      style={[
        styles.card,
        {
          backgroundColor: resolvedBackgroundColor,
          borderLeftColor: resolvedAccentColor,
          borderColor: resolvedBorderColor,
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <SupervisorIconBadge
              backgroundColor={theme.withAlpha(resolvedAccentColor, 0.14)}
              borderColor={theme.withAlpha(resolvedAccentColor, 0.28)}
              color={resolvedAccentColor}
              routeKey={resolvedIconKey}
              style={styles.iconShell}
            />
            <Text style={[styles.badgeText, { color: resolvedAccentColor }]}>
              {resolvedBadgeLabel}
            </Text>
          </View>

          {resolvedTimestamp ? <Text style={styles.timestamp}>{resolvedTimestamp}</Text> : null}
        </View>

        <Text style={styles.title}>{resolvedTitle}</Text>

        {resolvedBody ? <Text style={styles.body}>{resolvedBody}</Text> : null}

        {resolvedLocation ? <Text style={styles.location}>{resolvedLocation}</Text> : null}
      </View>
    </Card>
  );

  if (!onPress) {
    return banner;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      {banner}
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    pressable: {
      width: '100%',
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.996 }],
    },
    card: {
      borderRadius: theme.radii.xl,
      borderWidth: 1.2,
      marginBottom: 0,
    },
    inner: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    iconShell: {
      width: 42,
      height: 42,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      marginRight: theme.spacing.sm,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    timestamp: {
      color: theme.colors.textSoft,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'right',
    },
    title: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
      marginBottom: theme.spacing.xs,
    },
    body: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    location: {
      color: theme.colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
      textTransform: 'uppercase',
    },
  });

