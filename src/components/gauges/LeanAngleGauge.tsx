import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const COLORS = {
  background: '#0A0A0F',
  left: '#00B4FF',
  right: '#FF3A2F',
  neutral: '#8899AA',
  card: '#1A1A2E',
  text: '#FFFFFF',
};

interface Props {
  leanAngle: number; // degrees, negative=left, positive=right
  maxLeft?: number;
  maxRight?: number;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const LeanAngleGauge: React.FC<Props> = ({
  leanAngle,
  maxLeft = 0,
  maxRight = 0,
  size = 280,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.34;
  const needleR = size * 0.38;

  // Gauge spans from -60 (left, visual left) to +60 (right, visual right)
  // Mapped to screen angles: -60deg lean → 210° screen, 0 → 270°, +60 → 330°
  const MIN_LEAN = -60;
  const MAX_LEAN = 60;
  const ARC_START = 210; // screen angle for -60
  const ARC_END = 330;   // screen angle for +60

  const leanToAngle = (lean: number) =>
    ARC_START + ((lean - MIN_LEAN) / (MAX_LEAN - MIN_LEAN)) * (ARC_END - ARC_START);

  const clampedLean = Math.max(MIN_LEAN, Math.min(MAX_LEAN, leanAngle));
  const needleAngleDeg = leanToAngle(clampedLean);
  const needleAnim = useSharedValue(needleAngleDeg);

  useEffect(() => {
    needleAnim.value = withTiming(leanToAngle(Math.max(MIN_LEAN, Math.min(MAX_LEAN, leanAngle))), {
      duration: 80,
      easing: Easing.out(Easing.quad),
    });
  }, [leanAngle]);

  const animatedNeedleProps = useAnimatedProps(() => {
    const rad = ((needleAnim.value - 90) * Math.PI) / 180;
    const x2 = cx + needleR * Math.cos(rad);
    const y2 = cy + needleR * Math.sin(rad);
    return { x2: `${x2}`, y2: `${y2}` };
  });

  const AnimatedLine = Animated.createAnimatedComponent(Line);

  const isLeft = leanAngle < 0;
  const leanColor = isLeft ? COLORS.left : leanAngle > 0 ? COLORS.right : COLORS.neutral;
  const absLean = Math.abs(leanAngle).toFixed(1);

  // Draw left arc (210 to 270)
  const leftArcPath = describeArc(cx, cy, (outerR + innerR) / 2, 210, 270);
  // Draw right arc (270 to 330)
  const rightArcPath = describeArc(cx, cy, (outerR + innerR) / 2, 270, 330);

  // Active arc based on lean
  const zeroAngle = 270;
  const activeArcPath =
    leanAngle < 0
      ? describeArc(cx, cy, (outerR + innerR) / 2, leanToAngle(clampedLean), zeroAngle)
      : leanAngle > 0
      ? describeArc(cx, cy, (outerR + innerR) / 2, zeroAngle, leanToAngle(clampedLean))
      : null;

  // Max markers
  const maxLeftAngle = leanToAngle(Math.max(MIN_LEAN, Math.min(MAX_LEAN, maxLeft)));
  const maxRightAngle = leanToAngle(Math.max(MIN_LEAN, Math.min(MAX_LEAN, maxRight)));

  const tickAngles = [-60, -45, -30, -15, 0, 15, 30, 45, 60];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background arc track */}
        <Path
          d={leftArcPath}
          stroke={`${COLORS.left}33`}
          strokeWidth={size * 0.055}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={rightArcPath}
          stroke={`${COLORS.right}33`}
          strokeWidth={size * 0.055}
          fill="none"
          strokeLinecap="round"
        />

        {/* Active arc */}
        {activeArcPath && (
          <Path
            d={activeArcPath}
            stroke={leanColor}
            strokeWidth={size * 0.055}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
        )}

        {/* Tick marks */}
        {tickAngles.map((tick) => {
          const screenAngle = leanToAngle(tick);
          const rad = ((screenAngle - 90) * Math.PI) / 180;
          const major = tick % 30 === 0;
          const r1 = major ? outerR - size * 0.01 : outerR + size * 0.01;
          const r2 = major ? outerR + size * 0.06 : outerR + size * 0.04;
          return (
            <Line
              key={tick}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke={major ? COLORS.neutral : `${COLORS.neutral}66`}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}

        {/* Max left marker */}
        {Math.abs(maxLeft) > 1 && (() => {
          const rad = ((maxLeftAngle - 90) * Math.PI) / 180;
          const mr = outerR + size * 0.08;
          return (
            <Circle
              cx={cx + mr * Math.cos(rad)}
              cy={cy + mr * Math.sin(rad)}
              r={size * 0.018}
              fill={COLORS.left}
              opacity={0.8}
            />
          );
        })()}

        {/* Max right marker */}
        {Math.abs(maxRight) > 1 && (() => {
          const rad = ((maxRightAngle - 90) * Math.PI) / 180;
          const mr = outerR + size * 0.08;
          return (
            <Circle
              cx={cx + mr * Math.cos(rad)}
              cy={cy + mr * Math.sin(rad)}
              r={size * 0.018}
              fill={COLORS.right}
              opacity={0.8}
            />
          );
        })()}

        {/* Needle */}
        <AnimatedLine
          x1={`${cx}`}
          y1={`${cy}`}
          stroke={leanColor}
          strokeWidth={3}
          strokeLinecap="round"
          animatedProps={animatedNeedleProps}
        />
        <Circle cx={cx} cy={cy} r={size * 0.04} fill={COLORS.card} stroke={leanColor} strokeWidth={2} />

        {/* L / R labels */}
        <SvgText
          x={cx - outerR - size * 0.08}
          y={cy + size * 0.06}
          fill={COLORS.left}
          fontSize={size * 0.06}
          fontWeight="bold"
          textAnchor="middle"
        >
          L
        </SvgText>
        <SvgText
          x={cx + outerR + size * 0.08}
          y={cy + size * 0.06}
          fill={COLORS.right}
          fontSize={size * 0.06}
          fontWeight="bold"
          textAnchor="middle"
        >
          R
        </SvgText>
      </Svg>

      {/* Center overlay text */}
      <View style={[styles.centerOverlay, { width: size * 0.55, height: size * 0.55 }]}>
        <Text style={[styles.angleText, { fontSize: size * 0.22, color: leanColor }]}>
          {Math.abs(leanAngle).toFixed(1)}
        </Text>
        <Text style={[styles.unitText, { fontSize: size * 0.07, color: COLORS.neutral }]}>
          degrees
        </Text>
        <Text style={[styles.directionText, { fontSize: size * 0.07, color: leanColor }]}>
          {leanAngle < -0.5 ? '◄ LEFT' : leanAngle > 0.5 ? 'RIGHT ►' : 'UPRIGHT'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  angleText: {
    fontWeight: '900',
    letterSpacing: -2,
  },
  unitText: {
    fontWeight: '400',
    marginTop: -4,
  },
  directionText: {
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
});
