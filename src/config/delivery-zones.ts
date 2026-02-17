/**
 * Delivery zones for General Luna, Siargao
 * Fee: ₱12.5 per km from hub (one-way distance)
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

const FEE_PER_KM = 12.5;

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "core", name: "General Luna core", maxDistanceKm: 3, feePhp: 50 },
  { id: "extended", name: "Extended area", maxDistanceKm: 6, feePhp: 80 },
  { id: "outside", name: "Outside core", maxDistanceKm: 25, feePhp: 0, feePerKm: FEE_PER_KM },
];

/** Hub coordinates (General Luna) */
export const HUB_LAT = 9.7854;
export const HUB_LNG = 126.1574;

export const MAX_DELIVERY_KM = 25;

export function getDeliveryFee(distanceKm: number): { feePhp: number; zone: DeliveryZone } {
  for (const zone of DELIVERY_ZONES) {
    if (distanceKm <= zone.maxDistanceKm) {
      if (zone.feePerKm != null) {
        return { feePhp: Math.round(distanceKm * zone.feePerKm), zone };
      }
      return { feePhp: zone.feePhp, zone };
    }
  }
  const last = DELIVERY_ZONES[DELIVERY_ZONES.length - 1];
  return {
    feePhp: Math.round(distanceKm * (last.feePerKm ?? FEE_PER_KM)),
    zone: last,
  };
}
