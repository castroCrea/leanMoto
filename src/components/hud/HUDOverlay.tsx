import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  leanAngle: number;
  speed: number;
  maxLeft: number;
  maxRight: number;
  onExit: () => void;
}

export const HUDOverlay: React.FC<Props> = ({
  leanAngle,
  speed,
  maxLeft,
  maxRight,
  onExit,
}) => {
  const isLeft = leanAngle < -0.5;
  const isRight = leanAngle > 0.5;
  const leanColor = isLeft ? '#E4E5E6' : isRight ? '#F38BA8' : '#8B90A7';

  return (
    <SafeAreaView style={styles.container}>
      {/* Speed - top right */}
      <View style={styles.topRow}>
        <View style={styles.maxContainer}>
          <Text style={styles.maxLabel}>MAX L</Text>
          <Text style={[styles.maxValue, { color: '#E4E5E6' }]}>
            {Math.abs(maxLeft).toFixed(0)}°
          </Text>
        </View>
        <View style={styles.speedContainer}>
          <Text style={styles.speedValue}>{Math.round(speed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
        <View style={styles.maxContainer}>
          <Text style={styles.maxLabel}>MAX R</Text>
          <Text style={[styles.maxValue, { color: '#F38BA8' }]}>
            {Math.abs(maxRight).toFixed(0)}°
          </Text>
        </View>
      </View>

      {/* Lean angle - center */}
      <View style={styles.centerContainer}>
        <Text style={[styles.leanValue, { color: leanColor }]}>
          {Math.abs(leanAngle).toFixed(1)}
        </Text>
        <Text style={[styles.leanUnit, { color: leanColor }]}>
          {isLeft ? '◄ LEFT' : isRight ? 'RIGHT ►' : 'UPRIGHT'}
        </Text>
      </View>

      {/* Exit button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>EXIT HUD</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 72,
  },
  speedUnit: {
    color: '#8B90A7',
    fontSize: 16,
    fontWeight: '600',
  },
  maxContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  maxLabel: {
    color: '#8B90A7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  maxValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  leanValue: {
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 120,
    letterSpacing: -4,
  },
  leanUnit: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -10,
  },
  exitButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  exitText: {
    color: '#8B90A7',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
