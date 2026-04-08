import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { RidePoint } from '../../types/ride';
import { useI18n } from '../../i18n';

interface Props {
  points: RidePoint[];
  height?: number;
}

export const SpeedChart: React.FC<Props> = ({ points, height = 180 }) => {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 44, 260);

  const chartData = useMemo(() => {
    if (points.length === 0) {
      return { labels: ['0'], datasets: [{ data: [0] }] };
    }

    const step = Math.max(1, Math.floor(points.length / 60));
    const sampled = points.filter((_, i) => i % step === 0);

    const labels = sampled.map((p, i) => {
      if (i === 0 || i === sampled.length - 1) {
        const elapsed = Math.floor((p.timestamp - points[0].timestamp) / 1000);
        return `${elapsed}${t('common.secondsShort')}`;
      }
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: sampled.map((p) => Math.max(0, p.speed)),
          color: (opacity = 1) => `rgba(127, 209, 185, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: [t('charts.speedLegend')],
    };
  }, [points, t]);

  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{t('charts.noDataAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={height}
        chartConfig={{
          backgroundColor: '#141516',
          backgroundGradientFrom: '#141516',
          backgroundGradientTo: '#11181A',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(127, 209, 185, ${opacity})`,
          labelColor: () => '#8B90A7',
          style: { borderRadius: 12 },
          propsForDots: { r: '0' },
          fillShadowGradient: '#7FD1B9',
          fillShadowGradientOpacity: 0.3,
          propsForBackgroundLines: {
            strokeDasharray: '4 4',
            stroke: '#2A2F3D',
          },
        }}
        bezier
        style={styles.chart}
        withShadow={false}
        withVerticalLines={false}
        withHorizontalLines
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chart: {
    borderRadius: 12,
  },
  empty: {
    backgroundColor: '#141516',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  emptyText: {
    color: '#8B90A7',
    fontSize: 14,
  },
});
