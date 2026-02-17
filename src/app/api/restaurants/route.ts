import { restaurantData } from "@/data/restaurants";
import menuItemsData from "@/data/menu-items.json";
import { getRestaurantHours, getMinOrderPhp } from "@/config/restaurant-extras";

export function GET() {
  const menuByRestaurant = new Map(
    menuItemsData.restaurants.map((r: { name: string; menuItems?: { name: string; price: string }[] }) => [
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
