import { restaurantData } from "@/data/restaurants";
import menuItemsData from "@/data/menu-items.json";
import { getRestaurantHours, getMinOrderPhp } from "@/config/restaurant-extras";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  parsePrice,
  displayFromCost,
  getCommissionPct,
} from "@/lib/restaurant-config";

export const dynamic = "force-dynamic";

interface MenuItemJson {
  name: string;
  price: string;
  cost?: number;
}

export async function GET(request: Request) {
  try {
    return await getRestaurantsData(request);
  } catch (err) {
    console.error("Restaurants API error:", err);
    return getStaticFallback();
  }
}

async function getRestaurantsData(request: Request) {
  const { searchParams } = new URL(request.url);
  let includeHidden = searchParams.get("includeHidden") === "1" || searchParams.get("includeHidden") === "true";
  let isStaffRequest = false;
  if (includeHidden) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    const staffToken = process.env.STAFF_TOKEN;
    if (!staffToken || token !== staffToken) {
      includeHidden = false;
    } else {
      isStaffRequest = true;
    }
  }
  const menuByRestaurant = new Map(
    menuItemsData.restaurants.map((r: { name: string; menuItems?: MenuItemJson[] }) => [
      r.name,
      r.menuItems || [],
    ])
  );
  const imagesByRestaurant = new Map(
    menuItemsData.restaurants.map((r: { name: string; imageUrls?: string[] }) => [r.name, r.imageUrls || []])
  );

  const getSlug = (url: string) => {
    const m = url.match(/siargaodelivery\.com\/([^/]+)\/?$/);
    return m ? m[1] : url;
  };

  const staticSlugs = restaurantData.restaurants.map((r) => getSlug(r.menuUrl));
  const configBySlug = new Map<string, {
    commission_pct: number;
    display_name?: string | null;
    whatsapp_number?: string | null;
    menu_url?: string | null;
  }>();

  const hoursMinOrderBySlug = new Map<string, { hours: string | null; minOrderPhp: number | null }>();
  const latLngBySlug = new Map<string, { lat: number; lng: number }>();
  const mediaBySlug = new Map<string, { logoUrl: string | null; imageUrls: string[] }>();
  const menuExtrasBySlug = new Map<string, { name: string; price: string }[]>();
  let hiddenSlugs = new Set<string>();
  let adminRestaurants: { slug: string; name: string; categories: string[]; price_range: string | null; tags: string[]; menu_url: string | null }[] = [];
  let supabase: ReturnType<typeof getSupabaseAdmin> = null;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    supabase = null;
  }
  if (supabase) {
    let mediaData: { slug: string; logo_url: string | null; image_urls: string[] }[] = [];
    let extrasData: { slug: string; item_name: string; price: string }[] = [];
    const [hiddenRes, adminRes] = await Promise.all([
      supabase.from("hidden_restaurants").select("slug"),
      supabase.from("admin_restaurants").select("slug, name, categories, price_range, tags, menu_url"),
    ]);
    if (!hiddenRes.error) hiddenSlugs = new Set((hiddenRes.data || []).map((h: { slug: string }) => h.slug));
    if (!adminRes.error) adminRestaurants = adminRes.data || [];
    const allSlugs = [...staticSlugs, ...adminRestaurants.map((a) => a.slug)];
    const [configRes, mediaRes, extrasRes] = await Promise.all([
      supabase.from("restaurant_config").select("slug, commission_pct, hours, min_order_php, lat, lng, display_name, whatsapp_number, menu_url").in("slug", allSlugs),
      supabase.from("restaurant_media").select("slug, logo_url, image_urls").in("slug", allSlugs),
      supabase.from("restaurant_menu_extras").select("slug, item_name, price").in("slug", allSlugs),
    ]);
    if (!mediaRes.error) mediaData = mediaRes.data || [];
    if (!extrasRes.error) extrasData = extrasRes.data || [];
    const configs = configRes.data;
    for (const m of mediaData) {
      const urls = Array.isArray(m.image_urls) ? m.image_urls : [];
      mediaBySlug.set(m.slug, { logoUrl: m.logo_url ?? null, imageUrls: urls });
    }
    for (const e of extrasData) {
      const list = menuExtrasBySlug.get(e.slug) || [];
      list.push({ name: e.item_name, price: e.price });
      menuExtrasBySlug.set(e.slug, list);
    }
    for (const c of configs || []) {
      configBySlug.set(c.slug, {
        commission_pct: c.commission_pct ?? 30,
        display_name: c.display_name ?? null,
        whatsapp_number: c.whatsapp_number ?? null,
        menu_url: c.menu_url ?? null,
      });
      hoursMinOrderBySlug.set(c.slug, {
        hours: c.hours ?? null,
        minOrderPhp: c.min_order_php != null ? Number(c.min_order_php) : null,
      });
      if (c.lat != null && c.lng != null) {
        latLngBySlug.set(c.slug, { lat: Number(c.lat), lng: Number(c.lng) });
      }
    }
  }

  const staticList = restaurantData.restaurants
    .filter((r) => includeHidden || !hiddenSlugs.has(getSlug(r.menuUrl)))
    .map((r) => {
      const slug = getSlug(r.menuUrl);
      const rawItems = menuByRestaurant.get(r.name) || [];
      const config = configBySlug.get(slug);
      const commissionPct = getCommissionPct(config);

      const baseMenuItems = rawItems.map((item: MenuItemJson) => {
        const baseDisplay = parsePrice(item.price);
        const cost = item.cost ?? baseDisplay / 1.3;
        const displayValue = Math.round(displayFromCost(cost, commissionPct) * 100) / 100;
        return { name: item.name, price: `${displayValue} PHP` };
      });
      const extras = menuExtrasBySlug.get(slug) || [];
      const menuItems = [...baseMenuItems, ...extras];

      const staticImages = imagesByRestaurant.get(r.name) || [];
      const media = mediaBySlug.get(slug);
      const mediaImages = media?.imageUrls || [];
      const imageUrls = [...staticImages, ...mediaImages];
      const featuredImage = media?.logoUrl || imageUrls[0] || null;
      const displayName = config?.display_name ?? r.name;
      const menuUrlOverride = config?.menu_url;
      return {
        ...r,
        name: displayName,
        menuUrl: menuUrlOverride ?? r.menuUrl,
        whatsappNumber: config?.whatsapp_number ?? null,
        slug,
        menuItems,
        imageUrls,
        featuredImage,
        logoUrl: media?.logoUrl ?? null,
        hours: hoursMinOrderBySlug.get(slug)?.hours ?? getRestaurantHours(slug) ?? getRestaurantHours(r.menuUrl) ?? null,
        minOrderPhp: hoursMinOrderBySlug.get(slug)?.minOrderPhp ?? getMinOrderPhp(slug) ?? getMinOrderPhp(r.menuUrl) ?? null,
        lat: latLngBySlug.get(slug)?.lat ?? null,
        lng: latLngBySlug.get(slug)?.lng ?? null,
        isAdminRestaurant: false,
        isHidden: hiddenSlugs.has(slug),
      };
    });

  const adminList = adminRestaurants
    .filter((a) => includeHidden || !hiddenSlugs.has(a.slug))
    .map((a) => {
      const slug = a.slug;
      const extras = menuExtrasBySlug.get(slug) || [];
      const media = mediaBySlug.get(slug);
      const imageUrls = media?.imageUrls || [];
      const featuredImage = media?.logoUrl || imageUrls[0] || null;
      const menuItems = extras.map((e) => ({ name: e.name, price: e.price }));
      const config = configBySlug.get(slug);
      const displayName = config?.display_name ?? a.name;
      const menuUrlOverride = config?.menu_url ?? a.menu_url;
      return {
        name: displayName,
        menuUrl: menuUrlOverride || `https://siargaodelivery.com/${slug}`,
        whatsappNumber: config?.whatsapp_number ?? null,
        categories: a.categories,
        priceRange: a.price_range || "$$",
        tags: a.tags,
        slug,
        menuItems,
        imageUrls,
        featuredImage,
        logoUrl: media?.logoUrl ?? null,
        hours: hoursMinOrderBySlug.get(slug)?.hours ?? null,
        minOrderPhp: hoursMinOrderBySlug.get(slug)?.minOrderPhp ?? null,
        lat: latLngBySlug.get(slug)?.lat ?? null,
        lng: latLngBySlug.get(slug)?.lng ?? null,
        isAdminRestaurant: true,
        isHidden: hiddenSlugs.has(slug),
      };
    });

  const restaurants = [...staticList, ...adminList];
  const restaurantsToReturn = isStaffRequest
    ? restaurants
    : restaurants.map(({ whatsappNumber: _w, ...r }) => r);

  return Response.json({
    restaurants: restaurantsToReturn,
    categories: restaurantData.categories,
    cravingCategories: restaurantData.cravingCategories,
    tagline: restaurantData.tagline,
    description: restaurantData.description,
  });
}

/** Fallback when DB fails - return static data only */
function getStaticFallback() {
  const menuByRestaurant = new Map(
    menuItemsData.restaurants.map((r: { name: string; menuItems?: MenuItemJson[] }) => [
      r.name,
      r.menuItems || [],
    ])
  );
  const imagesByRestaurant = new Map(
    menuItemsData.restaurants.map((r: { name: string; imageUrls?: string[] }) => [r.name, r.imageUrls || []])
  );
  const getSlug = (url: string) => {
    const m = url.match(/siargaodelivery\.com\/([^/]+)\/?$/);
    return m ? m[1] : url;
  };
  const restaurants = restaurantData.restaurants.map((r) => {
    const slug = getSlug(r.menuUrl);
    const menuItems = menuByRestaurant.get(r.name) || [];
    const imageUrls = imagesByRestaurant.get(r.name) || [];
    return {
      ...r,
      slug,
      menuItems,
      imageUrls,
      featuredImage: imageUrls[0] || null,
      logoUrl: null,
      hours: null,
      minOrderPhp: null,
      lat: null,
      lng: null,
      isAdminRestaurant: false,
      isHidden: false,
    };
  });
  return Response.json({
    restaurants,
    categories: restaurantData.categories,
    cravingCategories: restaurantData.cravingCategories,
    tagline: restaurantData.tagline,
    description: restaurantData.description,
  });
}
