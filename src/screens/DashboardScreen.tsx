import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useRideStore } from '../store/rideStore';
import { useRideTracking } from '../hooks/useRideTracking';
import { useSettingsStore } from '../store/settingsStore';
import { LeanAngleGauge } from '../components/gauges/LeanAngleGauge';
import { SpeedGauge } from '../components/gauges/SpeedGauge';
import { GForceGauge } from '../components/gauges/GForceGauge';
import { MetricCard } from '../components/common/MetricCard';
import { voiceService } from '../services/voiceService';
import { formatDuration, formatDistance } from '../utils/calculations';
import { AppErrorBoundary } from '../components/app/AppErrorBoundary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { isRiding, currentMetrics, startRide, stopRide } = useRideStore();
  const { startTracking, stopTracking, isAvailable } = useRideTracking();
  const { keepScreenOn, voiceAlertsEnabled, highLeanAngleThreshold, unitSystem } =
    useSettingsStore();

  useKeepAwake();

  const pulseAnim = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value * 0.9 + 0.1,
  }));

  useEffect(() => {
    voiceService.setEnabled(voiceAlertsEnabled);
  }, [voiceAlertsEnabled]);

  useEffect(() => {
    if (isRiding) {
      pulseAnim.value = withRepeat(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 200 });
    }
  }, [isRiding]);

  useEffect(() => {
    if (
      isRiding &&
      voiceAlertsEnabled &&
      Math.abs(currentMetrics.leanAngle) > highLeanAngleThreshold
    ) {
      voiceService.announceHighLeanAngle(currentMetrics.leanAngle);
    }
  }, [currentMetrics.leanAngle, isRiding, voiceAlertsEnabled, highLeanAngleThreshold]);

  const handleToggleRide = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isRiding) {
      await stopTracking();
      await stopRide();
      voiceService.announceRideEnd({
        distance: currentMetrics.distance,
        duration: currentMetrics.elapsedTime,
        maxLeanAngle: currentMetrics.maxLeanAngleSession,
      });
    } else {
      startRide();
      await startTracking();
      voiceService.announceRideStart();
    }
  }, [isRiding, stopTracking, stopRide, startTracking, startRide, currentMetrics]);

  const leanAngle = currentMetrics.leanAngle;
  const isLeft = leanAngle < -0.5;
  const isRight = leanAngle > 0.5;
  const leanColor = isLeft ? '#00B4FF' : isRight ? '#FF3A2F' : '#8899AA';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <AppErrorBoundary context="dashboard-screen">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.headerStat}>
              <Text style={styles.headerLabel}>TIME</Text>
              <Text style={styles.headerValue}>
                {formatDuration(currentMetrics.elapsedTime)}
              </Text>
            </View>
            <View style={styles.statusDot}>
              <View style={[styles.dot, { backgroundColor: isRiding ? '#00D97E' : '#8899AA' }]} />
              <Text style={styles.statusText}>{isRiding ? 'RIDING' : 'IDLE'}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerLabel}>DIST</Text>
              <Text style={styles.headerValue}>
                {formatDistance(currentMetrics.distance, unitSystem)}
              </Text>
            </View>
          </View>

          {/* Sensor status */}
          {!isAvailable && (
            <View style={styles.sensorWarning}>
              <Text style={styles.sensorWarningText}>Sensors unavailable - simulation mode</Text>
            </View>
          )}

          {/* Main lean angle gauge */}
          <View style={styles.gaugeContainer}>
            <LeanAngleGauge
              leanAngle={leanAngle}
              maxLeft={currentMetrics.leftMaxAngle}
              maxRight={currentMetrics.rightMaxAngle}
              size={Math.min(SCREEN_WIDTH - 32, 300)}
            />
          </View>

          {/* Speed + GForce row */}
          <View style={styles.secondaryGaugesRow}>
            <SpeedGauge
              speed={currentMetrics.speed}
              maxSpeed={currentMetrics.maxSpeedSession}
              unit={unitSystem}
              size={160}
            />
            <GForceGauge
              gForceX={currentMetrics.gForceX}
              gForceY={currentMetrics.gForceY}
              size={160}
            />
          </View>

          {/* Metric cards row */}
          <View style={styles.metricsRow}>
            <MetricCard
              title="SPEED"
              value={currentMetrics.speed}
              unit={unitSystem === 'imperial' ? 'mph' : 'km/h'}
              color="#00D97E"
              size="small"
            />
            <MetricCard
              title="G-FORCE"
              value={currentMetrics.gForce}
              unit="G"
              color="#FF8800"
              size="small"
            />
            <MetricCard
              title="MAX LEAN"
              value={currentMetrics.maxLeanAngleSession}
              unit="deg"
              color="#00B4FF"
              size="small"
            />
            <MetricCard
              title="MAX SPEED"
              value={currentMetrics.maxSpeedSession}
              unit={unitSystem === 'imperial' ? 'mph' : 'km/h'}
              color="#8800FF"
              size="small"
            />
          </View>

          {/* L/R max lean row */}
          <View style={styles.lrRow}>
            <View style={styles.lrCard}>
              <Text style={styles.lrLabel}>◄ MAX LEFT</Text>
              <Text style={[styles.lrValue, { color: '#00B4FF' }]}>
                {Math.abs(currentMetrics.leftMaxAngle).toFixed(1)}°
              </Text>
            </View>
            <View style={styles.lrDivider} />
            <View style={styles.lrCard}>
              <Text style={styles.lrLabel}>MAX RIGHT ►</Text>
              <Text style={[styles.lrValue, { color: '#FF3A2F' }]}>
                {Math.abs(currentMetrics.rightMaxAngle).toFixed(1)}°
              </Text>
            </View>
          </View>

          {/* Start/Stop button */}
          <View style={styles.buttonContainer}>
            <Animated.View style={pulseStyle}>
              <TouchableOpacity
                style={[
                  styles.rideButton,
                  { backgroundColor: isRiding ? '#FF3A2F' : '#00B4FF' },
                ]}
                onPress={handleToggleRide}
                activeOpacity={0.85}
              >
                <Text style={styles.rideButtonText}>
                  {isRiding ? '■  STOP RIDE' : '▶  START RIDE'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </AppErrorBoundary>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  headerLabel: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  statusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#8899AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sensorWarning: {
    backgroundColor: '#FF3A2F22',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 8,
    marginBottom: 8,
  },
  sensorWarningText: {
    color: '#FF3A2F',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryGaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  lrRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#223344',
    marginVertical: 8,
  },
  lrCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  lrLabel: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  lrValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  lrDivider: {
    width: 1,
    backgroundColor: '#223344',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  rideButton: {
    borderRadius: 50,
    paddingVertical: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  rideButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
