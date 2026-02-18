/**
 * Delivery zones for General Luna, Siargao
 * Fee: ₱12.5 per km round trip (same as Siargao Scooters), minimum ₱100
 */
export interface DeliveryZone {
  id: string;
  name: string;
  /** Max distance from hub (km) - this zone applies when distance <= maxDistanceKm */
  maxDistanceKm: number;
  /** Flat delivery fee (PHP) - used when within zone */
  feePhp: number;
  /** Optional: beyond this zone use per-km rate (PHP per km one-way) */
  feePerKm?: number;
}

/** ₱12.5 per km one-way = ₱25 per km round trip. Min ₱100. (Matches Siargao Scooters) */
const FEE_PER_KM_ONE_WAY = 12.5;
const MIN_DELIVERY_FEE = 100;

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "core", name: "General Luna core", maxDistanceKm: 25, feePhp: 0 },
];

/** Hub coordinates (General Luna) */
export const HUB_LAT = 9.7854;
export const HUB_LNG = 126.1574;

export const MAX_DELIVERY_KM = 25;

export function getDeliveryFee(distanceKm: number): { feePhp: number; zone: DeliveryZone } {
  const feeByDistance = Math.round(distanceKm * FEE_PER_KM_ONE_WAY * 2);
  const feePhp = Math.max(MIN_DELIVERY_FEE, feeByDistance);
  return { feePhp, zone: DELIVERY_ZONES[0] };
}

/** Haversine distance in km (straight-line). Used when restaurant has coords. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Get distance and fee for delivery.
 * Use restaurant coords when available; otherwise use hub (fallback for legacy / no-coords restaurants).
 */
export function getDistanceAndFee(
  userLat: number,
  userLng: number,
  restaurantLat?: number | null,
  restaurantLng?: number | null
): { distanceKm: number; feePhp: number } {
  const lat = restaurantLat != null && restaurantLng != null ? restaurantLat : HUB_LAT;
  const lng = restaurantLat != null && restaurantLng != null ? restaurantLng : HUB_LNG;
  const distanceKm = haversineKm(userLat, userLng, lat, lng);
  const { feePhp } = getDeliveryFee(distanceKm);
  return { distanceKm, feePhp };
}
