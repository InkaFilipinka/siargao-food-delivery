#!/usr/bin/env node
/**
 * Generates 12 HTML screens from Figma API data - Real DOM (buttons, links, layout)
 * Converts Figma node tree to HTML + inline CSS. Fetches images via Figma API.
 * Run: FIGMA_ACCESS_TOKEN=your_token node scripts/figma-to-html-v2.cjs
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env if present
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = (m[2] || '').replace(/^["']|["']$/g, '').trim();
    });
  }
} catch (_) {}

const TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'h6922z2RRRvF6Y2RfE5Utu';
const FRAME_IDS = ['7:4','7:205','7:383','7:605','7:885','7:1077','7:1248','7:1373','7:1622','7:1799','7:2280','7:2531'];

const SCREEN_NAMES = [
  { id: '01', file: '01-home.html', title: 'TravelGo — Home' },
  { id: '02', file: '02-driver-hub.html', title: 'Driver Hub' },
  { id: '03', file: '03-restaurant-dashboard.html', title: 'Restaurant Dashboard' },
  { id: '04', file: '04-partner-login.html', title: 'Partner Login' },
  { id: '05', file: '05-driver-trips.html', title: "Driver Today's Trips" },
  { id: '06', file: '06-order-history.html', title: 'Order History' },
  { id: '07', file: '07-home-alt.html', title: 'TravelGo — Home' },
  { id: '08', file: '08-cart.html', title: 'Cart' },
  { id: '09', file: '09-checkout.html', title: 'Checkout' },
  { id: '10', file: '10-restaurant-detail.html', title: 'Siargao Seafood House' },
  { id: '11', file: '11-search.html', title: 'Search' },
  { id: '12', file: '12-landing.html', title: 'TravelGo — Siargao Island' },
];

const BASE_STYLE = `
  :root { --tg-primary: #0D9488; --tg-bg: #FAFAF9; --tg-surface: #FFF; --tg-text: #1E293B; --tg-muted: #64748B; --tg-border: #E2E8F0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; background: var(--tg-bg); min-height: 100vh; color: var(--tg-text); }
  button { cursor: pointer; font-family: inherit; }
  button:focus, a:focus { outline: 2px solid var(--tg-primary); outline-offset: 2px; }
  a { -webkit-tap-highlight-color: transparent; }
`;

const HEAD = `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${BASE_STYLE}</style>
</head>`;

function fetchImageUrls(nodeIds) {
  if (!TOKEN || !nodeIds.length) return Promise.resolve({});
  return new Promise((resolve) => {
    const ids = nodeIds.join(',');
    const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`;
    https.get(url, { headers: { 'X-Figma-Token': TOKEN } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.err ? {} : (data.images || {}));
        } catch { resolve({}); }
      });
    }).on('error', () => resolve({}));
  });
}

/** Fetch full-frame screenshots (pixel-perfect) for all 12 frames */
function fetchFrameScreenshots() {
  if (!TOKEN) return Promise.resolve({});
  return fetchImageUrls(FRAME_IDS);
}

function extractText(node, list = []) {
  if (!node) return list;
  if (node.characters && node.characters.trim()) list.push(node.characters.trim());
  (node.children || []).forEach(c => extractText(c, list));
  return list;
}

function collectImageNodeIds(node, list = []) {
  if (!node) return list;
  const fills = [...(node.fills || []), ...(node.background || [])];
  if (fills.some(f => f?.imageRef || f?.imageHash)) list.push(node.id);
  (node.children || []).forEach(c => collectImageNodeIds(c, list));
  return list;
}

function rgb(fill) {
  if (!fill?.color) return null;
  const { r, g, b, a } = fill.color;
  const o = (a ?? 1);
  if (o >= 1) return `rgb(${Math.round((r||0)*255)},${Math.round((g||0)*255)},${Math.round((b||0)*255)})`;
  return `rgba(${Math.round((r||0)*255)},${Math.round((g||0)*255)},${Math.round((b||0)*255)},${o})`;
}

function getTag(node, parentChain) {
  const name = (node.name || '').toLowerCase();
  const type = node.type || '';
  if (type === 'TEXT') return 'span';
  // Nav items: use <a> for Home/Orders/Account when inside nav
  const inNav = parentChain.some(p => (p.name || '').toLowerCase() === 'nav');
  if (inNav && name === 'button') {
    const text = getFirstText(node);
    if (/^(home|orders|account)$/i.test(text)) return 'a';
  }
  if (name === 'button') return 'button';
  if (name === 'a' || name === 'link') return 'a';
  if (name === 'input') return 'input';
  if (name === 'img' || name === 'image') return 'img';
  if (name === 'nav') return 'nav';
  if (name === 'header') return 'header';
  if (name === 'main') return 'main';
  if (name === 'section') return 'section';
  if (name === 'footer') return 'footer';
  if (/^h[1-6]$/.test(name)) return name;
  return 'div';
}

function gradientCss(fill) {
  if (!fill || !fill.gradientStops?.length) return null;
  const stops = fill.gradientStops.map(s => {
    const c = s.color || fill.color;
    if (!c) return '';
    const col = `rgba(${Math.round((c.r||0)*255)},${Math.round((c.g||0)*255)},${Math.round((c.b||0)*255)},${c.a??1})`;
    return `${col} ${(s.position ?? 0) * 100}%`;
  }).filter(Boolean).join(', ');
  const handles = fill.gradientHandlePositions || [];
  if (fill.type === 'GRADIENT_LINEAR' && handles.length >= 2) {
    const dx = (handles[1].x - handles[0].x) * 100;
    const dy = (handles[1].y - handles[0].y) * 100;
    const angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI + 90);
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  return `linear-gradient(180deg, ${stops})`;
}

function getInlineStyles(node, parentBounds, imageUrls, isTextNode = false, opts = {}) {
  const parts = [];
  const b = node.absoluteBoundingBox;

  // Position relative to PARENT (so nested elements lay out correctly)
  if (b && parentBounds) {
    const left = b.x - parentBounds.x;
    const top = b.y - parentBounds.y;
    parts.push(`position:absolute`);
    parts.push(`left:${Math.round(left)}px`);
    parts.push(`top:${Math.round(top)}px`);
    parts.push(`width:${Math.round(b.width)}px`);
    parts.push(`height:${Math.round(b.height)}px`);
  }

  // Background / fill (skip for TEXT - they use color in getTextStyles)
  if (!isTextNode) {
  const fills = node.fills || [];
  const bg = (node.background || [])[0] || fills[0];
  if (bg?.type === 'IMAGE' && (bg.imageRef || bg.imageHash)) {
    const url = imageUrls[node.id];
    if (url) parts.push(`background-image:url(${url})`);
    else parts.push(`background:#E2E8F0`);
  } else if (bg?.type === 'GRADIENT_LINEAR' || bg?.type === 'GRADIENT') {
    const grad = gradientCss(bg);
    if (grad) parts.push(`background:${grad}`);
  } else if (bg?.type === 'SOLID') {
    const col = rgb(bg);
    const r = bg?.color ? Math.round((bg.color.r||0)*255) : 0;
    const g = bg?.color ? Math.round((bg.color.g||0)*255) : 0;
    const b = bg?.color ? Math.round((bg.color.b||0)*255) : 0;
    // Landing page: skip canvas gray so light background shows; keep white cards
    if (opts.isLanding && r >= 249 && r <= 251 && g >= 249 && b >= 247) { /* transparent */ }
    else if (col && (bg.opacity ?? 1) > 0) parts.push(`background:${col}`);
  }
  }

  // Corner radius
  if (node.cornerRadius) parts.push(`border-radius:${node.cornerRadius}px`);

  // Border (skip Figma dev-mode frame border: #CED4DA)
  if (node.strokes?.length) {
    const s = node.strokes[0];
    if (s?.type === 'SOLID') {
      const col = rgb(s);
      const r = s?.color ? Math.round((s.color.r || 0) * 255) : 0;
      const g = s?.color ? Math.round((s.color.g || 0) * 255) : 0;
      const b = s?.color ? Math.round((s.color.b || 0) * 255) : 0;
      if (!(r === 206 && g === 212 && b === 218)) parts.push(`border:${node.strokeWeight ?? 1}px solid ${col || '#ccc'}`);
    }
  }

  // Flex (for layout containers)
  if (node.layoutMode === 'VERTICAL') {
    parts.push(`display:flex`);
    parts.push(`flex-direction:column`);
    parts.push(`align-items:flex-start`);
  } else if (node.layoutMode === 'HORIZONTAL') {
    parts.push(`display:flex`);
    parts.push(`flex-direction:row`);
    parts.push(`align-items:flex-start`);
  }

  // Padding
  const p = node.paddingLeft ?? node.paddingTop;
  if (p != null) {
    const pl = node.paddingLeft ?? 0, pr = node.paddingRight ?? 0;
    const pt = node.paddingTop ?? 0, pb = node.paddingBottom ?? 0;
    if (pl || pr || pt || pb) parts.push(`padding:${pt}px ${pr}px ${pb}px ${pl}px`);
  }

  // Overflow
  if (node.clipsContent) parts.push(`overflow:hidden`);

  return parts.join(';');
}

function getTextStyles(node, opts = {}) {
  const s = node.style;
  if (!s) return '';
  const parts = [];
  if (s.fontSize) parts.push(`font-size:${s.fontSize}px`);
  if (s.fontWeight) parts.push(`font-weight:${s.fontWeight}`);
  if (s.fontFamily) parts.push(`font-family:${s.fontFamily},sans-serif`);
  if (s.textAlignHorizontal === 'CENTER') parts.push('text-align:center');
  else if (s.textAlignHorizontal === 'RIGHT') parts.push('text-align:right');
  if (s.letterSpacing != null) parts.push(`letter-spacing:${s.letterSpacing}px`);
  if (s.lineHeightPx) parts.push(`line-height:${s.lineHeightPx}px`);
  const fill = (node.fills || [])[0];
  let col = fill?.type === 'SOLID' ? rgb(fill) : null;
  // No hero override - landing uses light bg, keep original text colors
  if (col) parts.push(`color:${col}`);
  return parts.join(';');
}

function getFirstText(node) {
  if (node?.characters) return node.characters.trim();
  for (const c of node?.children || []) {
    const t = getFirstText(c);
    if (t) return t;
  }
  return '';
}

function getNavHref(node, parentChain, screenIdx) {
  const inNav = parentChain.some(p => (p.name || '').toLowerCase() === 'nav');
  if (!inNav) return null;
  const text = (node.characters || getFirstText(node) || '').toLowerCase().trim();
  if (text === 'home') return '01-home.html';
  if (text === 'orders') return '06-order-history.html';
  if (text === 'account') return '#';
  return null;
}

function nodeToHtml(node, parentBounds, imageUrls, depth, parentChain, screenIdx) {
  if (!node) return '';
  const fill = (node.fills || [])[0];
  const bgFill = (node.background || [])[0];
  const op = fill?.color?.a ?? bgFill?.color?.a ?? 1;
  if (op === 0 && !node.children?.length) return '';

  const tag = getTag(node, parentChain);
  const isText = node.type === 'TEXT';
  const isButton = tag === 'button';
  const isLink = tag === 'a';
  const isImg = tag === 'img';

  let html = '';
  const style = getInlineStyles(node, parentBounds, imageUrls, isText, { isLanding: screenIdx === 11 });
  const heroArea = screenIdx === 11 && node.absoluteBoundingBox && node.absoluteBoundingBox.y < 600;
  const textStyle = isText ? getTextStyles(node, { isLanding: screenIdx === 11, heroSection: heroArea }) : '';
  const combinedStyle = [style, textStyle].filter(Boolean).join(';');

  if (isText) {
    const content = escapeHtml(node.characters || '');
    return `<span style="${combinedStyle}">${content}</span>`;
  }

  if (isImg) {
    const url = imageUrls[node.id];
    if (url) return `<img src="${url}" alt="" style="${style}" role="presentation" />`;
    return `<div style="${style};background:#E2E8F0" role="img" aria-label="Image"></div>`;
  }

  const children = (node.children || [])
    .map(c => nodeToHtml(c, node.absoluteBoundingBox || parentBounds, imageUrls, depth + 1, [...parentChain, node], screenIdx))
    .filter(Boolean)
    .join('');

  let attrs = `style="${combinedStyle}"`;
  if (isButton && !isLink) attrs += ' type="button"';
  if (isLink) {
    const href = getNavHref(node, parentChain, screenIdx);
    if (href) attrs += ` href="${href}"`;
    else attrs += ' href="#"';
  }

  if (node.children?.length && !children && !isButton && !isLink) return ''; // empty container, skip

  const selfClosing = isImg;
  if (selfClosing) return `<${tag} ${attrs} />`;

  return `<${tag} ${attrs}>${children}</${tag}>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function navHtml(screenIdx) {
  const homeIdxs = [0, 6];
  const ordersIdxs = [5, 7, 8];
  const homeClr = homeIdxs.includes(screenIdx) ? 'var(--tg-primary)' : 'var(--tg-muted)';
  const ordersClr = ordersIdxs.includes(screenIdx) ? 'var(--tg-primary)' : 'var(--tg-muted)';
  return `
<nav style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:375px;background:var(--tg-surface);border-top:1px solid var(--tg-border);display:flex;justify-content:space-around;align-items:center;height:56px;padding:0 16px;">
<a href="01-home.html" style="font-size:12px;color:${homeClr};text-decoration:none;">Home</a>
<a href="06-order-history.html" style="font-size:12px;color:${ordersClr};text-decoration:none;">Orders</a>
<a href="#" style="font-size:12px;color:var(--tg-muted);text-decoration:none;">Account</a>
</nav>`;
}

async function main() {
  const figmaPath = path.join('travelgo-assets', 'figma-all-nodes.json');
  if (!fs.existsSync(figmaPath)) {
    console.error('Missing travelgo-assets/figma-all-nodes.json');
    process.exit(1);
  }

  const figma = JSON.parse(fs.readFileSync(figmaPath, 'utf8'));
  const nodes = figma.nodes || figma;

  // 1. Fetch full-frame screenshots (pixel-perfect) - this is what looked correct
  let frameScreenshots = {};
  if (TOKEN) {
    frameScreenshots = await fetchFrameScreenshots();
    if (Object.keys(frameScreenshots).length) {
      console.log('Fetched', Object.keys(frameScreenshots).length, 'screenshots');
    }
  }

  const BASE = path.join('travelgo-assets', 'screens');
  fs.mkdirSync(BASE, { recursive: true });

  const LANDING_IDX = 11; // 12-landing.html - we iterate on DOM parser for this one

  SCREEN_NAMES.forEach((screen, i) => {
    const frameId = FRAME_IDS[i];
    const doc = nodes[frameId]?.document || nodes[frameId];
    const screenshotUrl = frameScreenshots[frameId];
    const texts = extractText(doc, []);

    const useDomForLanding = i === LANDING_IDX;
    let body;

    if (useDomForLanding) {
      // Landing page: always use DOM parser - match 1-to-1 design (white/light bg, teal accents)
      const frameBounds = doc?.absoluteBoundingBox || { x: 0, y: 0, width: 375, height: 840 };
      const content = nodeToHtml(doc, frameBounds, {}, 0, [], i);
      const frameH = Math.round(frameBounds.height || 840);
      const pageBg = 'background:#FAFAF9;'; // Light grey like 1-to-1, not full teal
      body = `
<body>
<div style="max-width:375px;margin:0 auto;position:relative;min-height:100vh;${pageBg}">
  <div style="position:relative;width:${Math.round(frameBounds.width)}px;height:${frameH}px;padding-bottom:80px;">
    ${content}
  </div>
</div>
${navHtml(i)}
</body>`;
    } else if (screenshotUrl) {
      body = `
<body>
<div style="max-width:375px;margin:0 auto;padding:0;background:var(--tg-surface);">
  <img src="${screenshotUrl}" alt="${screen.title}" style="width:100%;height:auto;display:block;vertical-align:top;" />
  <details style="padding:16px;border-top:1px solid var(--tg-border);margin-top:0;">
    <summary style="cursor:pointer;color:var(--tg-muted);font-size:14px;">Extracted text</summary>
    <ul style="margin:12px 0 0;padding-left:20px;font-size:14px;">
      ${texts.map(t => `<li>${escapeHtml(t)}</li>`).join('\n      ')}
    </ul>
  </details>
</div>
${navHtml(i)}
</body>`;
    } else {
      const frameBounds = doc?.absoluteBoundingBox || { x: 0, y: 0, width: 375, height: 840 };
      const content = nodeToHtml(doc, frameBounds, {}, 0, [], i);
      const frameH = Math.round(frameBounds.height || 840);
      body = `
<body>
<div style="max-width:375px;margin:0 auto;position:relative;min-height:100vh;background:var(--tg-surface);">
  <div style="position:relative;width:${Math.round(frameBounds.width)}px;height:${frameH}px;padding-bottom:80px;">
    ${content}
  </div>
</div>
${navHtml(i)}
</body>`;
    }

    const html = `<!DOCTYPE html><html lang="en">${HEAD}${body}</html>`;
    fs.writeFileSync(path.join(BASE, screen.file), html);
    const mode = useDomForLanding ? 'DOM (landing)' : screenshotUrl ? 'screenshot' : 'DOM fallback';
    console.log('Created', screen.file, '(' + mode + ')');
  });

  // Index page
  const indexLinks = SCREEN_NAMES.map(s =>
    `<a href="screens/${s.file}" style="display:block;padding:12px 20px;background:var(--tg-primary);color:white;text-decoration:none;border-radius:12px;margin:8px 0;">${s.id}. ${s.title}</a>`
  ).join('\n  ');

  const indexHtml = `<!DOCTYPE html><html lang="en">${HEAD}
<body>
<div style="max-width:400px;margin:0 auto;padding:24px;">
  <h1 style="color:var(--tg-text);">TravelGo — 12 Screens from Figma</h1>
  <p style="color:var(--tg-muted);">Pixel-perfect screenshots from Figma API</p>
  <div style="display:flex;flex-direction:column;margin-top:24px;">${indexLinks}</div>
</div>
</body></html>`;

  fs.writeFileSync(path.join('travelgo-assets', 'index.html'), indexHtml);
  console.log('Created index.html');
}

main().catch(e => { console.error(e); process.exit(1); });
