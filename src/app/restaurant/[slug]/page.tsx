import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurantBySlug, combinedRestaurants } from "@/data/combined";
import { ArrowLeft, ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import { MenuItemRow } from "@/components/menu-item-row";

export function generateStaticParams() {
  return combinedRestaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurant not found" };
  return {
    title: `${restaurant.name} | Siargao Delivery`,
    description: `Menu for ${restaurant.name}. Order delivery in General Luna, Siargao.`,
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <main className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/#restaurants"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All restaurants
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {restaurant.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
            {restaurant.tags.length > 0 && (
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {restaurant.tags.join(" • ")}
              </p>
            )}
            <p className="text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {restaurant.priceRange || "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={restaurant.menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-300"
            >
              <ExternalLink className="w-4 h-4" />
              View on Siargao Delivery
            </a>
            <a
              href="https://wa.me/639457014440"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Order via WhatsApp
            </a>
            <a
              href="tel:+639457014440"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-300"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6">
          <MapPin className="w-4 h-4" />
          General Luna, Siargao • {restaurant.menuItems.length} items on menu
        </div>

        {restaurant.imageUrls.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4">
            {restaurant.imageUrls.slice(0, 8).map((url, i) => (
              <div
                key={i}
                className="relative shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={url}
                  alt={`${restaurant.name} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {restaurant.menuItems.length > 0 ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-semibold text-slate-900 dark:text-white">Menu</h2>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {restaurant.menuItems.map((item, i) => (
                <MenuItemRow
                  key={i}
                  restaurantName={restaurant.name}
                  restaurantSlug={restaurant.slug}
                  itemName={item.name}
                  price={item.price}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Menu items not yet available. View the full menu on Siargao Delivery.
            </p>
            <a
              href={restaurant.menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-500 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              See menu on siargaodelivery.com
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
