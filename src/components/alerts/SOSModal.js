import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Modal from '../common/Modal';
import FloatingOrb from '../common/FloatingOrb';

const DEFAULT_BULLETS = [
  'Remain calm and conserve breathing oxygen supply lines.',
  'Activate visual light flashing safety beacons if visible.',
  'Stay at your logged quadrant unless immediate conditions dictate movement.',
];

export default function SOSModal({
  visible,
  countdown = 0,
  isTransmitting = false,
  isSent = false,
  title = 'EMERGENCY SOS ACTIVATED',
  subtitle = 'Broadcasting critical distress telemetry maps and vital logs directly to surface command dispatch stations automatically.',
  transmittingLabel = 'SENDING',
  secondsLabel = 'SECONDS',
  cancelLabel = 'CANCEL DISTRESS SIGNAL',
  returnLabel = 'RETURN TO MAIN DASHBOARD',
  successTitle = 'SIGNAL TRANSMITTED',
  successBody = 'Your emergency distress token has been broadcast successfully. Surface controllers and mine rescue response units have been deployed to your active telemetry area.',
  safetyTitle = 'SAFETY DIRECTIVES:',
  safetyBullets = DEFAULT_BULLETS,
  onCancel,
  onReturnHome,
  onRequestClose,
}) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.16,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop?.();
    };
  }, [pulseAnim]);

  const resolvedClose = onRequestClose || (isSent ? onReturnHome : onCancel);
  const countdownValue = Math.max(0, Number(countdown) || 0);
  const countdownAccessibilityLabel =
    countdownValue === 1 ? '1 second remaining.' : `${countdownValue} seconds remaining.`;

  return (
    <Modal
      visible={visible}
      onRequestClose={resolvedClose}
      overlayStyle={styles.overlay}
      contentStyle={styles.card}
      dismissible={false}
      maxWidth={460}
      tone="surface"
    >
      <View style={styles.decorations} pointerEvents="none">
        <FloatingOrb
          delay={400}
          driftX={10}
          driftY={10}
          duration={8400}
          style={styles.pageOrbPrimary}
        />
        <FloatingOrb
          delay={1300}
          driftX={12}
          driftY={8}
          duration={9200}
          style={styles.pageOrbSecondary}
        />
        <FloatingOrb
          delay={2000}
          driftX={7}
          driftY={7}
          duration={7000}
          style={styles.pageOrbMini}
        />
      </View>

      {!isSent ? (
        <View style={styles.innerWrapper}>
          <Text style={styles.warningTitle}>{title}</Text>
          <Text style={styles.warningSubtitle}>{subtitle}</Text>

          <View style={styles.pulseContainerFrame}>
            <Animated.View
              style={[
                styles.pulseCircleBackdrop,
                {
                  backgroundColor: theme.withAlpha(theme.colors.danger, 0.16),
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View style={styles.centerTimerCoreCard}>
              {isTransmitting ? (
                <ActivityIndicator size="large" color={theme.colors.surface} />
              ) : (
                <Text style={styles.countdownNumberText}>{countdownValue}</Text>
              )}
              <Text style={styles.secTextLabel}>{isTransmitting ? transmittingLabel : secondsLabel}</Text>
            </View>
          </View>

          <Button
            label={cancelLabel}
            onPress={onCancel}
            style={styles.cancelButton}
            variant="danger"
          />
        </View>
      ) : (
        <View style={styles.innerWrapper}>
          <View style={styles.successCheckIconContainer}>
            <View style={styles.checkGlyph}>
              <View style={styles.checkGlyphShort} />
              <View style={styles.checkGlyphLong} />
            </View>
          </View>

          <Text style={styles.transmittedHeaderTitle}>{successTitle}</Text>
          <Text style={styles.transmittedBodyText}>{successBody}</Text>

          <Card
            accentColor={theme.colors.warning}
            style={styles.instructionDataCard}
            tone="surfaceAlt"
          >
            <Text style={styles.cardInfoLabel}>{safetyTitle}</Text>
            {safetyBullets.map((bullet) => (
              <Text key={bullet} style={styles.cardBulletText}>
                {'\u2022'} {bullet}
              </Text>
            ))}
          </Card>

          <Button
            label={returnLabel}
            onPress={onReturnHome}
            style={styles.returnButton}
          />
        </View>
      )}

      {resolvedClose ? (
        <Pressable accessibilityRole="button" onPress={resolvedClose} style={styles.closeHitSlop}>
          <View style={styles.closeAffordance}>
            <Icon color={theme.colors.textSoft} name="close" size={18} />
          </View>
        </Pressable>
      ) : null}
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      paddingHorizontal: theme.spacing.screen,
      paddingVertical: theme.spacing.lg,
    },
    card: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      borderRadius: theme.radii.xl,
      borderColor: theme.colors.danger,
    },
    decorations: {
      ...StyleSheet.absoluteFillObject,
    },
    pageOrbPrimary: {
      position: 'absolute',
      top: 38,
      right: -14,
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.14),
    },
    pageOrbSecondary: {
      position: 'absolute',
      bottom: 160,
      left: -18,
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.1),
    },
    pageOrbMini: {
      position: 'absolute',
      top: 220,
      left: 18,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.withAlpha(theme.colors.danger, 0.1),
    },
    innerWrapper: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    warningTitle: {
      color: theme.colors.danger,
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
    },
    warningSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    pulseContainerFrame: {
      alignItems: 'center',
      height: 210,
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      width: '100%',
    },
    pulseCircleBackdrop: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
    },
    centerTimerCoreCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.pill,
      height: 140,
      justifyContent: 'center',
      width: 140,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.26,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 9,
    },
    countdownNumberText: {
      color: theme.colors.surface,
      fontSize: 44,
      fontWeight: '900',
      lineHeight: 50,
    },
    secTextLabel: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      marginTop: 4,
    },
    cancelButton: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.md,
    },
    successCheckIconContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.successSoft,
      borderColor: theme.colors.success,
      borderRadius: theme.radii.pill,
      borderWidth: 2,
      height: 88,
      justifyContent: 'center',
      marginTop: theme.spacing.xs,
      width: 88,
    },
    checkGlyph: {
      width: 34,
      height: 34,
      position: 'relative',
    },
    checkGlyphShort: {
      position: 'absolute',
      left: 4,
      top: 16,
      width: 12,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.success,
      transform: [{ rotate: '45deg' }],
    },
    checkGlyphLong: {
      position: 'absolute',
      left: 11,
      top: 11,
      width: 20,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.success,
      transform: [{ rotate: '-45deg' }],
    },
    transmittedHeaderTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 0.6,
      marginTop: theme.spacing.lg,
      textAlign: 'center',
    },
    transmittedBodyText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    instructionDataCard: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
    },
    cardInfoLabel: {
      color: theme.colors.warning,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    cardBulletText: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 20,
      marginTop: theme.spacing.xs,
    },
    returnButton: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.lg,
    },
    closeHitSlop: {
      position: 'absolute',
      top: 12,
      right: 12,
      padding: 6,
    },
    closeAffordance: {
      alignItems: 'center',
      backgroundColor: theme.withAlpha(theme.colors.surface, 0.78),
      borderColor: theme.colors.border,
      borderRadius: theme.radii.pill,
      borderWidth: 1,
      height: 34,
      justifyContent: 'center',
      width: 34,
    },
  });
