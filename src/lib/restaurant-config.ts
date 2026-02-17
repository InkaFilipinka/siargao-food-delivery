/** Parse "120 PHP" -> 120 */
export function parsePrice(price: string): number {
  const m = String(price).match(/[\d.]+/);
  return m ? parseFloat(m[0]) || 0 : 0;
}

export interface RestaurantConfigRow {
  slug: string;
  commission_pct: number;
  delivery_commission_pct: number;
  gcash_number: string | null;
  email: string | null;
}

const DEFAULT_COMMISSION = 30;
const DEFAULT_DELIVERY_COMMISSION = 30;

/** Get commission % for a slug. Returns default if not in map. */
export function getCommissionPct(config: Pick<RestaurantConfigRow, "commission_pct"> | null | undefined): number {
  return config?.commission_pct ?? DEFAULT_COMMISSION;
}

/** Get delivery commission % for a slug. */
export function getDeliveryCommissionPct(config: Pick<RestaurantConfigRow, "delivery_commission_pct"> | null | undefined): number {
  return config?.delivery_commission_pct ?? DEFAULT_DELIVERY_COMMISSION;
}

/** Cost (what we pay venue) from display price: cost = display / (1 + commission/100) */
export function costFromDisplay(displayPrice: number, commissionPct: number): number {
  if (commissionPct <= -100) return displayPrice;
  return displayPrice / (1 + commissionPct / 100);
}

/** Display price from cost: display = cost * (1 + commission/100) */
export function displayFromCost(cost: number, commissionPct: number): number {
  return cost * (1 + commissionPct / 100);
}
