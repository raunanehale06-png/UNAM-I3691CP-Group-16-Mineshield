import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';

export default function Header({
  eyebrow,
  title,
  subtitle,
  rightContent = null,
  style,
}) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.colors.warning }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightContent ? <View style={styles.side}>{rightContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
  },
  side: {
    marginLeft: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
});
