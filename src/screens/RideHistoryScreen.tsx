import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRideHistory } from '../hooks/useRideHistory';
import { RideCard } from '../components/common/RideCard';
import { Ride } from '../types/ride';
import { formatDistance, formatDuration } from '../utils/calculations';
import { useI18n } from '../i18n';

type RootStackParamList = {
  RideDetail: { rideId: string };
};

export const RideHistoryScreen: React.FC = () => {
  const { t, locale } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { rides, loading, error, stats, refreshRides, deleteRide } = useRideHistory();
  const isSwipingRef = useRef(false);

  const handleRidePress = useCallback(
    (ride: Ride) => {
      if (isSwipingRef.current) {
        return;
      }
      navigation.navigate('RideDetail', { rideId: ride.id });
    },
    [navigation],
  );

  const handleDeletePress = useCallback(
    (ride: Ride) => {
      Alert.alert(
        t('history.deleteRideTitle'),
        t('history.deleteRideMessage', {
          date: new Date(ride.startTime).toLocaleDateString(locale),
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteRide(ride.id),
          },
        ],
      );
    },
    [deleteRide],
  );

  const renderItem = useCallback(
    ({ item }: { item: Ride }) => (
      <Swipeable
        friction={2}
        leftThreshold={9999}
        rightThreshold={72}
        dragOffsetFromLeftEdge={9999}
        dragOffsetFromRightEdge={12}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableOpenStartDrag={() => {
          isSwipingRef.current = true;
        }}
        onSwipeableCloseStartDrag={() => {
          isSwipingRef.current = true;
        }}
        onSwipeableOpen={() => {
          isSwipingRef.current = false;
        }}
        onSwipeableClose={() => {
          setTimeout(() => {
            isSwipingRef.current = false;
          }, 80);
        }}
        renderRightActions={() => (
          <View style={styles.swipeActionContainer}>
            <TouchableOpacity
              style={styles.swipeDeleteAction}
              onPress={() => handleDeletePress(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.swipeDeleteText}>{t('history.deleteAction')}</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <View style={styles.cardWrapper}>
          <RideCard ride={item} onPress={() => handleRidePress(item)} />
        </View>
      </Swipeable>
    ),
    [handleRidePress, handleDeletePress],
  );

  const ListHeader = (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>{t('history.title')}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalRides}</Text>
          <Text style={styles.statLabel}>{t('history.totalRides')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatDistance(stats.totalDistance, 'metric')}
          </Text>
          <Text style={styles.statLabel}>{t('history.totalDistance')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#E4E5E6' }]}>
            {stats.personalBestLeanAngle.toFixed(0)}°
          </Text>
          <Text style={styles.statLabel}>{t('history.bestLean')}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4E5E6" />
          <Text style={styles.loadingText}>{t('history.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#F38BA8" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRides}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={64} color="#353B4D" />
            <Text style={styles.emptyTitle}>{t('history.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('history.emptySubtitle')}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshRides}
            tintColor="#E4E5E6"
            colors={['#E4E5E6']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151617',
  },
  listContent: {
    paddingBottom: 32,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#141516',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2F3D',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8B90A7',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  cardWrapper: {
    position: 'relative',
  },
  swipeActionContainer: {
    justifyContent: 'center',
    marginVertical: 6,
    marginRight: 16,
  },
  swipeDeleteAction: {
    width: 112,
    height: '100%',
    minHeight: 126,
    borderRadius: 16,
    backgroundColor: '#F38BA8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#8B90A7',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#F38BA8',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E4E5E622',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E5E6',
  },
  retryText: {
    color: '#E4E5E6',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
    lineHeight: 20,
  },
});
