import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
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
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
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
import { useI18n } from '../i18n';

const FLOATING_BUTTON_TOP = 120;

const TAB_BAR_DEFAULT_STYLE = {
  backgroundColor: '#151617',
  borderTopColor: '#141516',
  borderTopWidth: 1,
};

export const DashboardScreen: React.FC = () => {
  const { t } = useI18n();
  const { isRiding, currentMetrics, startRide, stopRide } = useRideStore();
  const { startTracking, stopTracking, isAvailable } = useRideTracking();
  const { keepScreenOn, voiceAlertsEnabled, highLeanAngleThreshold, unitSystem } =
    useSettingsStore();
  const [isLandscape, setIsLandscape] = useState(false);
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const SCREEN_WIDTH = width;

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

  // Hide / show tab bar based on landscape state
  useEffect(() => {
    if (isLandscape) {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.getParent()?.setOptions({ tabBarStyle: TAB_BAR_DEFAULT_STYLE });
    }
  }, [isLandscape, navigation]);

  // Restore portrait when screen loses focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', async () => {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      }
    });
    return unsubscribe;
  }, [isLandscape, navigation]);

  const handleToggleLandscape = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLandscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      setIsLandscape(true);
    }
  }, [isLandscape]);

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
  const leanColor = isLeft ? '#E4E5E6' : isRight ? '#F38BA8' : '#8B90A7';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#151617" />

      <AppErrorBoundary context="dashboard-screen">
        <TouchableOpacity
          style={styles.floatingLandscapeButton}
          onPress={handleToggleLandscape}
          activeOpacity={0.85}
        >
          <Text style={styles.floatingLandscapeButtonIcon}>{isLandscape ? '↕' : '↔'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.floatingRideButton,
            { backgroundColor: isRiding ? '#F38BA8' : '#E4E5E6' },
          ]}
          onPress={handleToggleRide}
          activeOpacity={0.85}
        >
          <Text style={styles.floatingRideButtonIcon}>{isRiding ? '■' : '▶'}</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.headerStat}>
              <Text style={styles.headerLabel}>{t('dashboard.time')}</Text>
              <Text style={styles.headerValue}>
                {formatDuration(currentMetrics.elapsedTime)}
              </Text>
            </View>
            <View style={styles.statusDot}>
              <View style={[styles.dot, { backgroundColor: isRiding ? '#7FD1B9' : '#8B90A7' }]} />
              <Text style={styles.statusText}>{isRiding ? t('dashboard.riding') : t('dashboard.idle')}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerLabel}>{t('dashboard.distance')}</Text>
              <Text style={styles.headerValue}>
                {formatDistance(currentMetrics.distance, unitSystem)}
              </Text>
            </View>
          </View>

          {/* Sensor status */}
          {!isAvailable && (
            <View style={styles.sensorWarning}>
              <Text style={styles.sensorWarningText}>{t('dashboard.sensorsUnavailable')}</Text>
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
            <View style={styles.metricCardItem}>
              <MetricCard
                title={t('dashboard.speed')}
                value={currentMetrics.speed}
                unit={unitSystem === 'imperial' ? 'mph' : 'km/h'}
                color="#7FD1B9"
                size="small"
              />
            </View>
            <View style={styles.metricCardItem}>
              <MetricCard
                title={t('dashboard.gForce')}
                value={currentMetrics.gForce}
                unit="G"
                color="#F2C27B"
                size="small"
              />
            </View>
            <View style={styles.metricCardItem}>
              <MetricCard
                title={t('dashboard.maxLean')}
                value={currentMetrics.maxLeanAngleSession}
                unit="deg"
                color="#E4E5E6"
                size="small"
              />
            </View>
            <View style={styles.metricCardItem}>
              <MetricCard
                title={t('dashboard.maxSpeed')}
                value={currentMetrics.maxSpeedSession}
                unit={unitSystem === 'imperial' ? 'mph' : 'km/h'}
                color="#B7A6FF"
                size="small"
              />
            </View>
          </View>

          {/* L/R max lean row */}
          <View style={styles.lrRow}>
            <View style={styles.lrCard}>
              <Text style={styles.lrLabel}>{t('dashboard.maxLeft')}</Text>
              <Text style={[styles.lrValue, { color: '#E4E5E6' }]}>
                {Math.abs(currentMetrics.leftMaxAngle).toFixed(1)}°
              </Text>
            </View>
            <View style={styles.lrDivider} />
            <View style={styles.lrCard}>
              <Text style={styles.lrLabel}>{t('dashboard.maxRight')}</Text>
              <Text style={[styles.lrValue, { color: '#F38BA8' }]}>
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
                  { backgroundColor: isRiding ? '#F38BA8' : '#E4E5E6' },
                ]}
                onPress={handleToggleRide}
                activeOpacity={0.85}
              >
                <Text style={styles.rideButtonText}>
                  {isRiding ? t('dashboard.stopRide') : t('dashboard.startRide')}
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
    backgroundColor: '#151617',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  floatingRideButton: {
    position: 'absolute',
    top: FLOATING_BUTTON_TOP,
    right: 16,
    zIndex: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  floatingRideButtonIcon: {
    color: '#141516',
    fontSize: 22,
    fontWeight: '900',
    marginLeft: 1,
  },
  floatingLandscapeButton: {
    position: 'absolute',
    top: FLOATING_BUTTON_TOP,
    left: 16,
    zIndex: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2A2F3D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  floatingLandscapeButtonIcon: {
    color: '#E4E5E6',
    fontSize: 22,
    fontWeight: '900',
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
    color: '#8B90A7',
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
    color: '#8B90A7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sensorWarning: {
    backgroundColor: '#F38BA822',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 8,
    marginBottom: 8,
  },
  sensorWarningText: {
    color: '#F38BA8',
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
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  metricCardItem: {
    width: '48%',
  },
  lrRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#141516',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F3D',
    marginVertical: 8,
  },
  lrCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  lrLabel: {
    color: '#8B90A7',
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
    backgroundColor: '#2A2F3D',
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
    color: '#141516',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
