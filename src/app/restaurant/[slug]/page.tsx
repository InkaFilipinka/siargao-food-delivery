import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { combinedRestaurants } from "@/data/combined";
import { ArrowLeft, MapPin, MessageCircle, Phone, Clock, ShoppingBag } from "lucide-react";
import { thumbnailUrl } from "@/lib/image-url";
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/config/support";
import { RestaurantMenuWithAvailability } from "@/components/restaurant-menu-with-availability";

export const dynamic = "force-dynamic";

async function fetchRestaurant(slug: string) {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const res = await fetch(`${base}/api/restaurant/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export function generateStaticParams() {
  return combinedRestaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await fetchRestaurant(slug);
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
  const restaurant = await fetchRestaurant(slug);
  if (!restaurant) notFound();

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/#restaurants"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to browse
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {restaurant.featuredImage && (
            <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
              <img
                src={thumbnailUrl(restaurant.featuredImage, 800)}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {restaurant.categories.map((cat: string) => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
              {restaurant.hours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {restaurant.hours.replace("-", " – ")}
                </span>
              )}
              {restaurant.minOrderPhp != null && restaurant.minOrderPhp > 0 && (
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  Min order ₱{restaurant.minOrderPhp.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                General Luna, Siargao
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {restaurant.priceRange || "—"} • {restaurant.menuItems.length} items
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                Order via WhatsApp
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </div>
          </div>

          {restaurant.menuItems.length > 0 ? (
            <div className="border-t border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="font-semibold text-slate-900 dark:text-white">Menu</h2>
              </div>
              <RestaurantMenuWithAvailability restaurant={restaurant} />
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No menu items configured.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
