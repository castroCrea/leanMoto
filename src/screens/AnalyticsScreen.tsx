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
import { useI18n } from '../i18n';

export const AnalyticsScreen: React.FC = () => {
  const { t, locale } = useI18n();
  const { rides, loading, stats } = useRideHistory();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 44, 260);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4E5E6" />
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
            color: (opacity = 1) => `rgba(143, 155, 255, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: [t('charts.maxLeanLegend')],
      }
      : null;

  const speedTrendData =
    recentRides.length >= 2
      ? {
        labels: recentRides.map((_, i) => `${i + 1}`),
        datasets: [
          {
            data: recentRides.map((r) => r.maxSpeed),
            color: (opacity = 1) => `rgba(127, 209, 185, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: [t('charts.speedLegend')],
      }
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t('analytics.title')}</Text>

        {/* Overall stats */}
        <View style={styles.overallGrid}>
          <View style={styles.bigStatCard}>
            <Ionicons name="bicycle" size={22} color="#E4E5E6" />
            <Text style={styles.bigStatValue}>{stats.totalRides}</Text>
            <Text style={styles.bigStatLabel}>{t('analytics.totalRides')}</Text>
          </View>
          <View style={styles.bigStatCard}>
            <Ionicons name="map" size={22} color="#7FD1B9" />
            <Text style={styles.bigStatValue}>
              {formatDistance(stats.totalDistance, 'metric')}
            </Text>
            <Text style={styles.bigStatLabel}>{t('analytics.totalDistance')}</Text>
          </View>
          <View style={styles.bigStatCard}>
            <Ionicons name="time" size={22} color="#F2C27B" />
            <Text style={styles.bigStatValue}>
              {formatDuration(stats.totalDuration)}
            </Text>
            <Text style={styles.bigStatLabel}>{t('analytics.totalTime')}</Text>
          </View>
        </View>

        {/* Personal bests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analytics.personalBests')}</Text>
          <View style={styles.pbRow}>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
                <Ionicons name="trending-up" size={20} color="#E4E5E6" />
                <Text style={[styles.pbValue, { color: '#E4E5E6' }]}>
                  {stats.personalBestLeanAngle.toFixed(1)}°
                </Text>
                <Text style={styles.pbLabel}>{t('analytics.maxLean')}</Text>
              </View>
            </View>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
                <Ionicons name="speedometer" size={20} color="#F38BA8" />
                <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.pbValue, styles.pbValueCompact, { color: '#F38BA8' }]}>
                  {stats.personalBestSpeed.toFixed(0)} {t('common.metricSpeedUnit')}
                </Text>
                <Text style={styles.pbLabel}>{t('analytics.topSpeed')}</Text>
              </View>
            </View>
            <View style={styles.pbCardWrap}>
              <View style={styles.pbCard}>
                <Ionicons name="refresh-circle" size={20} color="#B7A6FF" />
                <Text style={[styles.pbValue, { color: '#B7A6FF' }]}>
                  {stats.avgMaxLeanAngle.toFixed(1)}°
                </Text>
                <Text style={styles.pbLabel}>{t('analytics.avgMaxLean')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lean angle trend */}
        {trendData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('analytics.leanTrend', { count: recentRides.length })}</Text>
            <LineChart
              data={trendData}
              width={chartWidth}
              height={180}
              chartConfig={{
                backgroundColor: '#141516',
                backgroundGradientFrom: '#141516',
                backgroundGradientTo: '#10121B',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(143, 155, 255, ${opacity})`,
                labelColor: () => '#8B90A7',
                style: { borderRadius: 12 },
                propsForDots: { r: '4', fill: '#E4E5E6' },
                propsForBackgroundLines: {
                  strokeDasharray: '4 4',
                  stroke: '#2A2F3D',
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
            <Text style={styles.sectionTitle}>{t('analytics.speedTrend', { count: recentRides.length })}</Text>
            <LineChart
              data={speedTrendData}
              width={chartWidth}
              height={160}
              chartConfig={{
                backgroundColor: '#141516',
                backgroundGradientFrom: '#141516',
                backgroundGradientTo: '#11181A',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(127, 209, 185, ${opacity})`,
                labelColor: () => '#8B90A7',
                style: { borderRadius: 12 },
                propsForDots: { r: '4', fill: '#7FD1B9' },
                propsForBackgroundLines: {
                  strokeDasharray: '4 4',
                  stroke: '#2A2F3D',
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
            <Ionicons name="bar-chart-outline" size={64} color="#353B4D" />
            <Text style={styles.emptyTitle}>{t('analytics.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('analytics.emptySubtitle')}</Text>
          </View>
        )}

        {/* Recent rides summary table */}
        {rides.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('analytics.recentRidesSummary')}</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>{t('analytics.date')}</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>{t('analytics.lean')}</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>{t('common.metricSpeedUnit')}</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>{t('common.metricDistanceUnit')}</Text>
              </View>
              {rides.slice(0, 10).map((ride) => (
                <View key={ride.id} style={styles.tableRow}>
                  <Text numberOfLines={1} style={[styles.tableCell, styles.tableValueText]}>
                    {new Date(ride.startTime).toLocaleDateString(locale, {
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
                            ? '#F38BA8'
                            : ride.maxLeanAngle > 30
                              ? '#F2C27B'
                              : '#E4E5E6',
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
    backgroundColor: '#141516',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2F3D',
    gap: 4,
  },
  bigStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  bigStatLabel: {
    color: '#8B90A7',
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
    backgroundColor: '#141516',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2F3D',
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
    color: '#8B90A7',
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
    color: '#8B90A7',
    fontSize: 14,
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#141516',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2F3D',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2A2F3D',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A2F3D',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableValueText: {
    color: '#B6BBD0',
    fontSize: 12,
  },
  tableHeaderText: {
    color: '#8B90A7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
