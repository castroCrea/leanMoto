import { AccelerometerData, GyroscopeData } from '../types/sensors';

/**
 * Detects the phone orientation and the sign of the primary gravity axis from
 * the calibration offsets that were captured when the bike was upright.
 *
 * The calibration stores the raw accelerometer reading at the neutral position
 * (with 1 G removed from the vertical axis – which is Z when lying flat, Y in
 * portrait mode, or X in landscape mode).  The axis with the largest absolute
 * offset is the one gravity was acting along, which tells us:
 *   – portrait vs landscape orientation
 *   – whether the phone is right-side-up or inverted within that orientation
 *
 * Four orientations are handled:
 *   Portrait-up    (offsets.y  ≈ +1) – screen faces rider, top pointing up
 *   Portrait-down  (offsets.y  ≈ −1) – screen faces rider, top pointing down
 *   Landscape-left (offsets.x  ≈ +1) – home button on the right in landscape
 *   Landscape-right(offsets.x  ≈ −1) – home button on the left in landscape
 */
export function getLeanOrientation(offsets: { x: number; y: number }): {
  isPortrait: boolean;
  gravityAxisSign: number;
} {
  const isPortrait = Math.abs(offsets.y) >= Math.abs(offsets.x);
  const primary = isPortrait ? offsets.y : offsets.x;
  const gravityAxisSign = primary < 0 ? -1 : 1;
  return { isPortrait, gravityAxisSign };
}

/**
 * Calculates the motorcycle lean angle from calibrated accelerometer data.
 *
 * The calibration step captures the raw accelerometer reading when the bike
 * is upright, then zeroes each axis.  Because the Z offset is adjusted by
 * subtracting 1 G (see sensorService.processAccelerometerData), the
 * calibrated reading is always (0, 0, 1) when upright regardless of how the
 * phone is physically oriented.  When the bike rolls, the gravity vector
 * migrates: into the X axis for a portrait mount, or into the Y axis for a
 * landscape mount.
 *
 * The `+1` in the denominator of each atan2 call reconstructs the cosine of
 * the lean angle from the calibrated reference axis (Y for portrait, X for
 * landscape), yielding an exact rather than approximate result.
 * `gravityAxisSign` inverts both the numerator and denominator for
 * upside-down / reversed-landscape orientations so left/right stay correct.
 *
 * Returns degrees: negative = left lean, positive = right lean.
 */
export function calculateLeanAngle(
  accel: AccelerometerData,
  isPortrait: boolean = true,
  gravityAxisSign: number = 1,
): number {
  if (isPortrait) {
    // Lateral axis = phone X; gravity (reference) axis = phone Y.
    // accel.x is negative when the bike leans right (the right side of the phone
    // tilts down, so gravity pulls along –X in the phone frame).  Negating it
    // restores the convention: negative angle = left lean, positive = right lean.
    return (
      Math.atan2(-gravityAxisSign * accel.x, gravityAxisSign * accel.y + 1) *
      (180 / Math.PI)
    );
  }
  // Landscape: lateral axis = phone Y; gravity (reference) axis = phone X
  return (
    Math.atan2(gravityAxisSign * accel.y, gravityAxisSign * accel.x + 1) *
    (180 / Math.PI)
  );
}

export function calculateRollRate(gyro: GyroscopeData): number {
  // Roll rate around the X axis in degrees/second
  return gyro.x * (180 / Math.PI);
}

export type LeanZone = 'safe' | 'moderate' | 'aggressive' | 'extreme';

export function classifyLeanZone(angle: number): LeanZone {
  const abs = Math.abs(angle);
  if (abs < 20) return 'safe';
  if (abs < 35) return 'moderate';
  if (abs < 45) return 'aggressive';
  return 'extreme';
}

export function calculateRiskScore(
  maxLean: number,
  maxSpeed: number,
  avgSpeed: number,
): number {
  // Weighted risk score 0-100
  const leanScore = Math.min((maxLean / 60) * 40, 40); // max 40 points
  const maxSpeedScore = Math.min((maxSpeed / 200) * 35, 35); // max 35 points
  const avgSpeedScore = Math.min((avgSpeed / 120) * 25, 25); // max 25 points
  return Math.round(leanScore + maxSpeedScore + avgSpeedScore);
}
