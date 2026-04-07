export class LowPassFilter {
  private alpha: number;
  private lastValue: number;

  constructor(alpha: number = 0.1) {
    this.alpha = alpha;
    this.lastValue = 0;
  }

  filter(value: number): number {
    this.lastValue = this.alpha * value + (1 - this.alpha) * this.lastValue;
    return this.lastValue;
  }

  reset(): void {
    this.lastValue = 0;
  }
}

export class KalmanFilter {
  private R: number; // measurement noise covariance
  private Q: number; // process noise covariance
  private P: number; // estimation error covariance
  private K: number; // Kalman gain
  private x: number; // state estimate

  constructor(R: number = 1, Q: number = 0.1) {
    this.R = R;
    this.Q = Q;
    this.P = 1;
    this.K = 0;
    this.x = 0;
  }

  filter(measurement: number): number {
    // Prediction update
    this.P = this.P + this.Q;

    // Measurement update
    this.K = this.P / (this.P + this.R);
    this.x = this.x + this.K * (measurement - this.x);
    this.P = (1 - this.K) * this.P;

    return this.x;
  }

  reset(): void {
    this.P = 1;
    this.K = 0;
    this.x = 0;
  }
}

export function movingAverage(
  buffer: number[],
  newValue: number,
  windowSize: number,
): { value: number; buffer: number[] } {
  const updatedBuffer = [...buffer, newValue];
  if (updatedBuffer.length > windowSize) {
    updatedBuffer.shift();
  }
  const value = updatedBuffer.reduce((sum, v) => sum + v, 0) / updatedBuffer.length;
  return { value, buffer: updatedBuffer };
}
