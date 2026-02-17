/**
 * Mockup restaurants for testing – demand-moment structure
 * Replace with real partner data at launch.
 */
export interface Restaurant {
  name: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuUrl: string;
}

export const restaurantData = {
  tagline: "Food delivery to your door",
  description:
    "Food delivery in General Luna, Siargao. Order from restaurants, groceries & booze. Mockup data for testing.",
  categories: [
    "All",
    "Breakfast & Coffee",
    "Healthy & Vegan",
    "Local Favorites",
    "Cheap Eats",
    "Late Night",
    "Alcohol & Drinks",
    "Groceries",
    "Trending Now",
  ],
  cravingCategories: [
    "Breakfast & Coffee",
    "Healthy & Vegan",
    "Local Favorites",
    "Cheap Eats",
    "Late Night",
    "Alcohol & Drinks",
    "Groceries",
    "Trending Now",
  ],
  restaurants: [
    {
      name: "Surf Cafe",
      categories: ["Breakfast & Coffee", "Cheap Eats"],
      priceRange: "$$",
      tags: ["Coffee", "Pastries"],
      menuUrl: "https://siargaodelivery.com/surf-cafe/",
    },
    {
      name: "Island Bowl",
      categories: ["Breakfast & Coffee", "Healthy & Vegan"],
      priceRange: "$$",
      tags: ["Bowls", "Acai"],
      menuUrl: "https://siargaodelivery.com/island-bowl/",
    },
    {
      name: "Lola's Kitchen",
      categories: ["Local Favorites", "Cheap Eats"],
      priceRange: "$",
      tags: ["Filipino", "Comfort"],
      menuUrl: "https://siargaodelivery.com/lolas-kitchen/",
    },
    {
      name: "Beach Burger",
      categories: ["Cheap Eats", "Late Night"],
      priceRange: "$",
      tags: ["Burgers", "Fries"],
      menuUrl: "https://siargaodelivery.com/beach-burger/",
    },
    {
      name: "Sunset Pizza",
      categories: ["Late Night", "Trending Now"],
      priceRange: "$$",
      tags: ["Pizza", "Italian"],
      menuUrl: "https://siargaodelivery.com/sunset-pizza/",
    },
    {
      name: "Island Liquor",
      categories: ["Alcohol & Drinks", "Late Night"],
      priceRange: "$$",
      tags: ["Beer", "Spirits"],
      menuUrl: "https://siargaodelivery.com/island-liquor/",
    },
    {
      name: "General Luna Mart",
      categories: ["Groceries"],
      priceRange: "$",
      tags: ["Convenience", "Snacks"],
      menuUrl: "https://siargaodelivery.com/general-luna-mart/",
    },
    {
      name: "Tropical Organics",
      categories: ["Groceries", "Healthy & Vegan"],
      priceRange: "$$",
      tags: ["Organic", "Produce"],
      menuUrl: "https://siargaodelivery.com/tropical-organics/",
    },
  ] as Restaurant[],
};
