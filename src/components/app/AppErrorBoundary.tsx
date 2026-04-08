import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { t } from '../../i18n';

interface Props {
  children: React.ReactNode;
  context?: string;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.context ?? 'app'}]`, error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{t('errorBoundary.title')}</Text>
          <Text style={styles.subtitle}>
            {t('errorBoundary.context', { context: this.props.context ?? 'app' })}
          </Text>
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            <Text style={styles.errorText}>{this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8B90A7',
    fontSize: 13,
    fontWeight: '600',
  },
  panel: {
    alignSelf: 'stretch',
    maxHeight: 220,
    backgroundColor: '#151520',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2F3D',
  },
  panelContent: {
    padding: 16,
  },
  errorText: {
    color: '#FFB4AC',
    fontSize: 13,
    lineHeight: 18,
  },
});
