import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FlatList, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';

import AppErrorBoundary from './src/components/common/AppErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { AppSettingsProvider, useAppSettings } from './src/contexts/AppSettingsContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useOfflineSync } from './src/hooks/useOfflineSync';

const configureGlobalScrollDefaults = () => {
  if (configureGlobalScrollDefaults.didRun) {
    return;
  }

  configureGlobalScrollDefaults.didRun = true;

  try {
    ScrollView.defaultProps = {
      ...ScrollView.defaultProps,
      keyboardShouldPersistTaps:
        ScrollView.defaultProps?.keyboardShouldPersistTaps ?? 'handled',
      keyboardDismissMode:
        ScrollView.defaultProps?.keyboardDismissMode ??
        (Platform.OS === 'ios' ? 'interactive' : 'on-drag'),
      nestedScrollEnabled: ScrollView.defaultProps?.nestedScrollEnabled ?? true,
      scrollEventThrottle: ScrollView.defaultProps?.scrollEventThrottle ?? 16,
      showsHorizontalScrollIndicator:
        ScrollView.defaultProps?.showsHorizontalScrollIndicator ?? false,
      showsVerticalScrollIndicator:
        ScrollView.defaultProps?.showsVerticalScrollIndicator ?? false,
      overScrollMode: ScrollView.defaultProps?.overScrollMode ?? 'never',
      removeClippedSubviews:
        ScrollView.defaultProps?.removeClippedSubviews ?? (Platform.OS === 'android'),
      contentInsetAdjustmentBehavior:
        ScrollView.defaultProps?.contentInsetAdjustmentBehavior ?? 'automatic',
      automaticallyAdjustKeyboardInsets:
        ScrollView.defaultProps?.automaticallyAdjustKeyboardInsets ?? (Platform.OS === 'ios'),
      decelerationRate:
        ScrollView.defaultProps?.decelerationRate ?? (Platform.OS === 'ios' ? 'normal' : 0.992),
    };

    FlatList.defaultProps = {
      ...FlatList.defaultProps,
      keyboardShouldPersistTaps:
        FlatList.defaultProps?.keyboardShouldPersistTaps ?? 'handled',
      keyboardDismissMode:
        FlatList.defaultProps?.keyboardDismissMode ??
        (Platform.OS === 'ios' ? 'interactive' : 'on-drag'),
      nestedScrollEnabled: FlatList.defaultProps?.nestedScrollEnabled ?? true,
      scrollEventThrottle: FlatList.defaultProps?.scrollEventThrottle ?? 16,
      showsHorizontalScrollIndicator:
        FlatList.defaultProps?.showsHorizontalScrollIndicator ?? false,
      showsVerticalScrollIndicator:
        FlatList.defaultProps?.showsVerticalScrollIndicator ?? false,
      overScrollMode: FlatList.defaultProps?.overScrollMode ?? 'never',
      removeClippedSubviews:
        FlatList.defaultProps?.removeClippedSubviews ?? (Platform.OS === 'android'),
      contentInsetAdjustmentBehavior:
        FlatList.defaultProps?.contentInsetAdjustmentBehavior ?? 'automatic',
      automaticallyAdjustKeyboardInsets:
        FlatList.defaultProps?.automaticallyAdjustKeyboardInsets ?? (Platform.OS === 'ios'),
      decelerationRate:
        FlatList.defaultProps?.decelerationRate ?? (Platform.OS === 'ios' ? 'normal' : 0.992),
    };
  } catch (error) {
    console.warn('Unable to configure default ScrollView/FlatList behavior:', error);
  }
};

configureGlobalScrollDefaults();

function AppShell() {
  const { themeAppearanceMode, themeColors } = useAppSettings();
  const isDarkTheme = themeAppearanceMode === 'dark';
  const [retryKey, setRetryKey] = useState(0);

  useOfflineSync();

  const navigationTheme = {
    ...(isDarkTheme ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkTheme ? DarkTheme.colors : DefaultTheme.colors),
      background: themeColors.background,
      border: themeColors.border,
      card: themeColors.surface,
      notification: themeColors.danger,
      primary: themeColors.primary,
      text: themeColors.text,
    },
  };

  return (
    <ThemeProvider value={{ colors: themeColors }}>
      <AppErrorBoundary
        accentColor={themeColors.primary}
        backgroundColor={themeColors.background}
        cardColor={themeColors.surface}
        key={retryKey}
        mutedTextColor={themeColors.textSoft}
        onRetry={() => setRetryKey((currentKey) => currentKey + 1)}
        textColor={themeColors.text}
      >
        <GestureHandlerRootView style={[styles.root, { backgroundColor: themeColors.background }]}>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
            <RootNavigator />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <AppShell />
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071523',
  },
});
