import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from '../common/Button';
import Card from '../common/Card';
import { useTheme } from '../../contexts/ThemeContext';
import HazardStatusBadge, { resolveHazardBadgePalette } from './HazardStatusBadge';

const normalizeMetaItem = (item) => {
  if (!item) {
    return null;
  }

  if (typeof item === 'string') {
    return {
      label: '',
      value: item,
    };
  }

  const value = item.value ?? item.text ?? item.label ?? '';

  return {
    label: item.label ?? item.title ?? '',
    value,
  };
};

const resolveImageSource = (imageSource, imageUrl) => {
  if (imageSource) {
    return imageSource;
  }

  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return { uri: imageUrl };
  }

  if (imageUrl && typeof imageUrl === 'object') {
    return imageUrl;
  }

  return null;
};

export default function HazardCard({
  title,
  description,
  severity,
  status,
  imageUrl,
  imageSource,
  meta = [],
  onPress,
  actionLabel,
  onActionPress,
  actionVariant = 'secondary',
  actionStyle,
  actionTextStyle,
  accentColor,
  backgroundColor,
  borderColor,
  style,
  contentStyle,
  imageStyle,
  titleStyle,
  descriptionStyle,
  metaStyle,
  badgeStyle,
  children,
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedImageSource = resolveImageSource(imageSource, imageUrl);
  const normalizedMeta = useMemo(
    () => meta.map(normalizeMetaItem).filter((item) => item && item.value),
    [meta]
  );
  const badgeToneSource = severity || status || title || 'hazard';
  const badgePalette = resolveHazardBadgePalette(theme, badgeToneSource);
  const resolvedAccentColor = accentColor || borderColor || badgePalette.borderColor;
  const resolvedTone = backgroundColor || badgePalette.backgroundColor;
  const content = (
    <Card
      accentColor={resolvedAccentColor}
      tone={resolvedTone}
      padding={0}
      style={[
        styles.card,
        style,
        backgroundColor ? { backgroundColor } : null,
      ]}
    >
      <View style={[styles.inner, contentStyle]}>
        <View style={styles.badgeRow}>
          {severity ? (
            <HazardStatusBadge
              compact
              severity={severity}
              style={[styles.badge, badgeStyle]}
            />
          ) : null}

          {status ? (
            <HazardStatusBadge compact status={status} style={[styles.badge, badgeStyle]} />
          ) : null}
        </View>

        <Text style={[styles.title, titleStyle]} numberOfLines={3}>
          {title || 'Hazard report'}
        </Text>

        {description ? (
          <Text style={[styles.description, descriptionStyle]} numberOfLines={4}>
            {description}
          </Text>
        ) : null}

        {resolvedImageSource ? (
          <Image source={resolvedImageSource} resizeMode="cover" style={[styles.image, imageStyle]} />
        ) : null}

        {normalizedMeta.length > 0 ? (
          <View style={[styles.metaList, metaStyle]}>
            {normalizedMeta.map((item, index) => (
              <View key={`${item.label || 'meta'}-${index}`} style={styles.metaItem}>
                {item.label ? <Text style={styles.metaLabel}>{item.label}</Text> : null}
                <Text style={styles.metaValue} numberOfLines={3}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {children}

        {actionLabel && onActionPress ? (
          <Button
            label={actionLabel}
            onPress={onActionPress}
            style={[styles.actionButton, actionStyle]}
            textStyle={actionTextStyle}
            variant={actionVariant}
          />
        ) : null}
      </View>
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.pressable}>
      {content}
    </TouchableOpacity>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    pressable: {
      width: '100%',
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    inner: {
      padding: theme.spacing.lg,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
    },
    badge: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    title: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
      marginBottom: theme.spacing.xs,
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    image: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      height: 160,
      marginBottom: theme.spacing.md,
      width: '100%',
    },
    metaList: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
    },
    metaItem: {
      marginBottom: theme.spacing.sm,
    },
    metaLabel: {
      color: theme.colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    metaValue: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    actionButton: {
      marginTop: theme.spacing.sm,
    },
  });
