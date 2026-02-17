# Siargao Food Delivery

Food delivery website for General Luna, Siargao Island — groceries and restaurants.

Based on the structure of the Palm Riders scooter rental site: Next.js, map picker, Stripe/crypto, ntfy, EmailJS.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local`:

```env
# Required for map picker (delivery location)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: persist orders to database (copy from .env.example)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Backend (order persistence)

Orders can be stored in Supabase:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

Without Supabase, orders still work: the app creates an order ID and opens WhatsApp with a pre-filled message. Staff confirm via WhatsApp.

### ntfy notifications (per-restaurant)

When an order is placed, each restaurant gets a push notification on their ntfy topic (same pattern as Palm Riders scooter). Default topic: `siargao-{restaurant-slug}` (e.g. `siargao-sanabowl`). Restaurants subscribe via the ntfy app or web.

Override topics in `src/config/restaurant-extras.ts`. Optional env: `NTFY_BASE_URL` for self-hosted ntfy.

### Tech stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Zustand (cart state)
- Supabase (optional order DB)
- Google Maps (location picker)
- Restaurant data from siargaodelivery.com

### Menu scraper (extract prices/items from menu images)

To scrape menu items (names + prices) from siargaodelivery.com:

```bash
cd scripts && npm install && cd ..
# HTML-only (fast): extracts text from pages (e.g. Kermit wine list)
SKIP_OCR=1 node scripts/scrape-menus.mjs

# With OCR: extracts from menu images (first 15 restaurants)
OCR_RESTAURANT_LIMIT=15 node scripts/scrape-menus.mjs

# Full OCR on all restaurants with images (~15 min)
node scripts/scrape-menus.mjs
```

Output: `src/data/menu-items.json`

## Repo

- GitHub username: **InkaFilipinka**
- After creating the repo on GitHub, run:

```bash
cd /Users/user/Documents/siargao-food-delivery
git remote add origin https://github.com/InkaFilipinka/siargao-food-delivery.git
git branch -M main
git push -u origin main
```
