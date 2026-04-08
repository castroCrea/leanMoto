import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ride } from '../../types/ride';
import { formatDuration, formatDistance } from '../../utils/calculations';
import { useI18n } from '../../i18n';

interface Props {
  ride: Ride;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RideCard: React.FC<Props> = ({ ride, onPress }) => {
  const { t, locale } = useI18n();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const date = new Date(ride.startTime);
  const dateStr = date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const leanColor =
    ride.maxLeanAngle > 45 ? '#F38BA8' : ride.maxLeanAngle > 30 ? '#F2C27B' : '#E4E5E6';

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
          <Text style={styles.leanLabel}>{t('rideCard.maxLean')}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(ride.distance, 'metric')}</Text>
          <Text style={styles.statLabel}>{t('rideCard.distance')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(ride.duration)}</Text>
          <Text style={styles.statLabel}>{t('rideCard.duration')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{ride.maxSpeed.toFixed(0)} {t('common.metricSpeedUnit')}</Text>
          <Text style={styles.statLabel}>{t('rideCard.topSpeed')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: ride.riskScore > 70 ? '#F38BA8' : '#8B90A7' }]}>
            {ride.riskScore.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>{t('rideCard.risk')}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141516',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2A2F3D',
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
    color: '#8B90A7',
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
    color: '#8B90A7',
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
    color: '#8B90A7',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#2A2F3D',
  },
});
