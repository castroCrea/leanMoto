import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRide, getRidePoints } from '../database/database';
import { Ride, RidePoint, RideInsight } from '../types/ride';
import { LeanAngleChart } from '../components/charts/LeanAngleChart';
import { SpeedChart } from '../components/charts/SpeedChart';
import { InsightCard } from '../components/common/InsightCard';
import { MetricCard } from '../components/common/MetricCard';
import { generateInsights } from '../services/insightsService';
import { shareRide } from '../utils/export';
import { formatDuration, formatDistance } from '../utils/calculations';
import { useI18n } from '../i18n';

type RouteParams = {
  RideDetail: { rideId: string };
};

export const RideDetailScreen: React.FC = () => {
  const { t, locale, resolvedLanguage } = useI18n();
  const route = useRoute<RouteProp<RouteParams, 'RideDetail'>>();
  const navigation = useNavigation();
  const { rideId } = route.params;

  const [ride, setRide] = useState<Ride | null>(null);
  const [points, setPoints] = useState<RidePoint[]>([]);
  const [insights, setInsights] = useState<RideInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rideData, ridePoints] = await Promise.all([
          getRide(rideId),
          getRidePoints(rideId),
        ]);
        if (rideData) {
          setRide(rideData);
          setInsights(generateInsights(rideData, resolvedLanguage));
        }
        setPoints(ridePoints);
      } catch (error) {
        console.error('Failed to load ride detail:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [rideId]);

  const handleExport = async () => {
    if (!ride) return;
    try {
      await shareRide(ride, points);
    } catch {
      Alert.alert(t('rideDetail.exportFailedTitle'), t('rideDetail.exportFailedMessage'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4E5E6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('rideDetail.notFound')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>{t('rideDetail.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(ride.startTime);
  const dateStr = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const riskColor =
    ride.riskScore < 30 ? '#7FD1B9' : ride.riskScore < 60 ? '#F2C27B' : '#F38BA8';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#E4E5E6" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>
              {date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Ionicons name="share-outline" size={22} color="#E4E5E6" />
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <MetricCard
              title={t('rideDetail.distance')}
              value={formatDistance(ride.distance, 'metric')}
              color="#7FD1B9"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title={t('rideDetail.duration')}
              value={formatDuration(ride.duration)}
              color="#E4E5E6"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title={t('rideDetail.avgSpeed')}
              value={ride.avgSpeed}
              unit="km/h"
              color="#B7A6FF"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title={t('rideDetail.topSpeed')}
              value={ride.maxSpeed}
              unit="km/h"
              color="#F2C27B"
              size="large"
            />
          </View>
        </View>

        {/* Lean angles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rideDetail.leanAngles')}</Text>
          <View style={styles.leanRow}>
            <View style={styles.leanCard}>
              <Text style={styles.leanLabel}>{t('rideDetail.maxLeft')}</Text>
              <Text style={[styles.leanValue, { color: '#E4E5E6' }]}>
                {Math.abs(ride.leftMaxAngle).toFixed(1)}°
              </Text>
            </View>
            <View style={styles.leanCenter}>
              <Text style={styles.leanCenterLabel}>{t('rideDetail.peak')}</Text>
              <Text style={[styles.leanCenterValue, { color: '#FFFFFF' }]}>
                {ride.maxLeanAngle.toFixed(1)}°
              </Text>
            </View>
            <View style={styles.leanCard}>
              <Text style={styles.leanLabel}>{t('rideDetail.maxRight')}</Text>
              <Text style={[styles.leanValue, { color: '#F38BA8' }]}>
                {Math.abs(ride.rightMaxAngle).toFixed(1)}°
              </Text>
            </View>
          </View>
        </View>

        {/* Risk score */}
        <View style={styles.riskContainer}>
          <Text style={styles.sectionTitle}>{t('rideDetail.riskScore')}</Text>
          <View style={styles.riskBar}>
            <View style={[styles.riskFill, { width: `${ride.riskScore}%`, backgroundColor: riskColor }]} />
          </View>
          <View style={styles.riskLabelRow}>
            <Text style={styles.riskLabel}>{t('rideDetail.lowRisk')}</Text>
            <Text style={[styles.riskScore, { color: riskColor }]}>
              {ride.riskScore.toFixed(0)}/100
            </Text>
            <Text style={styles.riskLabel}>{t('rideDetail.highRisk')}</Text>
          </View>
        </View>

        {/* Lean angle chart */}
        {points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rideDetail.leanAngleOverTime')}</Text>
            <LeanAngleChart points={points} height={180} />
          </View>
        )}

        {/* Speed chart */}
        {points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rideDetail.speedOverTime')}</Text>
            <SpeedChart points={points} height={160} />
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rideDetail.rideInsights')}</Text>
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: '#F38BA8',
    fontSize: 18,
  },
  backLink: {
    color: '#E4E5E6',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    color: '#8B90A7',
    fontSize: 13,
    marginTop: 2,
  },
  exportButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  statsGridItem: {
    width: '48%',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  leanRow: {
    flexDirection: 'row',
    backgroundColor: '#141516',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2F3D',
    overflow: 'hidden',
  },
  leanCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  leanLabel: {
    color: '#8B90A7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  leanValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  leanCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2A2F3D',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leanCenterLabel: {
    color: '#8B90A7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  leanCenterValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  riskContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  riskBar: {
    height: 8,
    backgroundColor: '#141516',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F3D',
  },
  riskFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  riskLabel: {
    color: '#8B90A7',
    fontSize: 11,
  },
  riskScore: {
    fontSize: 20,
    fontWeight: '800',
  },
});
