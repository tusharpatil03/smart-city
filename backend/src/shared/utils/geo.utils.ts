export interface GeoFilter {
  latitude: number;
  longitude: number;
  maxDistanceMeters?: number;
}

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }

  return Number.NaN;
};

export const parseGeoFilter = (
  latitude: unknown,
  longitude: unknown,
  maxDistanceMeters: unknown
): GeoFilter | null => {
  const lat = parseNumber(latitude);
  const lng = parseNumber(longitude);
  const maxDistance = parseNumber(maxDistanceMeters);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  if (Number.isFinite(maxDistance) && maxDistance > 0) {
    return {
      latitude: lat,
      longitude: lng,
      maxDistanceMeters: maxDistance
    };
  }

  return {
    latitude: lat,
    longitude: lng
  };
};
