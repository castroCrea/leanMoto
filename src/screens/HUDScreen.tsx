import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useNavigation } from '@react-navigation/native';
import { useRideStore } from '../store/rideStore';
import { HUDOverlay } from '../components/hud/HUDOverlay';

export const HUDScreen: React.FC = () => {
  useKeepAwake();
  const navigation = useNavigation();
  const { currentMetrics } = useRideStore();

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HUDOverlay
        leanAngle={currentMetrics.leanAngle}
        speed={currentMetrics.speed}
        maxLeft={currentMetrics.leftMaxAngle}
        maxRight={currentMetrics.rightMaxAngle}
        onExit={handleExit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
});
