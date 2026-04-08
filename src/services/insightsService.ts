import { v4 as uuidv4 } from 'uuid';
import { Ride, RideInsight } from '../types/ride';
import { AppLanguage } from '../i18n/translations';
import { t } from '../i18n';

export function generateInsights(ride: Ride, language?: AppLanguage): RideInsight[] {
  const insights: RideInsight[] = [];
  const now = Date.now();

  // Aggressive cornering
  if (ride.maxLeanAngle > 45) {
    insights.push({
      id: uuidv4(),
      type: 'warning',
      title: t('insights.aggressiveCorneringTitle', undefined, language),
      description: t('insights.aggressiveCorneringDescription', { value: ride.maxLeanAngle.toFixed(1) }, language),
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
      title: t('insights.highAverageSpeedTitle', undefined, language),
      description: t('insights.highAverageSpeedDescription', { value: ride.avgSpeed.toFixed(1) }, language),
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
      title: t('insights.shortRideTitle', undefined, language),
      description: t('insights.shortRideDescription', { value: ride.distance.toFixed(1) }, language),
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
      title: t('insights.highRiskRideTitle', undefined, language),
      description: t('insights.highRiskRideDescription', { value: ride.riskScore.toFixed(0) }, language),
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
      title: t('insights.balancedCorneringTitle', undefined, language),
      description: t(
        'insights.balancedCorneringDescription',
        { left: leftAbs.toFixed(1), right: rightAbs.toFixed(1) },
        language,
      ),
      timestamp: now,
    });
  }

  // Moderate lean angle achievement
  if (ride.maxLeanAngle >= 35 && ride.maxLeanAngle <= 45) {
    insights.push({
      id: uuidv4(),
      type: 'achievement',
      title: t('insights.confidentCorneringTitle', undefined, language),
      description: t('insights.confidentCorneringDescription', { value: ride.maxLeanAngle.toFixed(1) }, language),
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
      title: t('insights.smoothAndSteadyTitle', undefined, language),
      description: t('insights.smoothAndSteadyDescription', undefined, language),
      timestamp: now,
    });
  }

  // Long ride achievement
  if (ride.distance >= 100) {
    insights.push({
      id: uuidv4(),
      type: 'achievement',
      title: t('insights.centuryRideTitle', undefined, language),
      description: t('insights.centuryRideDescription', { value: ride.distance.toFixed(1) }, language),
      value: ride.distance,
      unit: 'km',
      timestamp: now,
    });
  }

  return insights;
}
