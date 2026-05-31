import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';

import { useI18n } from '../contexts/AppSettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import HazardDetailScreen from '../screens/worker/HazardDetailScreen';
import SafetyTipsScreen from '../screens/worker/SafetyTipsScreen';
import VisitorAlertScreen from '../screens/visitor/VisitorAlertScreen';
import VisitorDashboardScreen from '../screens/visitor/VisitorDashboardScreen';
import VisitorHazardsScreen from '../screens/visitor/VisitorHazardsScreen';
import typography from '../styles/typography';

const Stack = createStackNavigator();

export default function VisitorNavigator() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 18,
          ...typography.heading,
        },
      }}
    >
      <Stack.Screen
        component={VisitorDashboardScreen}
        name="VisitorDashboard"
        options={{ title: t('nav.visitor.dashboard') }}
      />
      <Stack.Screen
        component={VisitorHazardsScreen}
        name="HazardListScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={VisitorAlertScreen}
        name="NotificationScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={SafetyTipsScreen}
        name="SafetyTipsScreen"
        options={{ title: t('nav.visitor.safetyTips') }}
      />
      <Stack.Screen
        component={HazardDetailScreen}
        name="HazardDetailScreen"
        options={{ title: t('nav.visitor.details') }}
      />
    </Stack.Navigator>
  );
}
