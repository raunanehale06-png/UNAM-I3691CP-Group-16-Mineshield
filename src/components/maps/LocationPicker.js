import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../common/Button';
import Card from '../common/Card';
import InputField from '../common/InputField';
import { useTheme } from '../../contexts/ThemeContext';

export default function LocationPicker({
  label = 'Location',
  value = '',
  placeholder = 'Enter a place, zone, or landmark',
  helperText = 'Choose the place you want to attach to this report.',
  loading = false,
  onChangeText,
  onUseCurrentLocation,
  onClear,
  currentLocationLabel = 'Use current GPS location',
  clearLabel = 'Clear location',
}) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.label, { color: theme.colors.textSoft }]}>{label}</Text>

      <InputField
        autoCapitalize="words"
        autoCorrect={false}
        label=""
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />

      <Text style={[styles.helper, { color: theme.colors.textMuted }]}>{helperText}</Text>

      <View style={styles.actions}>
        <Button
          label={loading ? 'Locating...' : currentLocationLabel}
          loading={loading}
          onPress={onUseCurrentLocation}
          style={styles.primaryButton}
        />

        <Button
          label={clearLabel}
          onPress={onClear}
          style={styles.secondaryButton}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  actions: {
    marginTop: 14,
  },
  primaryButton: {
    marginBottom: 10,
  },
  secondaryButton: {
    marginBottom: 0,
  },
});
