import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

interface Props {
  gForceX: number;
  gForceY: number;
  size?: number;
}

const MAX_G = 1.5;

export const GForceGauge: React.FC<Props> = ({ gForceX, gForceY, size = 200 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const dotRadius = size * 0.055;
  const safeX = Number.isFinite(gForceX) ? gForceX : 0;
  const safeY = Number.isFinite(gForceY) ? gForceY : 0;
  const clampedX = Math.max(-MAX_G, Math.min(MAX_G, safeX));
  const clampedY = Math.max(-MAX_G, Math.min(MAX_G, safeY));
  const dotX = cx + (clampedX / MAX_G) * radius * 0.9;
  const dotY = cy - (clampedY / MAX_G) * radius * 0.9;

  const ringRadii = [
    { r: radius * 0.33, label: '0.5G' },
    { r: radius * 0.66, label: '1G' },
    { r: radius, label: '1.5G' },
  ];

  const totalG = Math.sqrt(safeX * safeX + safeY * safeY);
  const dotColor = totalG < 0.5 ? '#00D97E' : totalG < 1.0 ? '#00B4FF' : '#FF3A2F';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} fill="#1A1A2E" stroke="#223344" strokeWidth={1} />

        {ringRadii.map(({ r, label }) => (
          <React.Fragment key={label}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#334455"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <SvgText x={cx + r + 4} y={cy - 2} fill="#445566" fontSize={size * 0.055}>
              {label}
            </SvgText>
          </React.Fragment>
        ))}

        <Line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="#334455" strokeWidth={1} />
        <Line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="#334455" strokeWidth={1} />

        <SvgText x={cx + radius - 14} y={cy - 4} fill="#445566" fontSize={size * 0.06}>+X</SvgText>
        <SvgText x={cx - 8} y={cy - radius + 12} fill="#445566" fontSize={size * 0.06}>+Y</SvgText>

        <Circle cx={dotX} cy={dotY} r={dotRadius + 5} fill={`${dotColor}33`} />
        <Circle cx={dotX} cy={dotY} r={dotRadius} fill={dotColor} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
