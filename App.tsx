import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { AppErrorBoundary } from './src/components/app/AppErrorBoundary';
import { t } from './src/i18n';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        // Lock to portrait by default; the dashboard button will unlock as needed.
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(t('app.databaseInitFailed'));
        // Still allow app to run - DB operations will fail gracefully
        setDbReady(true);
      }
    };
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E4E5E6" />
        <Text style={styles.loadingText}>{t('app.initializing')}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#151617" />
        <AppErrorBoundary context="root-navigation">
          <AppNavigator />
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#151617',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#151617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#8B90A7',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
