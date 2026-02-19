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

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Get current day key (0=Sun) for Philippines time */
export function getTodayKey(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    weekday: "short",
  });
  return formatter.format(new Date()).toLowerCase().slice(0, 3);
}

/** Get hours for a given day from hours_by_day. Falls back to legacy hours if null. */
export function getHoursForDay(
  hoursByDay: Record<string, string> | null,
  legacyHours: string | null,
  dayKey: string
): string | null {
  if (hoursByDay && typeof hoursByDay[dayKey] === "string" && hoursByDay[dayKey].trim()) {
    const v = hoursByDay[dayKey].trim().toLowerCase();
    if (v === "closed" || v === "-") return null;
    return hoursByDay[dayKey].trim();
  }
  return legacyHours;
}

/** Format hours_by_day for display (e.g. "Mon–Sun 08:00–22:00" or per-day) */
export function formatHoursForDisplay(hoursByDay: Record<string, string> | null): string | null {
  if (!hoursByDay || typeof hoursByDay !== "object") return null;
  const entries = DAY_KEYS.map((k) => [k, (hoursByDay[k] || "").trim()] as const).filter(([, v]) => v && v !== "closed" && v !== "-");
  if (entries.length === 0) return null;
  const same = entries.every(([, v]) => v === entries[0][1]);
  if (same) return entries[0][1].replace("-", " – ");
  const dayNames: Record<string, string> = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };
  const groups = new Map<string, string[]>();
  for (const [k, v] of entries) {
    const n = dayNames[k];
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v)!.push(n);
  }
  return [...groups.entries()]
    .map(([range, days]) => `${days.join(", ")} ${range.replace("-", "–")}`)
    .join(" • ");
}

/** Check if restaurant is open now (Philippines time). Hours format: "HH:mm-HH:mm". Supports hoursByDay. */
export function isOpenNow(
  hours: string | null,
  hoursByDay?: Record<string, string> | null
): boolean | null {
  const dayKey = getTodayKey();
  const activeHours = getHoursForDay(hoursByDay ?? null, hours, dayKey);
  if (!activeHours) return null;
  const [openStr, closeStr] = activeHours.split("-").map((s) => s.trim());
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
