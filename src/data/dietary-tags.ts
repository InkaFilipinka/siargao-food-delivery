/** Dietary tags for menu items. Used for filtering. */
export const DIETARY_OPTIONS = ["vegetarian", "vegan", "gluten-free", "halal", "spicy"] as const;
export type DietaryTag = (typeof DIETARY_OPTIONS)[number];

/** Map: "restaurantSlug|itemName" -> tags[] */
const itemTags = new Map<string, DietaryTag[]>([
  // Surf Cafe
  ["surf-cafe|Avocado Toast", ["vegetarian"]],
  ["surf-cafe|Banana Pancakes", ["vegetarian"]],
  // Island Bowl
  ["island-bowl|Acai Bowl", ["vegan", "gluten-free"]],
  ["island-bowl|Green Smoothie", ["vegan", "gluten-free"]],
  ["island-bowl|Overnight Oats", ["vegetarian", "vegan"]],
  // Lola's Kitchen
  ["lolas-kitchen|Adobo Rice", ["halal"]],
  ["lolas-kitchen|Sinigang na Baboy", ["spicy"]],
  ["lolas-kitchen|Pancit Canton", ["vegetarian"]],
  // Beach Burger
  ["beach-burger|Chicken Sandwich", ["halal"]],
  // Sunset Pizza
  ["sunset-pizza|Margherita (10\")", ["vegetarian"]],
  ["sunset-pizza|Hawaiian (10\")", ["halal"]],
  // Green Leaf
  ["green-leaf|Buddha Bowl", ["vegan", "gluten-free"]],
  ["green-leaf|Kale Salad", ["vegan", "vegetarian", "gluten-free"]],
  ["green-leaf|Vegan Wrap", ["vegan", "vegetarian"]],
  // Tropical Organics
  ["tropical-organics|Mixed Salad Greens", ["vegan", "vegetarian", "gluten-free"]],
  ["tropical-organics|Fresh Fruit Basket", ["vegan", "gluten-free"]],
  ["tropical-organics|Organic Eggs 12pc", ["vegetarian", "gluten-free"]],
  // Tropical Smoothie Bar
  ["tropical-smoothie-bar|Mango Smoothie", ["vegan", "gluten-free"]],
  ["tropical-smoothie-bar|Green Detox", ["vegan", "gluten-free"]],
  ["tropical-smoothie-bar|Tropical Blend", ["vegan", "gluten-free"]],
  // Pasta Paradise
  ["pasta-paradise|Penne Arrabiata", ["vegetarian", "spicy"]],
]);

export function getItemDietaryTags(restaurantSlug: string, itemName: string): DietaryTag[] {
  const key = `${restaurantSlug}|${itemName}`;
  return itemTags.get(key) ?? [];
}
