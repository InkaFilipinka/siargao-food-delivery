import { restaurantData } from "./restaurants";
import menuItemsData from "./menu-items.json";
import { getRestaurantHours, getMinOrderPhp } from "@/config/restaurant-extras";

export interface MenuItem {
  name: string;
  price: string;
}

export interface RestaurantWithMenu {
  name: string;
  slug: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuUrl: string;
  menuItems: MenuItem[];
  imageUrls: string[];
  featuredImage: string | null;
  hours?: string | null;
  minOrderPhp?: number | null;
}

const menuByRestaurant = new Map(
  menuItemsData.restaurants.map((r) => [r.name, r.menuItems || []])
);

const imagesByRestaurant = new Map(
  menuItemsData.restaurants.map((r) => [r.name, r.imageUrls || []])
);

export function getSlugFromMenuUrl(menuUrl: string): string {
  const match = menuUrl.match(/siargaodelivery\.com\/([^/]+)\/?$/);
  return match ? match[1] : menuUrl;
}

export const combinedRestaurants: RestaurantWithMenu[] = restaurantData.restaurants.map((r) => {
  const slug = getSlugFromMenuUrl(r.menuUrl);
  const menuItems = menuByRestaurant.get(r.name) || [];
  const imageUrls = imagesByRestaurant.get(r.name) || [];
  const featuredImage = imageUrls.length > 0 ? imageUrls[0] : null;
  return {
    ...r,
    slug,
    menuItems,
    imageUrls,
    featuredImage,
    hours: getRestaurantHours(slug) || getRestaurantHours(r.menuUrl),
    minOrderPhp: getMinOrderPhp(slug) ?? getMinOrderPhp(r.menuUrl),
  } as RestaurantWithMenu;
});

export const categories = restaurantData.categories;
export const cravingCategories = restaurantData.cravingCategories;
export const tagline = restaurantData.tagline;
export const description = restaurantData.description;

export function getRestaurantBySlug(slug: string): RestaurantWithMenu | undefined {
  return combinedRestaurants.find((r) => r.slug === slug);
}

/** True if venue is a grocery (categories include "Groceries"). Used for max 1 restaurant + 1 grocery per order. */
export function getIsGroceryBySlug(slug: string): boolean {
  const r = combinedRestaurants.find((r) => r.slug === slug);
  return r?.categories?.includes("Groceries") ?? false;
}

export const slugToIsGrocery = new Map(
  combinedRestaurants.map((r) => [r.slug, r.categories?.includes("Groceries") ?? false])
);

export function getRestaurantsByCategory(category: string): RestaurantWithMenu[] {
  if (category === "All") return combinedRestaurants;
  return combinedRestaurants.filter((r) => r.categories.includes(category));
}

const slugByRestaurantName = new Map(combinedRestaurants.map((r) => [r.name, r.slug]));

export function getSlugByRestaurantName(name: string): string | undefined {
  return slugByRestaurantName.get(name);
}
