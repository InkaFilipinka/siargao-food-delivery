import { restaurantData } from "@/data/restaurants";
import menuItemsData from "@/data/menu-items.json";
import { getRestaurantHours, getMinOrderPhp } from "@/config/restaurant-extras";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  parsePrice,
  displayFromCost,
  getCommissionPct,
} from "@/lib/restaurant-config";

interface MenuItemJson {
  name: string;
  price: string;
  cost?: number;
}

export async function GET() {
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

  const slugs = restaurantData.restaurants.map((r) => getSlug(r.menuUrl));
  const configBySlug = new Map<string, { commission_pct: number }>();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: configs } = await supabase
      .from("restaurant_config")
      .select("slug, commission_pct")
      .in("slug", slugs);
    for (const c of configs || []) {
      configBySlug.set(c.slug, { commission_pct: c.commission_pct ?? 30 });
    }
  }

  const restaurants = restaurantData.restaurants.map((r) => {
    const slug = getSlug(r.menuUrl);
    const rawItems = menuByRestaurant.get(r.name) || [];
    const config = configBySlug.get(slug);
    const commissionPct = getCommissionPct(config);

    const menuItems = rawItems.map((item: MenuItemJson) => {
      const baseDisplay = parsePrice(item.price);
      const cost = item.cost ?? baseDisplay / 1.3;
      const displayValue = Math.round(displayFromCost(cost, commissionPct) * 100) / 100;
      return {
        name: item.name,
        price: `${displayValue} PHP`,
      };
    });

    const imageUrls = imagesByRestaurant.get(r.name) || [];
    return {
      ...r,
      slug,
      menuItems,
      imageUrls,
      featuredImage: imageUrls[0] || null,
      hours: getRestaurantHours(slug) || getRestaurantHours(r.menuUrl),
      minOrderPhp: getMinOrderPhp(slug) ?? getMinOrderPhp(r.menuUrl),
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
