import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

const COLORS = {
  left: '#00B4FF',
  right: '#FF3A2F',
  neutral: '#8899AA',
  card: '#1A1A2E',
};

interface Props {
  leanAngle: number;
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
  const minLean = -60;
  const maxLean = 60;
  const arcStart = 210;
  const arcEnd = 330;

  const leanToAngle = (lean: number) =>
    arcStart + ((lean - minLean) / (maxLean - minLean)) * (arcEnd - arcStart);

  const safeLean = Number.isFinite(leanAngle) ? leanAngle : 0;
  const clampedLean = Math.max(minLean, Math.min(maxLean, safeLean));
  const needleAngleDeg = leanToAngle(clampedLean);
  const needleRad = ((needleAngleDeg - 90) * Math.PI) / 180;
  const needleX2 = cx + needleR * Math.cos(needleRad);
  const needleY2 = cy + needleR * Math.sin(needleRad);

  const isLeft = safeLean < 0;
  const leanColor = isLeft ? COLORS.left : safeLean > 0 ? COLORS.right : COLORS.neutral;
  const leftArcPath = describeArc(cx, cy, (outerR + innerR) / 2, 210, 270);
  const rightArcPath = describeArc(cx, cy, (outerR + innerR) / 2, 270, 330);
  const zeroAngle = 270;
  const activeArcPath =
    safeLean < 0
      ? describeArc(cx, cy, (outerR + innerR) / 2, leanToAngle(clampedLean), zeroAngle)
      : safeLean > 0
        ? describeArc(cx, cy, (outerR + innerR) / 2, zeroAngle, leanToAngle(clampedLean))
        : null;

  const maxLeftAngle = leanToAngle(Math.max(minLean, Math.min(maxLean, maxLeft)));
  const maxRightAngle = leanToAngle(Math.max(minLean, Math.min(maxLean, maxRight)));
  const tickAngles = [-60, -45, -30, -15, 0, 15, 30, 45, 60];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
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

        <Line
          x1={cx}
          y1={cy}
          x2={needleX2}
          y2={needleY2}
          stroke={leanColor}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={cy} r={size * 0.04} fill={COLORS.card} stroke={leanColor} strokeWidth={2} />

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

      <View style={[styles.centerOverlay, { width: size * 0.55, height: size * 0.55 }]}>
        <Text style={[styles.angleText, { fontSize: size * 0.22, color: leanColor }]}>
          {Math.abs(safeLean).toFixed(1)}
        </Text>
        <Text style={[styles.unitText, { fontSize: size * 0.07, color: COLORS.neutral }]}>
          degrees
        </Text>
        <Text style={[styles.directionText, { fontSize: size * 0.07, color: leanColor }]}>
          {safeLean < -0.5 ? '◄ LEFT' : safeLean > 0.5 ? 'RIGHT ►' : 'UPRIGHT'}
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
    marginTop: 2,
    letterSpacing: 1,
  },
});
