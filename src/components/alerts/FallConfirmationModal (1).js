import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';
import Card from '../common/Card';

export default function FallConfirmationModal({
  visible,
  countdown,
  eyebrow = 'Sensor alert',
  title = 'Possible fall detected',
  body = 'If you are okay, dismiss this alert. If you need help, open SOS now. An emergency SOS has already been sent.',
  countdownLabel = '10-second countdown',
  countdownHint = 'Auto SOS will send when the timer reaches zero.',
  confirmLabel = 'I am okay',
  escalateLabel = 'Send SOS now',
  onConfirm,
  onEscalate,
  onRequestClose,
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const countdownValue = Math.max(0, Number(countdown) || 0);
  const countdownAccessibilityLabel =
    countdownValue === 1 ? '1 second remaining.' : `${countdownValue} seconds remaining.`;
  const handleRequestClose = onRequestClose || onConfirm;

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleRequestClose}
      transparent
      visible={Boolean(visible)}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleRequestClose} />

        <Card
          accentColor={theme.colors.warning}
          padding={0}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.warning,
            },
          ]}
        >
          <View style={styles.inner}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>

            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>{countdownLabel}</Text>
              <View style={styles.countdownRow}>
                <Text
                  accessibilityLabel={countdownAccessibilityLabel}
                  accessibilityLiveRegion="assertive"
                  accessibilityRole="timer"
                  style={styles.countdownValue}
                >
                  {countdownValue}
                </Text>
                <Text style={styles.countdownUnits}>s</Text>
              </View>
              <Text style={styles.countdownHint}>{countdownHint}</Text>
            </View>

            <Button
              label={confirmLabel}
              onPress={onConfirm}
              style={styles.button}
              variant="secondary"
            />
            <Button
              label={escalateLabel}
              onPress={onEscalate}
              style={styles.button}
              variant="danger"
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.screen,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      borderRadius: theme.radii.xl,
      borderWidth: 1.2,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 7,
    },
    inner: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    eyebrow: {
      color: theme.colors.warning,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 28,
      marginBottom: theme.spacing.xs,
    },
    body: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginBottom: theme.spacing.md,
    },
    countdownBox: {
      alignSelf: 'stretch',
      alignItems: 'center',
      backgroundColor: theme.colors.warningSoft,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    countdownLabel: {
      color: theme.colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    countdownRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    countdownValue: {
      color: theme.colors.text,
      fontSize: 44,
      fontWeight: '800',
      lineHeight: 48,
    },
    countdownUnits: {
      color: theme.colors.textSoft,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      marginLeft: 2,
      textTransform: 'uppercase',
    },
    countdownHint: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    button: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
  });

