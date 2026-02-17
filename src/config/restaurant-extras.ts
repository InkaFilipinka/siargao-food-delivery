/**
 * Optional config per restaurant: ntfy topic, min order, hours, phone
 * Only include overrides; defaults apply for the rest.
 */
export interface RestaurantExtras {
  ntfyTopic?: string;
  minOrderPhp?: number;
  /** "HH:mm-HH:mm" e.g. "08:00-22:00" (24h) */
  hours?: string;
  /** For call button */
  phone?: string;
}

const slug = (url: string) => {
  const m = url.match(/siargaodelivery\.com\/([^/]+)\/?$/);
  return m ? m[1] : url;
};

/** Map menuUrl or slug -> extras. Mockup data for testing. */
export const restaurantExtras: Record<string, RestaurantExtras> = {
  "surf-cafe": { hours: "07:00-18:00", minOrderPhp: 100 },
  "island-bowl": { hours: "07:00-15:00", minOrderPhp: 150 },
  "lolas-kitchen": { hours: "10:00-21:00", minOrderPhp: 80 },
  "beach-burger": { hours: "11:00-23:00", minOrderPhp: 120 },
  "sunset-pizza": { hours: "16:00-02:00", minOrderPhp: 200 },
  "island-liquor": { hours: "14:00-02:00", minOrderPhp: 150 },
  "general-luna-mart": { hours: "06:00-22:00", minOrderPhp: 100 },
  "tropical-organics": { hours: "08:00-18:00", minOrderPhp: 100 },
  "coconut-kitchen": { hours: "07:00-20:00", minOrderPhp: 150 },
  "wave-cafe": { hours: "06:30-18:00", minOrderPhp: 120 },
  "green-leaf": { hours: "08:00-21:00", minOrderPhp: 180 },
  "sari-sari-grill": { hours: "10:00-22:00", minOrderPhp: 80 },
  "surf-shack": { hours: "11:00-01:00", minOrderPhp: 100 },
  "pasta-paradise": { hours: "17:00-23:00", minOrderPhp: 200 },
  "seaside-grill": { hours: "11:00-22:00", minOrderPhp: 300 },
  "sunrise-bakery": { hours: "05:00-14:00", minOrderPhp: 100 },
  "island-brew": { hours: "16:00-02:00", minOrderPhp: 150 },
  "fresh-mart": { hours: "06:00-23:00", minOrderPhp: 100 },
  "tropical-smoothie-bar": { hours: "07:00-20:00", minOrderPhp: 120 },
};

export function getNtfyTopic(menuUrlOrSlug: string): string {
  const s = menuUrlOrSlug.includes("/") ? slug(menuUrlOrSlug) : menuUrlOrSlug;
  return restaurantExtras[s]?.ntfyTopic ?? `siargao-${s}`;
}

export function getMinOrderPhp(menuUrlOrSlug: string): number | null {
  const s = menuUrlOrSlug.includes("/") ? slug(menuUrlOrSlug) : menuUrlOrSlug;
  return restaurantExtras[s]?.minOrderPhp ?? null;
}

export function getRestaurantHours(menuUrlOrSlug: string): string | null {
  const s = menuUrlOrSlug.includes("/") ? slug(menuUrlOrSlug) : menuUrlOrSlug;
  return restaurantExtras[s]?.hours ?? null;
}

export function getRestaurantPhone(menuUrlOrSlug: string): string | null {
  const s = menuUrlOrSlug.includes("/") ? slug(menuUrlOrSlug) : menuUrlOrSlug;
  return restaurantExtras[s]?.phone ?? null;
}

/** Check if restaurant is open now (Philippines time). Hours format: "HH:mm-HH:mm" */
export function isOpenNow(hours: string | null): boolean | null {
  if (!hours) return null;
  const [openStr, closeStr] = hours.split("-").map((s) => s.trim());
  if (!openStr || !closeStr) return null;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [phHour, phMin] = formatter.format(new Date()).split(":").map(Number);
  const mins = phHour * 60 + phMin;
  const [openH, openM] = openStr.split(":").map(Number);
  const [closeH, closeM] = closeStr.split(":").map(Number);
  const openMins = openH * 60 + (openM || 0);
  let closeMins = closeH * 60 + (closeM || 0);
  if (closeMins <= openMins) closeMins += 24 * 60; // e.g. 22:00-02:00
  return mins >= openMins && mins < closeMins;
}
