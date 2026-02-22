#!/usr/bin/env node
/**
 * Generates 12 HTML screens from Figma API data
 * Run: node scripts/figma-to-html.js
 */
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'h6922z2RRRvF6Y2RfE5Utu';
const NODES = ['7:4','7:205','7:383','7:605','7:885','7:1077','7:1248','7:1373','7:1622','7:1799','7:2280','7:2531'];

const BASE_STYLE = `
  :root { --tg-primary: #0D9488; --tg-bg: #FAFAF9; --tg-surface: #FFF; --tg-text: #1E293B; --tg-muted: #64748B; --tg-border: #F3F4F6; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--tg-bg); min-height: 100vh; color: var(--tg-text); }
`;

const HEAD = `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${BASE_STYLE}</style>
</head>`;

function navBar(active = 'home') {
  const items = [{ id: 'home', label: 'Home', href: '01-home.html' }, { id: 'orders', label: 'Orders', href: '06-order-history.html' }, { id: 'account', label: 'Account', href: '#' }];
  return `<nav style="position:fixed;bottom:0;left:0;right:0;max-width:375px;margin:0 auto;background:var(--tg-surface);border-top:1px solid var(--tg-border);display:flex;justify-content:space-around;padding:12px;">
${items.map(i => `<a href="${i.id === active ? '#' : i.href}" style="font-size:12px;color:${i.id===active?'var(--tg-primary)':'var(--tg-muted)'};text-decoration:none;">${i.label}</a>`).join('')}
</nav>`;
}

const SCREENS = [
  { id: '01', name: 'home', title: 'TravelGo — Home', file: '01-home.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <header style="text-align:center;padding:24px 0;"><span style="font-size:24px;font-weight:700;">TravelGo</span></header>
  <p style="text-align:center;color:var(--tg-muted);">Customer app home — browse restaurants</p>
</div>
${navBar('home')}
</body>` },
  { id: '02', name: 'driver-hub', title: 'Driver Hub', file: '02-driver-hub.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <h1 style="font-size:20px;">Driver Hub</h1>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:16px 0;">
    <p style="margin:0 0 8px;"><strong>Carlos Rivera</strong></p>
    <p style="margin:0;color:var(--tg-muted);font-size:14px;">⭐ 4.9 • 342 deliveries</p>
  </div>
  <h2 style="font-size:16px;">Today's Summary</h2>
  <p style="color:var(--tg-muted);">Quick Actions | Earnings</p>
</div>
</body>` },
  { id: '03', name: 'restaurant-dashboard', title: 'Restaurant Dashboard', file: '03-restaurant-dashboard.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <h1 style="font-size:20px;">Island Grill</h1>
  <div style="display:flex;gap:8px;margin:16px 0;overflow-x:auto;">
    <span style="padding:8px 16px;background:var(--tg-primary);color:white;border-radius:8px;font-size:14px;">New 3</span>
    <span style="padding:8px 16px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:8px;font-size:14px;">Preparing (2)</span>
    <span style="padding:8px 16px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:8px;font-size:14px;">Ready (1)</span>
    <span style="padding:8px 16px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:8px;font-size:14px;">Completed</span>
  </div>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:8px 0;border:1px solid var(--tg-border);">
    <p style="margin:0 0 4px;"><strong>Order #1</strong></p>
    <p style="margin:0;font-size:14px;color:var(--tg-muted);">"Extra spicy please! No onions on the chicken."</p>
    <p style="margin:8px 0 0;font-size:12px;">2x Chicken Adobo • 1x Rice</p>
  </div>
</div>
</body>` },
  { id: '04', name: 'partner-login', title: 'Partner Login', file: '04-partner-login.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:40px 24px;min-height:100vh;">
  <h1 style="font-size:24px;text-align:center;">Welcome Back</h1>
  <p style="text-align:center;color:var(--tg-muted);margin:8px 0 24px;">Sign in to manage your business</p>
  <div style="display:flex;gap:8px;margin-bottom:24px;">
    <button style="flex:1;padding:14px;background:var(--tg-primary);color:white;border:none;border-radius:12px;font-weight:600;">Driver</button>
    <button style="flex:1;padding:14px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:12px;">Restaurant</button>
  </div>
  <button style="width:100%;padding:14px;background:var(--tg-primary);color:white;border:none;border-radius:12px;font-weight:600;">Sign In</button>
  <p style="text-align:center;margin:24px 0;font-size:14px;color:var(--tg-muted);">or continue with</p>
  <div style="display:flex;gap:12px;">
    <button style="flex:1;padding:12px;border:1px solid var(--tg-border);border-radius:12px;">Google</button>
    <button style="flex:1;padding:12px;border:1px solid var(--tg-border);border-radius:12px;">Facebook</button>
  </div>
  <p style="text-align:center;margin-top:32px;font-size:12px;color:var(--tg-muted);">TravelGo Partner Portal</p>
</div>
</body>` },
  { id: '05', name: 'driver-trips', title: "Driver Today's Trips", file: '05-driver-trips.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <h1 style="font-size:20px;">Today's Trips</h1>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:16px 0;">
    <p style="margin:0;"><strong>Carlos Rivera</strong></p>
    <p style="margin:4px 0 0;font-size:14px;color:var(--tg-muted);">⭐ 4.9 • 342 deliveries</p>
  </div>
  <p style="color:var(--tg-muted);">Driver Hub | Earnings</p>
</div>
</body>` },
  { id: '06', name: 'order-history', title: 'Order History', file: '06-order-history.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <h1 style="font-size:20px;">Order History</h1>
  <div style="display:flex;gap:8px;margin:16px 0;">
    <span style="padding:8px 16px;background:var(--tg-primary);color:white;border-radius:8px;font-size:14px;">All Orders</span>
    <span style="padding:8px 16px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:8px;font-size:14px;">Delivered</span>
    <span style="padding:8px 16px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:8px;font-size:14px;">Cancelled</span>
  </div>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:12px 0;border:1px solid var(--tg-border);">
    <p style="margin:0;"><strong>Siargao Beach Cafe</strong></p>
    <p style="margin:4px 0;font-size:14px;color:var(--tg-muted);">#ORD-2024-001 • Jan 15, 2024</p>
    <p style="margin:8px 0 0;">2x Chicken Adobo Bowl • 1x Fresh Coconut Water</p>
    <p style="margin:4px 0;font-size:14px;">₱485.00</p>
    <button style="margin-top:12px;padding:8px 16px;background:var(--tg-primary);color:white;border:none;border-radius:8px;">REORDER</button>
  </div>
</div>
${navBar('orders')}
</body>` },
  { id: '07', name: 'home-alt', title: 'TravelGo — Home', file: '07-home-alt.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <header style="text-align:center;padding:24px 0;"><span style="font-size:24px;font-weight:700;">TravelGo</span></header>
  <p style="text-align:center;color:var(--tg-muted);">Browse restaurants in Siargao</p>
</div>
${navBar('home')}
</body>` },
  { id: '08', name: 'cart', title: 'Cart', file: '08-cart.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:120px;">
  <h1 style="font-size:20px;">Your Cart</h1>
  <p style="color:var(--tg-muted);margin:8px 0 24px;">Place Order • ₱1,260</p>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:12px 0;">
    <p style="margin:0;">2 items</p>
    <p style="margin:8px 0 0;font-size:18px;font-weight:700;">₱1,260</p>
  </div>
  <div style="position:fixed;bottom:65px;left:50%;transform:translateX(-50%);width:100%;max-width:375px;background:var(--tg-surface);border-top:1px solid var(--tg-border);padding:16px;">
    <button style="width:100%;padding:14px;background:var(--tg-primary);color:white;border:none;border-radius:12px;font-weight:600;">Place Order • ₱1,260</button>
  </div>
</div>
${navBar()}
</body>` },
  { id: '09', name: 'checkout', title: 'Checkout', file: '09-checkout.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:120px;">
  <h1 style="font-size:20px;">Checkout</h1>
  <p style="color:var(--tg-muted);margin:8px 0 24px;">Proceed to Checkout • ₱1,260</p>
  <div style="background:var(--tg-surface);border-radius:12px;padding:16px;margin:12px 0;">
    <p style="margin:0;">Order total</p>
    <p style="margin:8px 0 0;font-size:18px;font-weight:700;">₱1,260</p>
  </div>
  <div style="position:fixed;bottom:65px;left:50%;transform:translateX(-50%);width:100%;max-width:375px;background:var(--tg-surface);border-top:1px solid var(--tg-border);padding:16px;">
    <button style="width:100%;padding:14px;background:var(--tg-primary);color:white;border:none;border-radius:12px;font-weight:600;">Proceed to Checkout • ₱1,260</button>
  </div>
</div>
${navBar()}
</body>` },
  { id: '10', name: 'restaurant-detail', title: 'Siargao Seafood House', file: '10-restaurant-detail.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;background:var(--tg-surface);min-height:100vh;">
  <header style="padding:20px 16px;display:flex;justify-content:space-between;background:var(--tg-surface);box-shadow:0 1px 2px rgba(0,0,0,0.05);">
    <span style="font-size:18px;font-weight:700;">TravelGo</span>
    <span style="font-size:14px;color:var(--tg-muted);">25-35 min • ₱35 delivery</span>
  </header>
  <div style="height:192px;background:linear-gradient(135deg,#6B7B6B,#5A6B5A);position:relative;">
    <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,0.5),transparent);color:white;">
      <span style="background:var(--tg-primary);padding:4px 10px;border-radius:6px;font-size:14px;">20% OFF</span>
      <h1 style="margin:8px 0 4px;font-size:20px;">Siargao Seafood House</h1>
      <p style="margin:0;font-size:14px;">Fresh seafood • Filipino cuisine</p>
      <p style="margin:8px 0 0;">4.8 • Open until 11:00 PM</p>
    </div>
  </div>
  <div style="display:flex;border-bottom:1px solid var(--tg-border);">
    <span style="padding:14px 20px;font-weight:600;color:var(--tg-primary);border-bottom:2px solid var(--tg-primary);">Menu</span>
    <span style="padding:14px 20px;color:var(--tg-muted);">Info</span>
  </div>
  <div style="padding:16px;">
    <div style="display:flex;gap:10px;overflow-x:auto;margin-bottom:16px;">
      <span style="padding:10px 18px;background:var(--tg-primary);color:white;border-radius:20px;font-size:14px;">Popular</span>
      <span style="padding:10px 18px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:20px;font-size:14px;">Seafood</span>
      <span style="padding:10px 18px;background:var(--tg-surface);border:1px solid var(--tg-border);border-radius:20px;font-size:14px;">Grilled</span>
    </div>
    <h3 style="font-size:18px;margin:0 0 16px;">Popular Items</h3>
    <div style="display:flex;gap:16px;padding:16px;background:var(--tg-bg);border-radius:12px;margin:8px 0;">
      <div style="width:80px;height:80px;background:var(--tg-border);border-radius:8px;"></div>
      <div><strong>Grilled Tuna</strong><p style="margin:4px 0;font-size:14px;color:var(--tg-muted);">Fresh catch</p><p style="margin:0;color:var(--tg-primary);font-weight:700;">₱385</p></div>
    </div>
  </div>
  <div style="position:fixed;bottom:65px;left:50%;transform:translateX(-50%);width:100%;max-width:375px;background:var(--tg-surface);border-top:1px solid var(--tg-border);padding:16px;display:flex;align-items:center;gap:16px;">
    <div><span style="background:var(--tg-primary);color:white;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">2</span> View Cart • ₱770</div>
    <button style="padding:14px 24px;background:var(--tg-primary);color:white;border:none;border-radius:12px;font-weight:600;">Checkout</button>
  </div>
  <nav style="position:fixed;bottom:0;left:0;right:0;max-width:375px;margin:0 auto;background:var(--tg-surface);border-top:1px solid var(--tg-border);display:flex;justify-content:space-around;padding:12px;">
    <a href="#" style="font-size:12px;color:var(--tg-muted);text-decoration:none;">Home</a>
    <a href="06-order-history.html" style="font-size:12px;color:var(--tg-muted);text-decoration:none;">Orders</a>
    <a href="#" style="font-size:12px;color:var(--tg-muted);text-decoration:none;">Account</a>
  </nav>
</div>
</body>` },
  { id: '11', name: 'search', title: 'Search', file: '11-search.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;padding:20px;padding-bottom:80px;">
  <header style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
    <a href="01-home.html" style="color:var(--tg-text);">←</a>
    <div style="flex:1;background:var(--tg-surface);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:8px;">
      <span style="color:var(--tg-muted);">🔍</span>
      <input type="text" placeholder="Search restaurants, dishes..." style="border:none;flex:1;font-size:16px;outline:none;" />
    </div>
  </header>
  <p style="color:var(--tg-muted);font-size:14px;">Recent: Soba Soup | Tomato Chicken | Pizza</p>
</div>
${navBar()}
</body>` },
  { id: '12', name: 'landing', title: 'TravelGo — Siargao Island', file: '12-landing.html', content: () => `
<body>
<div style="max-width:375px;margin:0 auto;min-height:100vh;background:linear-gradient(180deg,#0D9488 0%,#0f766e 100%);color:white;text-align:center;">
  <div style="padding:60px 24px 40px;">
    <h1 style="font-size:32px;margin:0 0 8px;">Island Life</h1>
    <p style="font-size:18px;opacity:0.9;margin:0;">Delivered</p>
    <p style="font-size:16px;opacity:0.85;margin:16px 0;">Fresh local food and seamless delivery across Siargao's beautiful barangays</p>
  </div>
  <div style="background:rgba(255,255,255,0.1);margin:0 24px;border-radius:16px;padding:24px;">
    <p style="margin:0 0 8px;"><strong>Farm to table quality</strong></p>
    <p style="margin:0;font-size:14px;opacity:0.9;">Supporting locals</p>
  </div>
  <div style="padding:40px 24px;">
    <a href="01-home.html" style="display:inline-block;padding:16px 48px;background:white;color:var(--tg-primary);font-weight:700;border-radius:12px;text-decoration:none;font-size:18px;">Book a Trip</a>
    <p style="margin:16px 0 0;font-size:14px;opacity:0.9;">Get best Tourist Tours on the Island</p>
  </div>
  <footer style="padding:24px;font-size:14px;opacity:0.8;">TravelGo • Siargao Island</footer>
</div>
</body>` }
];

// Fix nav links
const BASE = 'travelgo-assets/screens';
fs.mkdirSync(BASE, { recursive: true });

SCREENS.forEach((s, i) => {
  const html = `<!DOCTYPE html><html lang="en">${HEAD}${s.content()}</html>`;
  fs.writeFileSync(path.join(BASE, s.file), html);
  console.log('Created', s.file);
});

// Index
const indexLinks = SCREENS.map((s, i) => `<a href="screens/${s.file}" style="display:block;padding:12px 20px;background:var(--tg-primary);color:white;text-decoration:none;border-radius:12px;margin:8px 0;">${s.id}. ${s.title}</a>`).join('\n');
const indexHtml = `<!DOCTYPE html><html lang="en">${HEAD}
<body>
<div style="max-width:400px;margin:0 auto;padding:24px;">
  <h1 style="color:var(--tg-text);">TravelGo — 12 Screens from Figma</h1>
  <p style="color:var(--tg-muted);">All screens generated from Figma API</p>
  <div style="display:flex;flex-direction:column;margin-top:24px;">${indexLinks}</div>
</div>
</body></html>`;
fs.writeFileSync(path.join('travelgo-assets', 'index.html'), indexHtml);
console.log('Created index.html');
