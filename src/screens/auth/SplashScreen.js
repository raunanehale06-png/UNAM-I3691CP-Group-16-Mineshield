import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import FloatingOrb from '../components/common/FloatingOrb';
import SafeAreaView from '../components/common/SafeAreaView';
import { useTheme } from '../contexts/ThemeContext';

const mineShieldLogo = require('../../assets/mineShield-logo.png');

export default function SplashScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <FloatingOrb
          delay={200}
          driftX={14}
          driftY={14}
          duration={9600}
          style={[
            styles.orbPrimary,
            { backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.18) },
          ]}
        />
        <FloatingOrb
          delay={900}
          driftX={16}
          driftY={10}
          duration={10400}
          style={[
            styles.orbSecondary,
            { backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.12) },
          ]}
        />
        <FloatingOrb
          delay={1400}
          driftX={11}
          driftY={9}
          duration={8800}
          style={[
            styles.orbTertiary,
            { backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.14) },
          ]}
        />
        <FloatingOrb
          delay={2100}
          driftX={8}
          driftY={8}
          duration={7600}
          style={[
            styles.orbQuaternary,
            { backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.11) },
          ]}
        />

        <View
          style={[
            styles.logoShell,
            {
              backgroundColor: theme.withAlpha(theme.colors.surfaceStrong, 0.76),
              borderColor: theme.withAlpha(theme.colors.warning, 0.24),
            },
          ]}
        >
          <Image source={mineShieldLogo} style={styles.logo} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>MineShield</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Safety reporting, alerting, and site awareness for every shift.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  orbPrimary: {
    position: 'absolute',
    top: 56,
    right: -44,
    width: 208,
    height: 208,
    borderRadius: 104,
  },
  orbSecondary: {
    position: 'absolute',
    bottom: 78,
    left: -68,
    width: 228,
    height: 228,
    borderRadius: 114,
  },
  orbTertiary: {
    position: 'absolute',
    top: 142,
    left: 24,
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  orbQuaternary: {
    position: 'absolute',
    bottom: 162,
    right: 32,
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  logoShell: {
    width: 182,
    height: 182,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 138,
    height: 138,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    textAlign: 'center',
  },
});
