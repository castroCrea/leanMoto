import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RideInsight } from '../../types/ride';

interface Props {
  insight: RideInsight;
}

const typeConfig = {
  info: { color: '#E4E5E6', bgColor: '#E4E5E622', icon: 'information-circle' as const },
  warning: { color: '#F38BA8', bgColor: '#F38BA822', icon: 'warning' as const },
  achievement: { color: '#FFB800', bgColor: '#FFB80022', icon: 'trophy' as const },
  tip: { color: '#7FD1B9', bgColor: '#7FD1B922', icon: 'bulb' as const },
};

export const InsightCard: React.FC<Props> = ({ insight }) => {
  const config = typeConfig[insight.type];

  return (
    <View style={[styles.card, { borderLeftColor: config.color, backgroundColor: config.bgColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.color }]}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
        {insight.value !== undefined && (
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: config.color }]}>
              {insight.value.toFixed(1)}{insight.unit ?? ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  description: {
    color: '#B6BBD0',
    fontSize: 13,
    lineHeight: 18,
  },
  valueRow: {
    marginTop: 6,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
