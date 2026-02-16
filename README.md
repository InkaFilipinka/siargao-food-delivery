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
```

### Tech stack

- Next.js 15 + TypeScript
- Tailwind CSS
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
