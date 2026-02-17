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

### Phase 2 migration (restaurant portal, drivers, cash ledger)

For restaurant accept/reject, item 86 toggles, driver cash handling, and cash ledger:

1. Run `supabase/schema.sql` (or existing migrations)
2. Run `supabase/migrations/002_restaurant_driver_cash.sql` in the Supabase SQL Editor

This adds: `order_restaurant_status`, `drivers`, `item_availability`, and cash fields on orders.

3. Run `supabase/migrations/003_updated_by.sql` to add `updated_by` (tracks whether staff or driver last updated an order).
4. Run `supabase/migrations/004_payment_methods.sql` to add `payment_method` and `payment_status` on orders.

### EmailJS (customer receipt)

When a customer provides an optional email at checkout, they receive an order receipt via EmailJS (same as scooters). Add to `.env.local`:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Create an EmailJS template with variables: `to_email`, `customer_name`, `order_id`, `items`, `subtotal`, `delivery_fee`, `tip`, `priority_fee`, `total`, `landmark`, `address`, `time_window`.

### Payment methods

The app supports: **Cash on delivery**, **Card (Stripe)**, **GCash (PayMongo)**, **Crypto (USDC/BUSD)**, and **PayPal**.

- **Cash on delivery**: Geolocation required (set location on map). Order is confirmed by restaurant or staff via call to customer.
- **Card**: Stripe Checkout. Add `STRIPE_SECRET_KEY` to `.env.local`.
- **GCash**: PayMongo. Add `PAYMONGO_SECRET_KEY` to `.env.local`.
- **Crypto**: MetaMask, Trust Wallet, WalletConnect. Add `NEXT_PUBLIC_METAMASK_WALLET_ADDRESS` (recipient), optional `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, optional `NEXT_PUBLIC_USDC_FEE_PERCENTAGE` (default 6).
- **PayPal**: Add `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`. Uses sandbox in dev, production in prod.

Set `NEXT_PUBLIC_BASE_URL` for payment redirect URLs (e.g. `https://yoursite.com`).

### ntfy notifications (per-restaurant)

When an order is placed, each restaurant gets a push notification on their ntfy topic (same pattern as Palm Riders scooter). Default topic: `siargao-{restaurant-slug}` (e.g. `siargao-sanabowl`). Restaurants subscribe via the ntfy app or web.

Override topics in `src/config/restaurant-extras.ts`. Optional env: `NTFY_BASE_URL` for self-hosted ntfy.

### Staff & portals

- **Staff** (`/staff/orders`): List orders, update status, dispatch board (kanban). Requires `STAFF_TOKEN` in `.env.local` when set.
- **Restaurant portal** (`/restaurant-portal`): Accept/reject orders with prep time (5/10/20/30/45 min), toggle item availability (86).
- **Driver portal** (`/driver`): View assigned orders, "Arrived at hub", cash received/turned in, Open in Google Maps, tips today.
- **Admin** (`/admin`): Dashboard, restaurants, support search (phone/order ID), cash ledger.

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
