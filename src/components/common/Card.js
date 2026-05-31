import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';

export default function Card({
  children,
  style,
  tone = 'surface',
  borderTone = 'border',
  padding = 18,
  accentColor,
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors[tone] || tone,
          borderColor: accentColor || theme.colors[borderTone] || borderTone,
          borderLeftWidth: accentColor ? 3 : 1,
          padding,
          borderRadius: theme.radii.lg,
          shadowColor: theme.colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },
});
