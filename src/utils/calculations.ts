export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceBetweenCoords(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function formatDistance(km: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    const miles = km * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(kmh: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${kmhToMph(kmh).toFixed(0)} mph`;
  }
  return `${kmh.toFixed(0)} km/h`;
}

export function msToKmh(ms: number): number {
  return ms * 3.6;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function calculateHeading(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLon = degreesToRadians(lon2 - lon1);
  const lat1Rad = degreesToRadians(lat1);
  const lat2Rad = degreesToRadians(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}
