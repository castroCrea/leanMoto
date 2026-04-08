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

type RouteParams = {
  RideDetail: { rideId: string };
};

export const RideDetailScreen: React.FC = () => {
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
          setInsights(generateInsights(rideData));
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
      Alert.alert('Export Failed', 'Could not share ride data.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4FF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ride not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(ride.startTime);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const riskColor =
    ride.riskScore < 30 ? '#00D97E' : ride.riskScore < 60 ? '#FF8800' : '#FF3A2F';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#00B4FF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Ionicons name="share-outline" size={22} color="#00B4FF" />
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <MetricCard
              title="DISTANCE"
              value={formatDistance(ride.distance, 'metric')}
              color="#00D97E"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title="DURATION"
              value={formatDuration(ride.duration)}
              color="#00B4FF"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title="AVG SPEED"
              value={ride.avgSpeed}
              unit="km/h"
              color="#8800FF"
              size="large"
            />
          </View>
          <View style={styles.statsGridItem}>
            <MetricCard
              title="TOP SPEED"
              value={ride.maxSpeed}
              unit="km/h"
              color="#FF8800"
              size="large"
            />
          </View>
        </View>

        {/* Lean angles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lean Angles</Text>
          <View style={styles.leanRow}>
            <View style={styles.leanCard}>
              <Text style={styles.leanLabel}>◄ MAX LEFT</Text>
              <Text style={[styles.leanValue, { color: '#00B4FF' }]}>
                {Math.abs(ride.leftMaxAngle).toFixed(1)}°
              </Text>
            </View>
            <View style={styles.leanCenter}>
              <Text style={styles.leanCenterLabel}>PEAK</Text>
              <Text style={[styles.leanCenterValue, { color: '#FFFFFF' }]}>
                {ride.maxLeanAngle.toFixed(1)}°
              </Text>
            </View>
            <View style={styles.leanCard}>
              <Text style={styles.leanLabel}>MAX RIGHT ►</Text>
              <Text style={[styles.leanValue, { color: '#FF3A2F' }]}>
                {Math.abs(ride.rightMaxAngle).toFixed(1)}°
              </Text>
            </View>
          </View>
        </View>

        {/* Risk score */}
        <View style={styles.riskContainer}>
          <Text style={styles.sectionTitle}>Risk Score</Text>
          <View style={styles.riskBar}>
            <View style={[styles.riskFill, { width: `${ride.riskScore}%`, backgroundColor: riskColor }]} />
          </View>
          <View style={styles.riskLabelRow}>
            <Text style={styles.riskLabel}>Low Risk</Text>
            <Text style={[styles.riskScore, { color: riskColor }]}>
              {ride.riskScore.toFixed(0)}/100
            </Text>
            <Text style={styles.riskLabel}>High Risk</Text>
          </View>
        </View>

        {/* Lean angle chart */}
        {points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lean Angle Over Time</Text>
            <LeanAngleChart points={points} height={180} />
          </View>
        )}

        {/* Speed chart */}
        {points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speed Over Time</Text>
            <SpeedChart points={points} height={160} />
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ride Insights</Text>
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
    backgroundColor: '#0A0A0F',
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
    color: '#FF3A2F',
    fontSize: 18,
  },
  backLink: {
    color: '#00B4FF',
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
    color: '#8899AA',
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
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223344',
    overflow: 'hidden',
  },
  leanCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  leanLabel: {
    color: '#8899AA',
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
    borderColor: '#223344',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leanCenterLabel: {
    color: '#8899AA',
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
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#223344',
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
    color: '#8899AA',
    fontSize: 11,
  },
  riskScore: {
    fontSize: 20,
    fontWeight: '800',
  },
});
