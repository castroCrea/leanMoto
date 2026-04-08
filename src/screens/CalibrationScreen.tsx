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

export const CalibrationScreen: React.FC = () => {
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
        <Text style={styles.pageTitle}>Sensor Calibration</Text>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📱 Phone Placement</Text>
          <Text style={styles.instructionsText}>
            1. Mount your phone in the handlebar mount with the screen facing up.{'\n'}
            2. Place the bike on a level, flat surface.{'\n'}
            3. Keep the bike upright (not on side stand).{'\n'}
            4. Press "Calibrate" and hold still for 2 seconds.
          </Text>
        </View>

        {/* Live sensor readings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Sensor Data</Text>
          {!isAvailable && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠ Physical sensors not available</Text>
            </View>
          )}
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Raw X</Text>
              <Text style={styles.sensorValue}>{accelerometer.x.toFixed(3)}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Raw Y</Text>
              <Text style={styles.sensorValue}>{accelerometer.y.toFixed(3)}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Raw Z</Text>
              <Text style={styles.sensorValue}>{accelerometer.z.toFixed(3)}</Text>
            </View>
          </View>
          <View style={styles.leanPreview}>
            <Text style={styles.leanPreviewLabel}>Current Lean Angle (with calibration)</Text>
            <Text
              style={[
                styles.leanPreviewValue,
                {
                  color:
                    Math.abs(currentLean) > 45
                      ? '#FF3A2F'
                      : Math.abs(currentLean) > 20
                      ? '#FF8800'
                      : '#00B4FF',
                },
              ]}
            >
              {currentLean.toFixed(1)}°
            </Text>
            <Text style={styles.leanPreviewDir}>
              {currentLean < -0.5 ? '◄ LEFT' : currentLean > 0.5 ? 'RIGHT ►' : 'UPRIGHT'}
            </Text>
          </View>
        </View>

        {/* Current calibration offsets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Calibration Offsets</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Offset X</Text>
              <Text style={[styles.sensorValue, { color: '#FF8800' }]}>
                {calibrationOffsets.x.toFixed(3)}
              </Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Offset Y</Text>
              <Text style={[styles.sensorValue, { color: '#FF8800' }]}>
                {calibrationOffsets.y.toFixed(3)}
              </Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>Offset Z</Text>
              <Text style={[styles.sensorValue, { color: '#FF8800' }]}>
                {calibrationOffsets.z.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {/* Mount angle slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mount Angle Correction</Text>
          <Text style={styles.sliderDescription}>
            If your phone isn't perfectly flat on the mount, adjust this offset to compensate.
          </Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderBound}>-30°</Text>
            <Slider
              style={styles.slider}
              minimumValue={-30}
              maximumValue={30}
              step={0.5}
              value={mountAngle}
              onValueChange={setMountAngle}
              minimumTrackTintColor="#00B4FF"
              maximumTrackTintColor="#334455"
              thumbTintColor="#00B4FF"
            />
            <Text style={styles.sliderBound}>+30°</Text>
          </View>
          <Text style={styles.sliderCurrentValue}>Current: {mountAngle.toFixed(1)}°</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.calibrateButton, isCalibrating && styles.buttonDisabled]}
            onPress={handleCalibrate}
            disabled={isCalibrating}
          >
            <Text style={styles.calibrateButtonText}>
              {isCalibrating ? '⏳ Calibrating...' : calibrated ? '✓ Calibrated!' : '🎯 Calibrate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Calibration</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: '#00B4FF22',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#00B4FF',
    marginBottom: 8,
  },
  instructionsTitle: {
    color: '#00B4FF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#AABBCC',
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
    backgroundColor: '#FF3A2F22',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  warningText: {
    color: '#FF3A2F',
    fontSize: 13,
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#223344',
  },
  sensorLabel: {
    color: '#8899AA',
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
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#223344',
  },
  leanPreviewLabel: {
    color: '#8899AA',
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
    color: '#8899AA',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  sliderDescription: {
    color: '#8899AA',
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
    color: '#8899AA',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  sliderCurrentValue: {
    color: '#00B4FF',
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
    backgroundColor: '#00B4FF',
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
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3A2F44',
  },
  resetButtonText: {
    color: '#FF3A2F',
    fontSize: 15,
    fontWeight: '700',
  },
});
