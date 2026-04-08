import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { RidePoint } from '../../types/ride';
import { useI18n } from '../../i18n';

interface Props {
  points: RidePoint[];
  height?: number;
}

export const LeanAngleChart: React.FC<Props> = ({ points, height = 200 }) => {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 44, 260);

  const chartData = useMemo(() => {
    if (points.length === 0) {
      return { labels: ['0'], datasets: [{ data: [0] }] };
    }

    // Sample down to at most 60 points for performance
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
          data: sampled.map((p) => p.leanAngle),
          color: (opacity = 1) => `rgba(143, 155, 255, ${opacity})`,
          strokeWidth: 2,
        },
        {
          // Zero reference line
          data: sampled.map(() => 0),
          color: (opacity = 1) => `rgba(136, 153, 170, ${opacity * 0.4})`,
          strokeWidth: 1,
          withDots: false,
        },
      ],
      legend: [t('charts.leanLegend')],
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
          backgroundGradientTo: '#10121B',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(143, 155, 255, ${opacity})`,
          labelColor: () => '#8B90A7',
          style: { borderRadius: 12 },
          propsForDots: { r: '0' },
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
        fromZero={false}
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
