import { AccelerometerData, GyroscopeData } from '../types/sensors';

/**
 * Detects the phone orientation and gravity reference from the calibration
 * offsets captured when the bike was upright.
 *
 * The calibration stores the raw accelerometer reading at the neutral position.
 * The axis with the largest absolute component in the X-Y plane is the primary
 * gravity axis, which tells us:
 *   – portrait vs landscape orientation
 *   – whether the phone is right-side-up or inverted within that orientation
 *
 * Four orientations are handled:
 *   Portrait-up    (offsets.y  > 0) – screen faces rider, top pointing up
 *   Portrait-down  (offsets.y  < 0) – screen faces rider, top pointing down
 *   Landscape-left (offsets.x  > 0) – home button on the right in landscape
 *   Landscape-right(offsets.x  < 0) – home button on the left in landscape
 *
 * `gravityMagnitude` is the actual gravity component along the primary axis.
 * It replaces the previously hardcoded 1 G constant so that lean measurement
 * remains accurate when the phone is mounted at any 3-D angle (e.g. tilted
 * forward/backward on the mount), not just flat portrait or landscape.
 */
export function getLeanOrientation(offsets: { x: number; y: number; z: number }): {
  isPortrait: boolean;
  gravityAxisSign: number;
  gravityMagnitude: number;
} {
  const isPortrait = Math.abs(offsets.y) >= Math.abs(offsets.x);
  const primary = isPortrait ? offsets.y : offsets.x;
  const gravityAxisSign = primary < 0 ? -1 : 1;
  // Use the actual gravity magnitude along the primary axis.  Falls back to
  // 1.0 when the phone has not been calibrated yet (offsets all zero).
  // The 0.1 G threshold distinguishes a deliberately zeroed calibration from
  // a phone that is nearly at a 90° angle to the primary axis; values below
  // it are treated as uncalibrated to keep the formula numerically stable.
  const gravityMagnitude = Math.abs(primary) > 0.1 ? Math.abs(primary) : 1.0;
  return { isPortrait, gravityAxisSign, gravityMagnitude };
}

/**
 * Calculates the motorcycle lean angle from calibrated accelerometer data.
 *
 * The calibration step captures the full raw accelerometer reading when the
 * bike is upright and stores it as the gravity reference vector.  After
 * subtracting the offsets the calibrated reading is (0, 0, 0) when upright
 * regardless of how the phone is physically oriented in 3-D.  When the bike
 * rolls, the gravity vector migrates into the lateral axis (X for portrait,
 * Y for landscape).
 *
 * `gravityMagnitude` is the actual magnitude of the gravity reference along
 * the primary axis, returned by `getLeanOrientation`.  It replaces the old
 * hardcoded 1 G constant so that the formula stays exact even when the phone
 * is mounted at a 3-D angle (e.g. tilted forward or backward on the bracket).
 *
 * `gravityAxisSign` inverts both sides of each atan2 call for upside-down /
 * reversed-landscape orientations so left/right stay correct.
 *
 * Returns degrees: negative = left lean, positive = right lean.
 */
export function calculateLeanAngle(
  accel: AccelerometerData,
  isPortrait: boolean = true,
  gravityAxisSign: number = 1,
  gravityMagnitude: number = 1,
): number {
  if (isPortrait) {
    // Lateral axis = phone X; gravity (reference) axis = phone Y.
    // accel.x is negative when the bike leans right (the right side of the phone
    // tilts down, so gravity pulls along –X in the phone frame).  Negating it
    // restores the convention: negative angle = left lean, positive = right lean.
    return (
      Math.atan2(-gravityAxisSign * accel.x, gravityAxisSign * accel.y + gravityMagnitude) *
      (180 / Math.PI)
    );
  }
  // Landscape: lateral axis = phone Y; gravity (reference) axis = phone X
  return (
    Math.atan2(gravityAxisSign * accel.y, gravityAxisSign * accel.x + gravityMagnitude) *
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
