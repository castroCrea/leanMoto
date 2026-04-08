import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
  size?: 'small' | 'large';
}

export const MetricCard: React.FC<Props> = ({
  title,
  value,
  unit,
  color = '#00B4FF',
  size = 'small',
}) => {
  const isLarge = size === 'large';

  return (
    <View style={[styles.card, isLarge && styles.cardLarge]}>
      <Text style={[styles.title, isLarge && styles.titleLarge]}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }, isLarge && styles.valueLarge]}>
          {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
        </Text>
        {unit && <Text style={[styles.unit, isLarge && styles.unitLarge]}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#223344',
  },
  cardLarge: {
    padding: 16,
    minWidth: 110,
    borderRadius: 16,
  },
  title: {
    color: '#8899AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleLarge: {
    fontSize: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  valueLarge: {
    fontSize: 40,
  },
  unit: {
    color: '#8899AA',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
    marginBottom: 2,
  },
  unitLarge: {
    fontSize: 14,
  },
});
