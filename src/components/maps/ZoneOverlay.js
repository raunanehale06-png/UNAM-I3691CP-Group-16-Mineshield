import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import colors, { withAlpha } from '../../styles/colors';

function ZoneOverlay({
  zoneType = 'safe',
  coordinates,
  label,
  showLabel = true,
  alerted = false,
}) {
  const { top = 0, left = 0, width = 70, height = 70 } = coordinates || {};
  const alertPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!(alerted && zoneType === 'danger')) {
      alertPulse.stopAnimation();
      alertPulse.setValue(0);
      return undefined;
    }

    alertPulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(alertPulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(alertPulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      alertPulse.stopAnimation();
    };
  }, [alertPulse, alerted, zoneType]);

  const getZoneStyle = () => {
    switch (zoneType) {
      case 'danger':
        return {
          backgroundColor: withAlpha(colors.danger, 0.18),
          borderColor: withAlpha(colors.danger, 0.52),
        };
      case 'warning':
        return {
          backgroundColor: withAlpha(colors.warning, 0.15),
          borderColor: withAlpha(colors.warningStrong, 0.5),
        };
      case 'safe':
        return {
          backgroundColor: withAlpha(colors.success, 0.14),
          borderColor: withAlpha(colors.successGlow, 0.4),
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: withAlpha(colors.textSoft, 0.3),
        };
    }
  };

  return (
    <View
      style={[
        styles.zone,
        {
          top,
          left,
          width,
          height,
          borderRadius: width / 2,
          ...getZoneStyle(),
        },
      ]}
    >
      {alerted && zoneType === 'danger' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.alertRing,
            {
              borderColor: withAlpha(colors.danger, 0.7),
              opacity: alertPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.12, 0.72],
              }),
              transform: [
                {
                  scale: alertPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
              width: width + 12,
              height: height + 12,
              borderRadius: (Math.max(width, height) + 12) / 2,
              top: -6,
              left: -6,
            },
          ]}
        />
      ) : null}
      {showLabel && label ? (
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default React.memo(ZoneOverlay);

const styles = StyleSheet.create({
  zone: {
    position: 'absolute',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  labelPill: {
    backgroundColor: withAlpha(colors.surface, 0.92),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(colors.borderStrong, 0.46),
    maxWidth: '80%',
  },
  labelText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
