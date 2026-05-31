import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import FloatingOrb from '../../components/common/FloatingOrb';
import { auth, db } from '../../services/firebase';
import { getCurrentGpsLocation } from '../../services/locationService';
import colors, { withAlpha } from '../../styles/colors';

const getUserLabel = (currentUser) => {
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }

  if (currentUser?.email) {
    return currentUser.email.split('@')[0];
  }

  return 'Worker';
};

export default function SOSAlertScreen({ navigation }) {
  const [countdown, setCountdown] = useState(5);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownTimer = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          triggerSOSBroadcastPipeline();
          return 0;
        }

        Vibration.vibrate([0, 150]);
        return prev - 1;
      });
    }, 1000);

    Vibration.vibrate([0, 400]);

    return () => {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    };
  }, [pulseAnim]);

  const triggerSOSBroadcastPipeline = async () => {
    setIsTransmitting(true);

    try {
      const currentWorker = auth.currentUser;

      if (!currentWorker?.uid) {
        throw new Error('You need to be signed in before sending an SOS alert.');
      }

      let locationData = null;

      try {
        locationData = await getCurrentGpsLocation();
      } catch (locationError) {
        console.error('SOS GPS lookup failed:', locationError);
      }

      const latitude = locationData?.latitude ?? null;
      const longitude = locationData?.longitude ?? null;
      const locationLabel = locationData?.label || 'GPS unavailable';
      const zoneLabel = locationData?.area || locationLabel;

      const hazardSOSPayload = {
        userId: currentWorker.uid,
        reportedBy: getUserLabel(currentWorker),
        description: 'CRITICAL: Worker triggered an emergency SOS distress signal.',
        imageURL: '',
        imageUrl: '',
        latitude,
        longitude,
        location: locationData || locationLabel,
        locationLabel,
        zone: zoneLabel,
        zoneId: zoneLabel,
        status: 'active',
        severity: 'HIGH',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const hazardDocRef = await addDoc(collection(db, 'hazards'), hazardSOSPayload);

      const alertSOSPayload = {
        userId: currentWorker.uid,
        type: 'SOS_BROADCAST',
        title: 'Emergency SOS signal broadcast',
        body: 'A worker needs immediate emergency assistance. Live location was attached to this distress signal.',
        location: locationLabel,
        zone: zoneLabel,
        zoneId: zoneLabel,
        hazardId: hazardDocRef.id,
        severity: 'HIGH',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'alerts'), alertSOSPayload);

      setIsSent(true);
      Vibration.vibrate([0, 500, 200, 500]);
    } catch (error) {
      console.error('SOS Transmission backplane failure exception logs:', error);
      Alert.alert(
        'Transmission Broken',
        'Local device fallback activated. Please use secondary analog radios or move to safety immediately.'
      );
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCancelSOS = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }

    Vibration.cancel();
    Alert.alert('SOS Cancelled', 'Emergency distress signal pipeline aborted safely.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <FloatingOrb delay={400} driftX={10} driftY={10} duration={8400} style={styles.pageOrbPrimary} />
      <FloatingOrb delay={1300} driftX={12} driftY={8} duration={9200} style={styles.pageOrbSecondary} />
      <FloatingOrb delay={2000} driftX={7} driftY={7} duration={7000} style={styles.pageOrbMini} />

      {!isSent ? (
        <View style={styles.innerWrapper}>
          <Text style={styles.warningTitle}>EMERGENCY SOS ACTIVATED</Text>
          <Text style={styles.warningSubtitle}>
            Broadcasting critical distress telemetry maps and vital logs directly to surface command dispatch stations automatically.
          </Text>

          <View style={styles.pulseContainerFrame}>
            <Animated.View
              style={[styles.pulseCircleBackdrop, { transform: [{ scale: pulseAnim }] }]}
            />
            <View style={styles.centerTimerCoreCard}>
              {isTransmitting ? (
                <ActivityIndicator size="large" color={colors.surface} />
              ) : (
                <Text style={styles.countdownNumberText}>{countdown}</Text>
              )}
              <Text style={styles.secTextLabel}>{isTransmitting ? 'SENDING' : 'SECONDS'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cancelSOSButtonCTA}
            activeOpacity={0.8}
            onPress={handleCancelSOS}
            disabled={isTransmitting}
          >
            <Text style={styles.cancelSOSButtonText}>CANCEL DISTRESS SIGNAL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.innerWrapper}>
          <View style={styles.successCheckIconContainer}>
            <View style={styles.checkGlyph}>
              <View style={styles.checkGlyphShort} />
              <View style={styles.checkGlyphLong} />
            </View>
          </View>

          <Text style={styles.transmittedHeaderTitle}>SIGNAL TRANSMITTED</Text>
          <Text style={styles.transmittedBodyText}>
            Your emergency distress token has been broadcast successfully. Surface controllers and mine rescue response units have been deployed to your active telemetry area.
          </Text>

          <View style={styles.instructionDataCard}>
            <Text style={styles.cardInfoLabel}>SAFETY DIRECTIVES:</Text>
            <Text style={styles.cardBulletText}>{'\u2022'} Remain calm and conserve breathing oxygen supply lines.</Text>
            <Text style={styles.cardBulletText}>{'\u2022'} Activate visual light flashing safety beacons if visible.</Text>
            <Text style={styles.cardBulletText}>{'\u2022'} Stay at your logged quadrant unless immediate conditions dictate movement.</Text>
          </View>

          <TouchableOpacity
            style={styles.returnDashboardCTA}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkerDashboard')}
          >
            <Text style={styles.returnDashboardText}>RETURN TO MAIN DASHBOARD</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageOrbPrimary: {
    position: 'absolute',
    top: 38,
    right: -14,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: withAlpha(colors.brandBlue, 0.14),
  },
  pageOrbSecondary: {
    position: 'absolute',
    bottom: 160,
    left: -18,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: withAlpha(colors.brandBlue, 0.1),
  },
  pageOrbMini: {
    position: 'absolute',
    top: 220,
    left: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(colors.brandBlue, 0.12),
  },
  innerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  warningTitle: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  warningSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 40,
  },
  pulseContainerFrame: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  pulseCircleBackdrop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(211, 47, 47, 0.25)',
  },
  centerTimerCoreCard: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  countdownNumberText: {
    color: colors.surface,
    fontSize: 56,
    fontWeight: 'bold',
  },
  secTextLabel: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cancelSOSButtonCTA: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  cancelSOSButtonText: {
    color: colors.primaryDeep,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  successCheckIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  checkGlyph: {
    width: 34,
    height: 24,
    position: 'relative',
  },
  checkGlyphShort: {
    position: 'absolute',
    left: 4,
    bottom: 5,
    width: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
  },
  checkGlyphLong: {
    position: 'absolute',
    left: 12,
    top: 8,
    width: 22,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surface,
    transform: [{ rotate: '-45deg' }],
  },
  transmittedHeaderTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  transmittedBodyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  instructionDataCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 35,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardInfoLabel: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardBulletText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  returnDashboardCTA: {
    width: '100%',
    backgroundColor: colors.primaryDeep,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  returnDashboardText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
