import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Slider = require('@react-native-community/slider').default;
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { deleteRide, getAllRides } from '../database/database';

type RootStackParamList = {
  Calibration: undefined;
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    unitSystem,
    voiceAlertsEnabled,
    highLeanAngleThreshold,
    keepScreenOn,
    hudMode,
    setUnitSystem,
    setVoiceAlertsEnabled,
    setHighLeanAngleThreshold,
    setKeepScreenOn,
    setHudMode,
  } = useSettingsStore();

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all rides and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const rides = await getAllRides();
              for (const ride of rides) {
                await deleteRide(ride.id);
              }
              Alert.alert('Done', 'All ride data has been deleted.');
            } catch {
              Alert.alert('Error', 'Failed to delete all data.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Units section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>UNITS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Unit System</Text>
                <Text style={styles.settingDesc}>Speed and distance units</Text>
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    unitSystem === 'metric' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setUnitSystem('metric')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      unitSystem === 'metric' && styles.toggleTextActive,
                    ]}
                  >
                    km/h
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    unitSystem === 'imperial' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setUnitSystem('imperial')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      unitSystem === 'imperial' && styles.toggleTextActive,
                    ]}
                  >
                    mph
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Voice alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>VOICE ALERTS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Voice Alerts</Text>
                <Text style={styles.settingDesc}>Spoken ride updates and warnings</Text>
              </View>
              <Switch
                value={voiceAlertsEnabled}
                onValueChange={setVoiceAlertsEnabled}
                trackColor={{ false: '#334455', true: '#00B4FF44' }}
                thumbColor={voiceAlertsEnabled ? '#00B4FF' : '#8899AA'}
              />
            </View>
            {voiceAlertsEnabled && (
              <View style={styles.settingSubRow}>
                <Text style={styles.settingLabel}>
                  Alert Threshold: {highLeanAngleThreshold.toFixed(0)}°
                </Text>
                <Text style={styles.settingDesc}>Alert when lean exceeds this angle</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={60}
                  step={1}
                  value={highLeanAngleThreshold}
                  onValueChange={setHighLeanAngleThreshold}
                  minimumTrackTintColor="#00B4FF"
                  maximumTrackTintColor="#334455"
                  thumbTintColor="#00B4FF"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>20°</Text>
                  <Text style={styles.sliderLabel}>60°</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Display */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DISPLAY</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Keep Screen On</Text>
                <Text style={styles.settingDesc}>Prevent screen from sleeping during rides</Text>
              </View>
              <Switch
                value={keepScreenOn}
                onValueChange={setKeepScreenOn}
                trackColor={{ false: '#334455', true: '#00B4FF44' }}
                thumbColor={keepScreenOn ? '#00B4FF' : '#8899AA'}
              />
            </View>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>HUD Mode</Text>
                <Text style={styles.settingDesc}>Show minimal heads-up display</Text>
              </View>
              <Switch
                value={hudMode}
                onValueChange={setHudMode}
                trackColor={{ false: '#334455', true: '#00B4FF44' }}
                thumbColor={hudMode ? '#00B4FF' : '#8899AA'}
              />
            </View>
          </View>
        </View>

        {/* Calibration */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SENSORS</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => navigation.navigate('Calibration')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sensor Calibration</Text>
                <Text style={styles.settingDesc}>Calibrate lean angle detection</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8899AA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATA</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearAllData}>
              <Ionicons name="trash-outline" size={18} color="#FF3A2F" />
              <Text style={styles.dangerText}>Clear All Ride Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.settingLabel}>LeanRide AI</Text>
              <Text style={styles.aboutVersion}>v1.0.0</Text>
            </View>
            <Text style={styles.aboutDesc}>
              Advanced motorcycle lean angle analysis with real-time telemetry, AI insights,
              and HUD mode for serious riders.
            </Text>
          </View>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    color: '#8899AA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    paddingLeft: 4,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#223344',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#223344',
  },
  settingSubRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#223344',
    paddingTop: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#8899AA',
    fontSize: 12,
    marginTop: 2,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#00B4FF',
  },
  toggleText: {
    color: '#8899AA',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  slider: {
    height: 40,
    marginTop: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabel: {
    color: '#8899AA',
    fontSize: 11,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  dangerText: {
    color: '#FF3A2F',
    fontSize: 15,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  aboutVersion: {
    color: '#8899AA',
    fontSize: 13,
    fontWeight: '600',
  },
  aboutDesc: {
    color: '#8899AA',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
