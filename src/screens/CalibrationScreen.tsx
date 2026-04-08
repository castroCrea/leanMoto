import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSensors } from '../hooks/useSensors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Slider = require('@react-native-community/slider').default;
import { useSettingsStore } from '../store/settingsStore';
import { calculateLeanAngle } from '../services/leanAngleService';
import { processAccelerometerData } from '../services/sensorService';
import { CalibrationData } from '../types/sensors';
import { useI18n } from '../i18n';

export const CalibrationScreen: React.FC = () => {
  const { t } = useI18n();
  const { accelerometer, isAvailable } = useSensors();
  const { mountAngle, calibrationOffsets, setMountAngle, setCalibrationOffsets, resetCalibration } =
    useSettingsStore();

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const calibration: CalibrationData = {
    offsetX: calibrationOffsets.x,
    offsetY: calibrationOffsets.y,
    offsetZ: calibrationOffsets.z,
    mountAngle,
  };

  const calibratedAccel = processAccelerometerData(accelerometer, calibration);
  const currentLean = calculateLeanAngle(calibratedAccel);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    // Capture current raw accelerometer as offset (assume this is "flat/neutral")
    setTimeout(() => {
      setCalibrationOffsets({
        x: accelerometer.x,
        y: accelerometer.y,
        z: accelerometer.z - 1, // subtract 1G from Z (gravity when upright)
      });
      setIsCalibrating(false);
      setCalibrated(true);
      setTimeout(() => setCalibrated(false), 3000);
    }, 2000);
  };

  const handleReset = () => {
    resetCalibration();
    setCalibrated(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t('calibration.title')}</Text>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📱 {t('calibration.phonePlacement')}</Text>
          <Text style={styles.instructionsText}>{t('calibration.instructions')}</Text>
        </View>

        {/* Live sensor readings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('calibration.liveSensorData')}</Text>
          {!isAvailable && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>{t('calibration.sensorsUnavailable')}</Text>
            </View>
          )}
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.rawX')}</Text>
              <Text style={styles.sensorValue}>{accelerometer.x.toFixed(3)}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.rawY')}</Text>
              <Text style={styles.sensorValue}>{accelerometer.y.toFixed(3)}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.rawZ')}</Text>
              <Text style={styles.sensorValue}>{accelerometer.z.toFixed(3)}</Text>
            </View>
          </View>
          <View style={styles.leanPreview}>
            <Text style={styles.leanPreviewLabel}>{t('calibration.currentLeanAngle')}</Text>
            <Text
              style={[
                styles.leanPreviewValue,
                {
                  color:
                    Math.abs(currentLean) > 45
                      ? '#F38BA8'
                      : Math.abs(currentLean) > 20
                        ? '#F2C27B'
                        : '#E4E5E6',
                },
              ]}
            >
              {currentLean.toFixed(1)}°
            </Text>
            <Text style={styles.leanPreviewDir}>
              {currentLean < -0.5 ? t('calibration.left') : currentLean > 0.5 ? t('calibration.right') : t('calibration.upright')}
            </Text>
          </View>
        </View>

        {/* Current calibration offsets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('calibration.activeOffsets')}</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.offsetX')}</Text>
              <Text style={[styles.sensorValue, { color: '#F2C27B' }]}>
                {calibrationOffsets.x.toFixed(3)}
              </Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.offsetY')}</Text>
              <Text style={[styles.sensorValue, { color: '#F2C27B' }]}>
                {calibrationOffsets.y.toFixed(3)}
              </Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>{t('calibration.offsetZ')}</Text>
              <Text style={[styles.sensorValue, { color: '#F2C27B' }]}>
                {calibrationOffsets.z.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {/* Mount angle slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('calibration.mountAngleCorrection')}</Text>
          <Text style={styles.sliderDescription}>{t('calibration.mountAngleDescription')}</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderBound}>-30°</Text>
            <Slider
              style={styles.slider}
              minimumValue={-30}
              maximumValue={30}
              step={0.5}
              value={mountAngle}
              onValueChange={setMountAngle}
              minimumTrackTintColor="#E4E5E6"
              maximumTrackTintColor="#353B4D"
              thumbTintColor="#E4E5E6"
            />
            <Text style={styles.sliderBound}>+30°</Text>
          </View>
          <Text style={styles.sliderCurrentValue}>
            {t('common.current', { value: `${mountAngle.toFixed(1)}°` })}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.calibrateButton, isCalibrating && styles.buttonDisabled]}
            onPress={handleCalibrate}
            disabled={isCalibrating}
          >
            <Text style={styles.calibrateButtonText}>
              {isCalibrating ? t('calibration.calibrating') : calibrated ? t('calibration.calibrated') : t('calibration.calibrate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>{t('calibration.resetCalibration')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  instructionsCard: {
    backgroundColor: '#E4E5E622',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E4E5E6',
    marginBottom: 8,
  },
  instructionsTitle: {
    color: '#E4E5E6',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#B6BBD0',
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#F38BA822',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  warningText: {
    color: '#F38BA8',
    fontSize: 13,
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#141516',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2F3D',
  },
  sensorLabel: {
    color: '#8B90A7',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  sensorValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  leanPreview: {
    backgroundColor: '#141516',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2A2F3D',
  },
  leanPreviewLabel: {
    color: '#8B90A7',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  leanPreviewValue: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
  },
  leanPreviewDir: {
    color: '#8B90A7',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  sliderDescription: {
    color: '#8B90A7',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderBound: {
    color: '#8B90A7',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  sliderCurrentValue: {
    color: '#E4E5E6',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  buttonGroup: {
    marginTop: 28,
    gap: 12,
  },
  calibrateButton: {
    backgroundColor: '#E4E5E6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  calibrateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#141516',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F38BA833',
  },
  resetButtonText: {
    color: '#F38BA8',
    fontSize: 15,
    fontWeight: '700',
  },
});
