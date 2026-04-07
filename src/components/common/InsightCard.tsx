import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RideInsight } from '../../types/ride';

interface Props {
  insight: RideInsight;
}

const typeConfig = {
  info: { color: '#00B4FF', bgColor: '#00B4FF22', icon: 'information-circle' as const },
  warning: { color: '#FF3A2F', bgColor: '#FF3A2F22', icon: 'warning' as const },
  achievement: { color: '#FFB800', bgColor: '#FFB80022', icon: 'trophy' as const },
  tip: { color: '#00D97E', bgColor: '#00D97E22', icon: 'bulb' as const },
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
    color: '#AABBCC',
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
