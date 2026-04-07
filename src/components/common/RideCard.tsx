import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ride } from '../../types/ride';
import { formatDuration, formatDistance } from '../../utils/calculations';

interface Props {
  ride: Ride;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RideCard: React.FC<Props> = ({ ride, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const date = new Date(ride.startTime);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const leanColor =
    ride.maxLeanAngle > 45 ? '#FF3A2F' : ride.maxLeanAngle > 30 ? '#FF8800' : '#00B4FF';

  return (
    <AnimatedPressable
      style={[styles.card, animStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
        <View style={styles.leanBadge}>
          <Text style={[styles.leanValue, { color: leanColor }]}>
            {ride.maxLeanAngle.toFixed(0)}°
          </Text>
          <Text style={styles.leanLabel}>MAX LEAN</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(ride.distance, 'metric')}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(ride.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{ride.maxSpeed.toFixed(0)} km/h</Text>
          <Text style={styles.statLabel}>Top Speed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: ride.riskScore > 70 ? '#FF3A2F' : '#8899AA' }]}>
            {ride.riskScore.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Risk</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#223344',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
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
  leanBadge: {
    alignItems: 'flex-end',
  },
  leanValue: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  leanLabel: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: '#8899AA',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#223344',
  },
});
