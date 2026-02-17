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
    {
      name: "Coconut Kitchen",
      categories: ["Breakfast & Coffee", "Local Favorites"],
      priceRange: "$$",
      tags: ["Filipino", "Breakfast"],
      menuUrl: "https://siargaodelivery.com/coconut-kitchen/",
    },
    {
      name: "Wave Cafe",
      categories: ["Breakfast & Coffee", "Trending Now"],
      priceRange: "$$",
      tags: ["Coffee", "Brunch"],
      menuUrl: "https://siargaodelivery.com/wave-cafe/",
    },
    {
      name: "Green Leaf",
      categories: ["Healthy & Vegan", "Trending Now"],
      priceRange: "$$",
      tags: ["Vegan", "Salads"],
      menuUrl: "https://siargaodelivery.com/green-leaf/",
    },
    {
      name: "Sari-Sari Grill",
      categories: ["Local Favorites", "Cheap Eats"],
      priceRange: "$",
      tags: ["Filipino", "Grill"],
      menuUrl: "https://siargaodelivery.com/sari-sari-grill/",
    },
    {
      name: "Surf Shack",
      categories: ["Cheap Eats", "Late Night"],
      priceRange: "$",
      tags: ["Burgers", "Tacos"],
      menuUrl: "https://siargaodelivery.com/surf-shack/",
    },
    {
      name: "Pasta Paradise",
      categories: ["Trending Now", "Late Night"],
      priceRange: "$$",
      tags: ["Italian", "Pasta"],
      menuUrl: "https://siargaodelivery.com/pasta-paradise/",
    },
    {
      name: "Seaside Grill",
      categories: ["Local Favorites", "Trending Now"],
      priceRange: "$$$",
      tags: ["Seafood", "Grill"],
      menuUrl: "https://siargaodelivery.com/seaside-grill/",
    },
    {
      name: "Sunrise Bakery",
      categories: ["Breakfast & Coffee", "Groceries"],
      priceRange: "$",
      tags: ["Bread", "Pastries"],
      menuUrl: "https://siargaodelivery.com/sunrise-bakery/",
    },
    {
      name: "Island Brew",
      categories: ["Alcohol & Drinks", "Late Night"],
      priceRange: "$$",
      tags: ["Craft Beer", "Cocktails"],
      menuUrl: "https://siargaodelivery.com/island-brew/",
    },
    {
      name: "Fresh Mart",
      categories: ["Groceries"],
      priceRange: "$",
      tags: ["Convenience", "Essentials"],
      menuUrl: "https://siargaodelivery.com/fresh-mart/",
    },
    {
      name: "Tropical Smoothie Bar",
      categories: ["Healthy & Vegan", "Alcohol & Drinks"],
      priceRange: "$$",
      tags: ["Smoothies", "Juices"],
      menuUrl: "https://siargaodelivery.com/tropical-smoothie-bar/",
    },
  ] as Restaurant[],
};
