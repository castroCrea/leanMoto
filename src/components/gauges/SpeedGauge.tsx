import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

interface Props {
  speed: number;
  maxSpeed?: number;
  unit?: 'metric' | 'imperial';
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, end);
  const e = polarToCartesian(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

const ARC_START = 210;
const ARC_END = 330;
const MAX_KMH = 200;

export const SpeedGauge: React.FC<Props> = ({ speed, maxSpeed, unit = 'metric', size = 280 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const arcR = size * 0.4;
  const safeSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 0;
  const displaySpeed = unit === 'imperial' ? safeSpeed * 0.621371 : safeSpeed;

  const speedToAngle = (s: number) =>
    ARC_START + (Math.min(Math.max(s, 0), MAX_KMH) / MAX_KMH) * (ARC_END - ARC_START);

  const speedColor = safeSpeed < 60 ? '#7FD1B9' : safeSpeed < 120 ? '#E4E5E6' : '#F38BA8';
  const activeArcPath = describeArc(cx, cy, arcR, ARC_START, speedToAngle(safeSpeed));
  const ticks = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Path
          d={describeArc(cx, cy, arcR, ARC_START, ARC_END)}
          stroke="#141516"
          strokeWidth={size * 0.06}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={activeArcPath}
          stroke={speedColor}
          strokeWidth={size * 0.06}
          fill="none"
          strokeLinecap="round"
        />

        {ticks.map((tick) => {
          const angle = speedToAngle(tick);
          const rad = ((angle - 90) * Math.PI) / 180;
          const major = tick % 40 === 0;
          const r1 = arcR - size * 0.055;
          const r2 = arcR - size * (major ? 0.12 : 0.085);
          return (
            <Line
              key={tick}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke={major ? '#8B90A7' : '#4A516680'}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}

        {maxSpeed !== undefined && maxSpeed > 0 && (() => {
          const angle = speedToAngle(maxSpeed);
          const rad = ((angle - 90) * Math.PI) / 180;
          const r1 = arcR - size * 0.03;
          const r2 = arcR + size * 0.03;
          return (
            <Line
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke="#F2C27B"
              strokeWidth={2}
            />
          );
        })()}

        {[0, 60, 120, 200].map((tick) => {
          const angle = speedToAngle(tick);
          const labelR = arcR - size * 0.16;
          const rad = ((angle - 90) * Math.PI) / 180;
          const label = unit === 'imperial' ? Math.round(tick * 0.621371) : tick;
          return (
            <SvgText
              key={tick}
              x={cx + labelR * Math.cos(rad)}
              y={cy + labelR * Math.sin(rad) + 4}
              fill="#8B90A7"
              fontSize={size * 0.05}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}

        <SvgText
          x={cx}
          y={cy + size * 0.05}
          fill={speedColor}
          fontSize={size * 0.2}
          fontWeight="900"
          textAnchor="middle"
        >
          {Math.round(displaySpeed)}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + size * 0.14}
          fill="#8B90A7"
          fontSize={size * 0.06}
          textAnchor="middle"
        >
          {unit === 'imperial' ? 'mph' : 'km/h'}
        </SvgText>
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
