import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import colors, { withAlpha } from '../../styles/colors';

export default function MapControls({
  onZoomIn = () => {},
  onZoomOut = () => {},
  onReset = () => {},
}) {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity style={styles.controlButton} onPress={onZoomIn}>
        <Text style={styles.controlText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onZoomOut}>
        <Text style={styles.controlText}>-</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={onReset}>
        <Text style={styles.resetButtonText}>RESET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    right: '8%',
    backgroundColor: withAlpha(colors.backgroundAlt, 0.92),
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  controlButton: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryDeep,
    borderRadius: 10,
    marginVertical: 4,
  },
  controlText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'normal',
  },
  resetButton: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.warning,
    height: 32,
  },
  resetButtonText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
