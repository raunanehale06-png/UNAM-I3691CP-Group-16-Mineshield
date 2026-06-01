import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { useI18n } from '../contexts/AppSettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen component={LoginScreen} name="Login" options={{ title: t('nav.auth.login') }} />
      <Stack.Screen
        component={RegisterScreen}
        name="Register"
        options={{ title: t('nav.auth.register') }}
      />
      <Stack.Screen
        component={ForgotPasswordScreen}
        name="ForgotPassword"
        options={{ title: t('nav.auth.forgotPassword') }}
      />
    </Stack.Navigator>
  );
}
