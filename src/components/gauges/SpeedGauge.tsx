import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  speed: number; // km/h
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
  const displaySpeed = unit === 'imperial' ? speed * 0.621371 : speed;
  const displayMax = unit === 'imperial' ? 124 : 200;

  const speedToAngle = (s: number) =>
    ARC_START + (Math.min(s, MAX_KMH) / MAX_KMH) * (ARC_END - ARC_START);

  const speedColor =
    speed < 60 ? '#00D97E' : speed < 120 ? '#00B4FF' : '#FF3A2F';

  const fillAngle = useSharedValue(ARC_START);

  useEffect(() => {
    fillAngle.value = withTiming(speedToAngle(speed), {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [speed]);

  const animatedArcProps = useAnimatedProps(() => {
    const d = describeArc(cx, cy, arcR, ARC_START, fillAngle.value);
    return { d };
  });

  const ticks = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Path
          d={describeArc(cx, cy, arcR, ARC_START, ARC_END)}
          stroke="#1A1A2E"
          strokeWidth={size * 0.06}
          fill="none"
          strokeLinecap="round"
        />

        {/* Active speed arc */}
        <AnimatedPath
          stroke={speedColor}
          strokeWidth={size * 0.06}
          fill="none"
          strokeLinecap="round"
          animatedProps={animatedArcProps}
        />

        {/* Ticks */}
        {ticks.map((t) => {
          const angle = speedToAngle(t);
          const rad = ((angle - 90) * Math.PI) / 180;
          const major = t % 40 === 0;
          const r1 = arcR - size * 0.055;
          const r2 = arcR - size * (major ? 0.12 : 0.085);
          return (
            <Line
              key={t}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke={major ? '#8899AA' : '#44556688'}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}

        {/* Max speed needle */}
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
              stroke="#FF8800"
              strokeWidth={2}
            />
          );
        })()}

        {/* Speed labels */}
        {[0, 60, 120, 200].map((t) => {
          const angle = speedToAngle(t);
          const labelR = arcR - size * 0.16;
          const rad = ((angle - 90) * Math.PI) / 180;
          const label = unit === 'imperial' ? Math.round(t * 0.621371) : t;
          return (
            <SvgText
              key={t}
              x={cx + labelR * Math.cos(rad)}
              y={cy + labelR * Math.sin(rad) + 4}
              fill="#8899AA"
              fontSize={size * 0.05}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}

        {/* Center speed display */}
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
          fill="#8899AA"
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
