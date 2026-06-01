import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import Card from '../common/Card';
import { SupervisorIconBadge } from '../supervisor/SupervisorNavigationChrome';
import { resolveAlertPresentation } from './alertPresentation';

export default function NotificationCard({
  alert,
  title,
  body,
  location,
  timestamp,
  read,
  type,
  severity,
  badgeLabel,
  iconKey,
  accentColor,
  backgroundColor,
  compact = false,
  onPress,
  style,
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sourceAlert = alert || {};
  const presentation = resolveAlertPresentation(
    {
      ...sourceAlert,
      type: type || sourceAlert.type,
      severity: severity || sourceAlert.severity,
    },
    theme
  );

  const resolvedAccentColor = accentColor || presentation.accentColor;
  const resolvedIconKey = iconKey || presentation.iconKey;
  const resolvedBadgeLabel = badgeLabel || presentation.badgeLabel;
  const resolvedTitle = title || sourceAlert.title || 'Safety update';
  const resolvedBody = body || sourceAlert.body || sourceAlert.message || '';
  const resolvedLocation =
    location || sourceAlert.zone || sourceAlert.location || sourceAlert.locationLabel || '';
  const resolvedTimestamp = timestamp || sourceAlert.timestamp || '';
  const resolvedRead = typeof read === 'boolean' ? read : Boolean(sourceAlert.read);
  const resolvedBackgroundColor =
    backgroundColor ||
    (compact
      ? presentation.backgroundColor
      : resolvedRead
        ? theme.colors.surface
        : theme.colors.surfaceAlt);
  const isUnread = !resolvedRead;

  const card = (
    <Card
      accentColor={resolvedAccentColor}
      padding={0}
      style={[
        styles.card,
        compact && styles.compactCard,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: theme.withAlpha(resolvedAccentColor, compact ? 0.28 : 0.24),
        },
        isUnread && !compact && styles.unreadCard,
        style,
      ]}
    >
      <View style={[styles.inner, compact && styles.compactInner]}>
        {compact ? (
          <View style={styles.compactLayout}>
            <SupervisorIconBadge
              backgroundColor={theme.withAlpha(resolvedAccentColor, 0.14)}
              borderColor={theme.withAlpha(resolvedAccentColor, 0.28)}
              color={resolvedAccentColor}
              routeKey={resolvedIconKey}
              style={styles.compactIcon}
            />

            <View style={styles.compactMeta}>
              <View style={styles.compactHeaderRow}>
                <Text numberOfLines={1} style={styles.compactTitle}>
                  {resolvedTitle}
                </Text>

                <View style={[styles.severityBadge, { backgroundColor: resolvedAccentColor }]}>
                  <Text style={styles.severityText}>{resolvedBadgeLabel}</Text>
                </View>
              </View>

              {resolvedLocation ? (
                <Text numberOfLines={1} style={styles.compactLocation}>
                  {resolvedLocation}
                </Text>
              ) : null}

              {resolvedTimestamp ? (
                <Text numberOfLines={1} style={styles.compactTimestamp}>
                  {resolvedTimestamp}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.headerRow}>
              <View style={styles.badgeRow}>
                <SupervisorIconBadge
                  backgroundColor={theme.withAlpha(resolvedAccentColor, 0.14)}
                  borderColor={theme.withAlpha(resolvedAccentColor, 0.28)}
                  color={resolvedAccentColor}
                  routeKey={resolvedIconKey}
                  style={styles.iconShell}
                />

                <View style={styles.titleMeta}>
                  <Text style={[styles.badgeText, { color: resolvedAccentColor }]}>
                    {resolvedBadgeLabel}
                  </Text>
                  <Text style={[styles.title, isUnread && styles.unreadTitle]}>{resolvedTitle}</Text>
                </View>
              </View>

              {isUnread ? <View style={[styles.unreadDot, { backgroundColor: resolvedAccentColor }]} /> : null}
            </View>

            {resolvedBody ? <Text style={styles.body}>{resolvedBody}</Text> : null}

            <View style={styles.footerRow}>
              {resolvedLocation ? (
                <Text style={styles.location}>{resolvedLocation}</Text>
              ) : (
                <View style={styles.footerSpacer} />
              )}
              {resolvedTimestamp ? <Text style={styles.timestamp}>{resolvedTimestamp}</Text> : null}
            </View>
          </>
        )}
      </View>
    </Card>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      {card}
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    pressable: {
      width: '100%',
    },
    pressed: {
      opacity: 0.93,
      transform: [{ scale: 0.996 }],
    },
    card: {
      borderRadius: theme.radii.lg,
      borderWidth: 1.1,
      marginBottom: theme.spacing.md,
    },
    unreadCard: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    compactCard: {
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radii.md,
    },
    inner: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    compactInner: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    iconShell: {
      width: 46,
      height: 46,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      marginRight: theme.spacing.md,
    },
    titleMeta: {
      flex: 1,
      paddingTop: 1,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.7,
      marginBottom: 3,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    unreadTitle: {
      color: theme.colors.text,
      fontWeight: '800',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    body: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: theme.spacing.sm,
    },
    footerSpacer: {
      flex: 1,
    },
    location: {
      color: theme.colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
      flex: 1,
      paddingRight: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    timestamp: {
      color: theme.colors.textSoft,
      fontSize: 11,
      marginLeft: theme.spacing.sm,
    },
    compactLayout: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    compactIcon: {
      width: 42,
      height: 42,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      marginRight: theme.spacing.md,
    },
    compactMeta: {
      flex: 1,
      minWidth: 0,
    },
    compactHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    compactTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      flex: 1,
      lineHeight: 20,
      paddingRight: theme.spacing.sm,
    },
    severityBadge: {
      borderRadius: theme.radii.sm,
      minWidth: 58,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    severityText: {
      color: theme.colors.surface,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    compactLocation: {
      color: theme.colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    compactTimestamp: {
      color: theme.colors.textFaint,
      fontSize: 11,
      marginTop: 4,
    },
  });
