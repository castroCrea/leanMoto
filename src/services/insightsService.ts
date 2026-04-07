import { v4 as uuidv4 } from 'uuid';
import { Ride, RideInsight } from '../types/ride';

export function generateInsights(ride: Ride): RideInsight[] {
  const insights: RideInsight[] = [];
  const now = Date.now();

  // Aggressive cornering
  if (ride.maxLeanAngle > 45) {
    insights.push({
      id: uuidv4(),
      type: 'warning',
      title: 'Aggressive Cornering Detected',
      description: `You reached a maximum lean angle of ${ride.maxLeanAngle.toFixed(1)}°. Ride within your limits.`,
      value: ride.maxLeanAngle,
      unit: '°',
      timestamp: now,
    });
  }

  // High average speed
  if (ride.avgSpeed > 100) {
    insights.push({
      id: uuidv4(),
      type: 'warning',
      title: 'High Average Speed',
      description: `Your average speed was ${ride.avgSpeed.toFixed(1)} km/h. Consider the road conditions.`,
      value: ride.avgSpeed,
      unit: 'km/h',
      timestamp: now,
    });
  }

  // Short ride
  if (ride.distance < 5) {
    insights.push({
      id: uuidv4(),
      type: 'info',
      title: 'Short Ride',
      description: `You covered ${ride.distance.toFixed(1)} km. Short rides are great for warm-up or cool-down.`,
      value: ride.distance,
      unit: 'km',
      timestamp: now,
    });
  }

  // High risk
  if (ride.riskScore > 70) {
    insights.push({
      id: uuidv4(),
      type: 'warning',
      title: 'High Risk Ride',
      description: `Your ride risk score was ${ride.riskScore.toFixed(0)}/100. Focus on smooth, progressive inputs.`,
      value: ride.riskScore,
      unit: '/100',
      timestamp: now,
    });
  }

  // Balanced cornering (left and right within 10 degrees)
  const leftAbs = Math.abs(ride.leftMaxAngle);
  const rightAbs = Math.abs(ride.rightMaxAngle);
  if (leftAbs > 5 && rightAbs > 5 && Math.abs(leftAbs - rightAbs) < 10) {
    insights.push({
      id: uuidv4(),
      type: 'achievement',
      title: 'Balanced Cornering',
      description: `Great balance! Left max: ${leftAbs.toFixed(1)}° vs Right max: ${rightAbs.toFixed(1)}°. Consistent technique!`,
      timestamp: now,
    });
  }

  // Moderate lean angle achievement
  if (ride.maxLeanAngle >= 35 && ride.maxLeanAngle <= 45) {
    insights.push({
      id: uuidv4(),
      type: 'achievement',
      title: 'Confident Cornering',
      description: `You hit ${ride.maxLeanAngle.toFixed(1)}° lean angle. You're riding with confidence.`,
      value: ride.maxLeanAngle,
      unit: '°',
      timestamp: now,
    });
  }

  // Good speed tip
  if (ride.maxSpeed < 80 && ride.distance > 10) {
    insights.push({
      id: uuidv4(),
      type: 'tip',
      title: 'Smooth and Steady',
      description: 'You maintained sensible speeds. Consistency is key to improving cornering technique.',
      timestamp: now,
    });
  }

  // Long ride achievement
  if (ride.distance >= 100) {
    insights.push({
      id: uuidv4(),
      type: 'achievement',
      title: 'Century Ride!',
      description: `You completed ${ride.distance.toFixed(1)} km in one session. Outstanding endurance!`,
      value: ride.distance,
      unit: 'km',
      timestamp: now,
    });
  }

  return insights;
}
