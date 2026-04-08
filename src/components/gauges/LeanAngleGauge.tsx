import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';

const COLORS = {
  left: '#E4E5E6',
  right: '#F38BA8',
  neutral: '#8B90A7',
  track: '#141516',
  trackBorder: '#2A2F3D',
  text: '#FFFFFF',
};

interface Props {
  leanAngle: number;
  maxLeft?: number;
  maxRight?: number;
  size?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const LeanAngleGauge: React.FC<Props> = ({
  leanAngle,
  maxLeft = 0,
  maxRight = 0,
  size = 280,
}) => {
  const width = size;
  const height = Math.max(180, size * 0.62);
  const minLean = -60;
  const maxLean = 60;
  const safeLean = Number.isFinite(leanAngle) ? leanAngle : 0;
  const clampedLean = clamp(safeLean, minLean, maxLean);
  const normalizedLean = (clampedLean - minLean) / (maxLean - minLean);

  const centerX = width / 2;
  const trackY = height * 0.7;
  const trackWidth = width * 0.82;
  const trackStart = centerX - trackWidth / 2;
  const trackEnd = centerX + trackWidth / 2;
  const markerX = trackStart + normalizedLean * trackWidth;
  const bikeBaseY = height * 0.34;
  const bikeOffsetX = markerX - centerX;
  const bikeTilt = clamp(clampedLean * 0.8, -42, 42);
  const maxLeftX = trackStart + ((clamp(maxLeft, minLean, maxLean) - minLean) / (maxLean - minLean)) * trackWidth;
  const maxRightX = trackStart + ((clamp(maxRight, minLean, maxLean) - minLean) / (maxLean - minLean)) * trackWidth;

  const leanColor =
    clampedLean < -0.5 ? COLORS.left : clampedLean > 0.5 ? COLORS.right : COLORS.neutral;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Rect
          x={trackStart}
          y={trackY - 8}
          width={trackWidth}
          height={16}
          rx={8}
          fill={COLORS.track}
          stroke={COLORS.trackBorder}
          strokeWidth={1}
        />

        <Line
          x1={centerX}
          y1={trackY - 18}
          x2={centerX}
          y2={trackY + 18}
          stroke={COLORS.neutral}
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {[-60, -30, 0, 30, 60].map((tick) => {
          const x = trackStart + ((tick - minLean) / (maxLean - minLean)) * trackWidth;
          return (
            <React.Fragment key={tick}>
              <Line
                x1={x}
                y1={trackY - 14}
                x2={x}
                y2={trackY + 14}
                stroke={tick === 0 ? COLORS.neutral : `${COLORS.neutral}88`}
                strokeWidth={tick === 0 ? 2 : 1.5}
              />
              <SvgText
                x={x}
                y={trackY + 34}
                fill="#667788"
                fontSize={12}
                fontWeight="700"
                textAnchor="middle"
              >
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}

        {Math.abs(maxLeft) > 1 && (
          <Circle cx={maxLeftX} cy={trackY} r={6} fill={COLORS.left} opacity={0.85} />
        )}
        {Math.abs(maxRight) > 1 && (
          <Circle cx={maxRightX} cy={trackY} r={6} fill={COLORS.right} opacity={0.85} />
        )}

        <Line
          x1={markerX}
          y1={trackY}
          x2={markerX}
          y2={bikeBaseY + 30}
          stroke={leanColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        <Circle cx={markerX} cy={trackY} r={11} fill={leanColor} />

        <SvgText
          x={trackStart - 18}
          y={trackY + 4}
          fill={COLORS.left}
          fontSize={15}
          fontWeight="800"
          textAnchor="middle"
        >
          L
        </SvgText>
        <SvgText
          x={trackEnd + 18}
          y={trackY + 4}
          fill={COLORS.right}
          fontSize={15}
          fontWeight="800"
          textAnchor="middle"
        >
          R
        </SvgText>
      </Svg>

      <View style={styles.readout}>
        <Text style={[styles.angleText, { color: leanColor }]}>
          {Math.abs(clampedLean).toFixed(1)}°
        </Text>
        <Text style={styles.labelText}>
          {clampedLean < -0.5 ? 'lean left' : clampedLean > 0.5 ? 'lean right' : 'upright'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  readout: {
    position: 'absolute',
    top: 12,
    alignItems: 'center',
  },
  angleText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  labelText: {
    color: '#8B90A7',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: -2,
  },
});
