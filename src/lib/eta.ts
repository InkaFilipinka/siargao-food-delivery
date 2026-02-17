/**
 * Estimate delivery ETA range (min–max minutes)
 * Formula: prep time + travel time + buffer
 */
export function getEtaRange(distanceKm: number, isPriority = false): { min: number; max: number } {
  // Prep: 12–20 min (restaurant variability)
  const prepMin = isPriority ? 10 : 15;
  const prepMax = isPriority ? 15 : 22;

  // Travel: ~2–3 min per km (Siargao roads)
  const travelMin = Math.round(distanceKm * 2);
  const travelMax = Math.round(distanceKm * 3);

  // Buffer
  const bufferMin = 5;
  const bufferMax = 12;

  return {
    min: prepMin + travelMin + bufferMin,
    max: prepMax + travelMax + bufferMax,
  };
}

export function formatEtaRange(min: number, max: number): string {
  return `${min}–${max} min`;
}
