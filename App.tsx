import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { AppErrorBoundary } from './src/components/app/AppErrorBoundary';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError('Failed to initialize database');
        // Still allow app to run - DB operations will fail gracefully
        setDbReady(true);
      }
    };
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4FF" />
        <Text style={styles.loadingText}>Initializing LeanRide AI...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A0A0F" />
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
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#8899AA',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
