import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { RidePoint } from '../../types/ride';

interface Props {
  points: RidePoint[];
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LeanAngleChart: React.FC<Props> = ({ points, height = 200 }) => {
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
        return `${elapsed}s`;
      }
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: sampled.map((p) => p.leanAngle),
          color: (opacity = 1) => `rgba(0, 180, 255, ${opacity})`,
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
      legend: ['Lean Angle (°)'],
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={SCREEN_WIDTH - 32}
        height={height}
        chartConfig={{
          backgroundColor: '#1A1A2E',
          backgroundGradientFrom: '#1A1A2E',
          backgroundGradientTo: '#0A0A1F',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 180, 255, ${opacity})`,
          labelColor: () => '#8899AA',
          style: { borderRadius: 12 },
          propsForDots: { r: '0' },
          propsForBackgroundLines: {
            strokeDasharray: '4 4',
            stroke: '#223344',
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
  },
  chart: {
    borderRadius: 12,
  },
  empty: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  emptyText: {
    color: '#8899AA',
    fontSize: 14,
  },
});
