import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/DashboardScreen';
import { RideHistoryScreen } from '../screens/RideHistoryScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RideDetailScreen } from '../screens/RideDetailScreen';
import { HUDScreen } from '../screens/HUDScreen';
import { CalibrationScreen } from '../screens/CalibrationScreen';
import { useI18n } from '../i18n';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E4E5E6',
    background: '#151617',
    card: '#151617',
    text: '#FFFFFF',
    border: '#141516',
    notification: '#F38BA8',
  },
};

function TabNavigator() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#151617',
          borderTopColor: '#141516',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#E4E5E6',
        tabBarInactiveTintColor: '#8B90A7',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.dashboard') }} />
      <Tab.Screen name="History" component={RideHistoryScreen} options={{ title: t('nav.history') }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: t('nav.analytics') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('nav.settings') }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { t } = useI18n();

  return (
    <NavigationContainer theme={darkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#151617' },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="RideDetail"
          component={RideDetailScreen}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="HUD"
          component={HUDScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Calibration"
          component={CalibrationScreen}
          options={{
            presentation: 'card',
            headerShown: true,
            headerStyle: { backgroundColor: '#151617' },
            headerTintColor: '#E4E5E6',
            headerTitle: t('nav.calibration'),
            headerTitleStyle: { color: '#FFFFFF', fontWeight: '700' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
