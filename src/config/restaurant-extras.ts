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
  return m ? m[1] : "";
};

/** Map menuUrl or slug -> extras. Add entries as needed. */
export const restaurantExtras: Record<string, RestaurantExtras> = {
  // Example: sanabowl: { ntfyTopic: "siargao-sanabowl", minOrderPhp: 200, hours: "07:00-21:00", phone: "639123456789" },
  // Default hours for General Luna (many cafes/restaurants): 8am-10pm
  sanabowl: { hours: "07:00-21:00" },
  "weekend-cafe": { hours: "07:00-21:00" },
  "tropical-temple": { hours: "07:00-22:00" },
  "cafe-lunares": { hours: "07:00-21:00" },
  "good-cup": { hours: "07:00-21:00" },
  kermit: { hours: "11:00-23:00" },
  bravo: { hours: "07:00-22:00" },
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
