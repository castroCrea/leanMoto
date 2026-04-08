import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRideHistory } from '../hooks/useRideHistory';
import { formatDistance, formatDuration } from '../utils/calculations';

export const AnalyticsScreen: React.FC = () => {
  const { rides, loading, stats } = useRideHistory();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 44, 260);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4FF" />
        </View>
      </SafeAreaView>
    );
  }

  // Last 10 rides for trend
  const recentRides = rides.slice(0, 10).reverse();

  const trendData =
    recentRides.length >= 2
      ? {
          labels: recentRides.map((_, i) => `${i + 1}`),
          datasets: [
            {
              data: recentRides.map((r) => r.maxLeanAngle),
              color: (opacity = 1) => `rgba(0, 180, 255, ${opacity})`,
              strokeWidth: 2,
            },
          ],
          legend: ['Max Lean Angle (°)'],
        }
      : null;

  const speedTrendData =
    recentRides.length >= 2
      ? {
          labels: recentRides.map((_, i) => `${i + 1}`),
          datasets: [
            {
              data: recentRides.map((r) => r.maxSpeed),
              color: (opacity = 1) => `rgba(0, 217, 126, ${opacity})`,
              strokeWidth: 2,
            },
          ],
          legend: ['Max Speed (km/h)'],
        }
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Analytics</Text>

        {/* Overall stats */}
        <View style={styles.overallGrid}>
          <View style={styles.bigStatCard}>
            <Ionicons name="bicycle" size={22} color="#00B4FF" />
            <Text style={styles.bigStatValue}>{stats.totalRides}</Text>
            <Text style={styles.bigStatLabel}>Total Rides</Text>
          </View>
          <View style={styles.bigStatCard}>
            <Ionicons name="map" size={22} color="#00D97E" />
            <Text style={styles.bigStatValue}>
              {formatDistance(stats.totalDistance, 'metric')}
            </Text>
            <Text style={styles.bigStatLabel}>Total Distance</Text>
          </View>
          <View style={styles.bigStatCard}>
            <Ionicons name="time" size={22} color="#FF8800" />
            <Text style={styles.bigStatValue}>
              {formatDuration(stats.totalDuration)}
            </Text>
            <Text style={styles.bigStatLabel}>Total Time</Text>
          </View>
        </View>

        {/* Personal bests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Bests</Text>
          <View style={styles.pbRow}>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
              <Ionicons name="trending-up" size={20} color="#00B4FF" />
              <Text style={[styles.pbValue, { color: '#00B4FF' }]}>
                {stats.personalBestLeanAngle.toFixed(1)}°
              </Text>
              <Text style={styles.pbLabel}>Max Lean</Text>
            </View>
            </View>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
              <Ionicons name="speedometer" size={20} color="#FF3A2F" />
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.pbValue, styles.pbValueCompact, { color: '#FF3A2F' }]}>
                {stats.personalBestSpeed.toFixed(0)} km/h
              </Text>
              <Text style={styles.pbLabel}>Top Speed</Text>
            </View>
            </View>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
              <Ionicons name="refresh-circle" size={20} color="#8800FF" />
              <Text style={[styles.pbValue, { color: '#8800FF' }]}>
                {stats.avgMaxLeanAngle.toFixed(1)}°
              </Text>
              <Text style={styles.pbLabel}>Avg Max Lean</Text>
            </View>
            </View>
          </View>
        </View>

        {/* Lean angle trend */}
        {trendData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lean Angle Trend (Last {recentRides.length} Rides)</Text>
            <LineChart
              data={trendData}
              width={chartWidth}
              height={180}
              chartConfig={{
                backgroundColor: '#1A1A2E',
                backgroundGradientFrom: '#1A1A2E',
                backgroundGradientTo: '#0A0A1F',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 180, 255, ${opacity})`,
                labelColor: () => '#8899AA',
                style: { borderRadius: 12 },
                propsForDots: { r: '4', fill: '#00B4FF' },
                propsForBackgroundLines: {
                  strokeDasharray: '4 4',
                  stroke: '#223344',
                },
              }}
              bezier
              style={styles.chart}
              withShadow={false}
              fromZero
            />
          </View>
        )}

        {/* Speed trend */}
        {speedTrendData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speed Trend (Last {recentRides.length} Rides)</Text>
            <LineChart
              data={speedTrendData}
              width={chartWidth}
              height={160}
              chartConfig={{
                backgroundColor: '#1A1A2E',
                backgroundGradientFrom: '#1A1A2E',
                backgroundGradientTo: '#0A1A12',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 217, 126, ${opacity})`,
                labelColor: () => '#8899AA',
                style: { borderRadius: 12 },
                propsForDots: { r: '4', fill: '#00D97E' },
                propsForBackgroundLines: {
                  strokeDasharray: '4 4',
                  stroke: '#223344',
                },
              }}
              bezier
              style={styles.chart}
              withShadow={false}
              fromZero
            />
          </View>
        )}

        {rides.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={64} color="#334455" />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>Complete some rides to see your analytics.</Text>
          </View>
        )}

        {/* Recent rides summary table */}
        {rides.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Rides Summary</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Date</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Lean°</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>km/h</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>km</Text>
              </View>
              {rides.slice(0, 10).map((ride) => (
                <View key={ride.id} style={styles.tableRow}>
                  <Text numberOfLines={1} style={[styles.tableCell, styles.tableValueText]}>
                    {new Date(ride.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        color:
                          ride.maxLeanAngle > 45
                            ? '#FF3A2F'
                            : ride.maxLeanAngle > 30
                            ? '#FF8800'
                            : '#00B4FF',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {ride.maxLeanAngle.toFixed(0)}°
                  </Text>
                  <Text numberOfLines={1} style={[styles.tableCell, styles.tableValueText]}>
                    {ride.maxSpeed.toFixed(0)}
                  </Text>
                  <Text numberOfLines={1} style={[styles.tableCell, styles.tableValueText]}>
                    {ride.distance.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
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
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  overallGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  bigStatCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#223344',
    gap: 4,
  },
  bigStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  bigStatLabel: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
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
  pbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pbCardWrap: {
    width: '48%',
  },
  pbCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#223344',
    gap: 4,
  },
  pbValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pbValueCompact: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
  },
  pbLabel: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#8899AA',
    fontSize: 14,
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223344',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#223344',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#223344',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableValueText: {
    color: '#AABBCC',
    fontSize: 12,
  },
  tableHeaderText: {
    color: '#8899AA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
