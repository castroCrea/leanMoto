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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { deleteRide, getAllRides } from '../database/database';
import { useI18n } from '../i18n';

type RootStackParamList = {
  Calibration: undefined;
};

export const SettingsScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    unitSystem,
    language,
    voiceAlertsEnabled,
    highLeanAngleThreshold,
    keepScreenOn,
    hudMode,
    setUnitSystem,
    setLanguage,
    setVoiceAlertsEnabled,
    setHighLeanAngleThreshold,
    setKeepScreenOn,
    setHudMode,
  } = useSettingsStore();

  const handleClearAllData = () => {
    Alert.alert(
      t('settings.clearAllDataTitle'),
      t('settings.clearAllDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              const rides = await getAllRides();
              for (const ride of rides) {
                await deleteRide(ride.id);
              }
              Alert.alert(t('common.done'), t('settings.clearAllDataDone'));
            } catch {
              Alert.alert(t('common.error'), t('settings.clearAllDataError'));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t('settings.title')}</Text>

        {/* Units section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.units')}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.unitSystem')}</Text>
                <Text style={styles.settingDesc}>{t('settings.unitSystemDesc')}</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.appLanguage')}</Text>
                <Text style={styles.settingDesc}>{t('settings.appLanguageDesc')}</Text>
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleButton, language === 'system' && styles.toggleButtonActive]}
                  onPress={() => setLanguage('system')}
                >
                  <Text style={[styles.toggleText, language === 'system' && styles.toggleTextActive]}>
                    {t('settings.system')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, language === 'en' && styles.toggleButtonActive]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.toggleText, language === 'en' && styles.toggleTextActive]}>
                    {t('settings.english')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, language === 'fr' && styles.toggleButtonActive]}
                  onPress={() => setLanguage('fr')}
                >
                  <Text style={[styles.toggleText, language === 'fr' && styles.toggleTextActive]}>
                    {t('settings.french')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Voice alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.voiceAlerts')}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.voiceAlertsLabel')}</Text>
                <Text style={styles.settingDesc}>{t('settings.voiceAlertsDesc')}</Text>
              </View>
              <Switch
                value={voiceAlertsEnabled}
                onValueChange={setVoiceAlertsEnabled}
                trackColor={{ false: '#353B4D', true: '#E4E5E633' }}
                thumbColor={voiceAlertsEnabled ? '#E4E5E6' : '#8B90A7'}
              />
            </View>
            {voiceAlertsEnabled && (
              <View style={styles.settingSubRow}>
                <Text style={styles.settingLabel}>
                  {t('settings.alertThreshold', { value: highLeanAngleThreshold.toFixed(0) })}
                </Text>
                <Text style={styles.settingDesc}>{t('settings.alertThresholdDesc')}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={60}
                  step={1}
                  value={highLeanAngleThreshold}
                  onValueChange={setHighLeanAngleThreshold}
                  minimumTrackTintColor="#E4E5E6"
                  maximumTrackTintColor="#353B4D"
                  thumbTintColor="#E4E5E6"
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
          <Text style={styles.sectionHeader}>{t('settings.display')}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.keepScreenOn')}</Text>
                <Text style={styles.settingDesc}>{t('settings.keepScreenOnDesc')}</Text>
              </View>
              <Switch
                value={keepScreenOn}
                onValueChange={setKeepScreenOn}
                trackColor={{ false: '#353B4D', true: '#E4E5E633' }}
                thumbColor={keepScreenOn ? '#E4E5E6' : '#8B90A7'}
              />
            </View>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.hudMode')}</Text>
                <Text style={styles.settingDesc}>{t('settings.hudModeDesc')}</Text>
              </View>
              <Switch
                value={hudMode}
                onValueChange={setHudMode}
                trackColor={{ false: '#353B4D', true: '#E4E5E633' }}
                thumbColor={hudMode ? '#E4E5E6' : '#8B90A7'}
              />
            </View>
          </View>
        </View>

        {/* Calibration */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.sensors')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => navigation.navigate('Calibration')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.sensorCalibration')}</Text>
                <Text style={styles.settingDesc}>{t('settings.sensorCalibrationDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B90A7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.data')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearAllData}>
              <Ionicons name="trash-outline" size={18} color="#F38BA8" />
              <Text style={styles.dangerText}>{t('settings.clearAllRideData')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.settingLabel}>LeanRide AI</Text>
              <Text style={styles.aboutVersion}>v1.0.0</Text>
            </View>
            <Text style={styles.aboutDesc}>{t('settings.aboutDescription')}</Text>
          </View>
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
    color: '#8B90A7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    paddingLeft: 4,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#141516',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2F3D',
    overflow: 'hidden',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#2A2F3D',
  },
  settingSubRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2F3D',
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
    color: '#8B90A7',
    fontSize: 12,
    marginTop: 2,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#151617',
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
    backgroundColor: '#E4E5E6',
  },
  toggleText: {
    color: '#8B90A7',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#141516',
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
    color: '#8B90A7',
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
    color: '#F38BA8',
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
    color: '#8B90A7',
    fontSize: 13,
    fontWeight: '600',
  },
  aboutDesc: {
    color: '#8B90A7',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
