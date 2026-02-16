#!/usr/bin/env node
/**
 * Scrapes menu data from siargaodelivery.com
 * - Extracts text menu items from HTML (some restaurants have prices in HTML)
 * - Downloads menu images and runs OCR for image-based menus
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Restaurant list - from restaurants.ts
const RESTAURANTS = [
  { name: "Sanabowl", menuUrl: "https://siargaodelivery.com/sanabowl/" },
  { name: "Secret grill & BBQ", menuUrl: "https://siargaodelivery.com/secret-bbq/" },
  { name: "Bayani - Harana", menuUrl: "https://siargaodelivery.com/bayani-harana/" },
  { name: "CFC (Catangnan Fried Chicken)", menuUrl: "https://siargaodelivery.com/cfc/" },
  { name: "Brads Inasal", menuUrl: "https://siargaodelivery.com/brads-inasal/" },
  { name: "Weekend Cafe", menuUrl: "https://siargaodelivery.com/weekend-cafe/" },
  { name: "Tropical Temple", menuUrl: "https://siargaodelivery.com/tropical-temple/" },
  { name: "El Chapo", menuUrl: "https://siargaodelivery.com/el-chapo/" },
  { name: "Goodies", menuUrl: "https://siargaodelivery.com/goodies/" },
  { name: "Happiness", menuUrl: "https://siargaodelivery.com/happiness/" },
  { name: "Lechon Manok", menuUrl: "https://siargaodelivery.com/lechon-manok/" },
  { name: "Island Deli", menuUrl: "https://siargaodelivery.com/island-deli/" },
  { name: "Food Lab", menuUrl: "https://siargaodelivery.com/food-lab/" },
  { name: "Tiki Hut", menuUrl: "https://siargaodelivery.com/tiki-hut/" },
  { name: "MASALA", menuUrl: "https://siargaodelivery.com/masala/" },
  { name: "Isla Panciteria Siargao", menuUrl: "https://siargaodelivery.com/isla-panciteria-siargao/" },
  { name: "Doner Shawarma Kebabs", menuUrl: "https://siargaodelivery.com/doner-shawarma-kebabs/" },
  { name: "Thai-Foon", menuUrl: "https://siargaodelivery.com/thai-foon/" },
  { name: "Tradicion", menuUrl: "https://siargaodelivery.com/tradicion/" },
  { name: "Ver De Siargao", menuUrl: "https://siargaodelivery.com/verde/" },
  { name: "The Hub by Lokal Lab", menuUrl: "https://siargaodelivery.com/hub/" },
  { name: "Noods", menuUrl: "https://siargaodelivery.com/noods/" },
  { name: "Fin&Fin", menuUrl: "https://siargaodelivery.com/finandfin/" },
  { name: "Spotted Pig", menuUrl: "https://siargaodelivery.com/spotted-pig/" },
  { name: "Kimstaurant", menuUrl: "https://siargaodelivery.com/kimstaurant/" },
  { name: "JTs Manukan Grille", menuUrl: "https://siargaodelivery.com/jts/" },
  { name: "Bravo", menuUrl: "https://siargaodelivery.com/bravo/" },
  { name: "Dao Chow", menuUrl: "https://siargaodelivery.com/dao-chow/" },
  { name: "X-Pizza", menuUrl: "https://siargaodelivery.com/x-pizza/" },
  { name: "Good Cup", menuUrl: "https://siargaodelivery.com/good-cup/" },
  { name: "Kanin Baboy", menuUrl: "https://siargaodelivery.com/kanin-baboy/" },
  { name: "Kermit", menuUrl: "https://siargaodelivery.com/kermit/" },
  { name: "Yogi", menuUrl: "https://siargaodelivery.com/yogi/" },
  { name: "Matahari", menuUrl: "https://siargaodelivery.com/matahari/" },
  { name: "Cafe Lunares", menuUrl: "https://siargaodelivery.com/cafe-lunares/" },
  { name: "Masa", menuUrl: "https://siargaodelivery.com/masa/" },
  { name: "Salami Karajaw", menuUrl: "https://siargaodelivery.com/salami-karajaw/" },
  { name: "Chef Restys", menuUrl: "https://siargaodelivery.com/chef-restys/" },
  { name: "Meze Grill", menuUrl: "https://siargaodelivery.com/meze-grill/" },
  { name: "Tahanan", menuUrl: "https://siargaodelivery.com/tahanan/" },
  { name: "Mad Monkey", menuUrl: "https://siargaodelivery.com/mad-monkey/" },
  { name: "Warung", menuUrl: "https://siargaodelivery.com/warung/" },
  { name: "Ingging Cakes", menuUrl: "https://siargaodelivery.com/ingging-cakes/" },
  { name: "LOKA", menuUrl: "https://siargaodelivery.com/loka/" },
  { name: "Tom&Toms", menuUrl: "https://siargaodelivery.com/tomtoms/" },
  { name: "Backside Burger", menuUrl: "https://siargaodelivery.com/backsideburger/" },
  { name: "Salt", menuUrl: "https://siargaodelivery.com/salt/" },
  { name: "Annattos", menuUrl: "https://siargaodelivery.com/annattos/" },
  { name: "Bamboo Cafe & Pizzeria", menuUrl: "https://siargaodelivery.com/bamboo-cafe-pizzeria/" },
  { name: "Cumin", menuUrl: "https://siargaodelivery.com/cumin/" },
  { name: "Wild", menuUrl: "https://siargaodelivery.com/wild/" },
  { name: "Aventinos", menuUrl: "https://siargaodelivery.com/aventinos/" },
  { name: "La Carinderia", menuUrl: "https://siargaodelivery.com/la-carinderia/" },
  { name: "Big Belly", menuUrl: "https://siargaodelivery.com/big-belly/" },
  { name: "Las Palmas", menuUrl: "https://siargaodelivery.com/las-palmas/" },
  { name: "Nanay Elsies", menuUrl: "https://siargaodelivery.com/nanay/" },
  { name: "Bulan", menuUrl: "https://siargaodelivery.com/bulan/" },
  { name: "Mondayyys", menuUrl: "https://siargaodelivery.com/mondayyys/" },
  { name: "Kawayan Gourmand", menuUrl: "https://siargaodelivery.com/kawayan/" },
];

async function fetchHtml(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        https
          .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          })
          .on("error", reject);
      });
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

function extractMenuImagesFromHtml(html) {
  // Get ALL restaurant-relevant images: menus, logos, banners, dish photos
  // Only exclude site-wide chrome (header logo, payment icons, footer)
  const imgRegex = /src="(https:\/\/siargaodelivery\.com\/wp-content\/uploads\/[^"]+\.(?:png|jpg|jpeg|webp))"/gi;
  const exclude = /cropped-Logo500px|Cash\.png|Gcash\.png|PayPal\.png|Logo-Siargao-Delivery-white|Favicon/i;
  const urls = new Set();
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    if (!exclude.test(m[1])) urls.add(m[1]);
  }
  // Also get elementor thumbs (carousels, etc.)
  const elemRegex = /src="(https:\/\/siargaodelivery\.com\/wp-content\/uploads\/elementor\/[^"]+\.(?:png|jpg|jpeg|webp))"/gi;
  while ((m = elemRegex.exec(html)) !== null) {
    if (!exclude.test(m[1])) urls.add(m[1]);
  }
  return [...urls];
}

function extractTextMenuItems(html) {
  // Match patterns like: "Item Name – php 123" or "Item Name - php 123" or "Item Name php 123"
  const priceRegex = /(?:^|\n)\s*(?:<[^>]+>)*\s*([^<\-]+?)\s*(?:–|-|php)\s*(?:php\s*)?(\d[\d,.\s]*)\s*(?:<|$)/gi;
  const items = [];
  const seen = new Set();

  // Also look for <strong>Item</strong> – php 123 or <br /> separated
  const lines = html.replace(/<br\s*\/?>/gi, "\n").split(/\n/);
  for (const line of lines) {
    const text = line.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const match = text.match(/^(.+?)\s*(?:–|-)\s*(?:php\s*)?(\d[\d,.\s]*)\s*$/i);
    if (match) {
      const name = match[1].trim();
      const price = match[2].replace(/[\s,]/g, "");
      if (name.length > 2 && name.length < 80 && !seen.has(name)) {
        seen.add(name);
        items.push({ name, price: price + " PHP" });
      }
    }
  }
  return items;
}

function extractFromJetTabs(html) {
  const items = [];
  // Match <strong>Item Name</strong> – php 900 or <strong>Item</strong> - php 1,200
  const strongRegex = /<strong>([^<]+)<\/strong>\s*(?:–|-)\s*(?:php\s*)?(\d[\d,.\s]*)/gi;
  let m;
  while ((m = strongRegex.exec(html)) !== null) {
    const name = m[1].trim();
    const price = m[2].replace(/[\s,]/g, "");
    if (name.length > 1 && name.length < 80) {
      items.push({ name, price: price + " PHP" });
    }
  }
  return items;
}

function isImageBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  const sig = buffer.subarray(0, 4);
  return (
    (sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47) || // PNG
    (sig[0] === 0xff && sig[1] === 0xd8) || // JPEG
    (sig[0] === 0x47 && sig[1] === 0x49 && sig[2] === 0x46) // GIF
  );
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function ocrImage(buffer) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: () => {},
  });
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text;
}

function parseOcrToItems(text) {
  const items = [];
  const lines = text.split(/\n/).filter((l) => l.trim());
  const pricePattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:php|₱|p)?/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 3) continue;
    const match = trimmed.match(new RegExp(`^(.+?)\\s+${pricePattern.source}`, "i"));
    if (match) {
      const name = match[1].trim().replace(/\s+/g, " ");
      const priceStr = match[2].replace(/[.,\s]/g, "");
      if (name.length > 2 && name.length < 100) {
        items.push({ name, price: priceStr + " PHP" });
      }
    } else if (pricePattern.test(trimmed)) {
      const parts = trimmed.split(pricePattern);
      if (parts[0]?.trim()) {
        items.push({
          name: parts[0].trim(),
          price: (parts[1] || "").replace(/[.,\s]/g, "") + " PHP",
        });
      }
    }
  }
  return items;
}

async function scrapeRestaurant(restaurant, ocrBudget) {
  console.log(`  Fetching ${restaurant.name}...`);
  const html = await fetchHtml(restaurant.menuUrl);
  let ocrUsed = 0;

  const result = {
    name: restaurant.name,
    menuUrl: restaurant.menuUrl,
    menuItems: [],
    imageUrls: [],
    scrapedAt: new Date().toISOString(),
  };

  // 1. Extract text-based menu items from HTML
  const textItems = extractTextMenuItems(html);
  const jetItems = extractFromJetTabs(html);
  result.menuItems = [...jetItems];
  for (const item of textItems) {
    if (!result.menuItems.some((m) => m.name === item.name)) {
      result.menuItems.push(item);
    }
  }

  // 2. Extract menu image URLs
  result.imageUrls = extractMenuImagesFromHtml(html);

  // 3. If we have images and few/no text items, run OCR (set SKIP_OCR=1 to skip, OCR_RESTAURANT_LIMIT to cap)
  const shouldOcr = !process.env.SKIP_OCR && ocrBudget > 0 && result.imageUrls.length > 0 && result.menuItems.length < 5;
  if (shouldOcr) {
    ocrUsed = 1;
    const outputDir = path.join(__dirname, "../.menu-cache");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < result.imageUrls.length; i++) {
      let buffer;
      try {
        const url = result.imageUrls[i];
        buffer = await downloadImage(url);
        if (!isImageBuffer(buffer)) {
          console.log(`    Skip image ${i}: not a valid image (got ${buffer?.length || 0} bytes)`);
          continue;
        }
        const safeName = restaurant.name.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-");
        const filename = path.join(outputDir, `${safeName}-menu-${i}.tmp`);
        fs.writeFileSync(filename, buffer);
        const ocrText = await ocrImage(buffer);
        const ocrItems = parseOcrToItems(ocrText);
        for (const item of ocrItems) {
          if (!result.menuItems.some((m) => m.name === item.name)) {
            result.menuItems.push(item);
          }
        }
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
      } catch (err) {
        console.log(`    OCR failed for image ${i}:`, err.message);
      }
    }
  }

  return { data: result, ocrUsed };
}

async function main() {
  console.log("Scraping siargaodelivery.com menus...\n");
  const ocrLimit = parseInt(process.env.OCR_RESTAURANT_LIMIT || "999", 10);
  const allData = [];
  let ocrCount = 0;

  for (const restaurant of RESTAURANTS) {
    try {
      const { data, ocrUsed } = await scrapeRestaurant(restaurant, ocrLimit - ocrCount);
      allData.push(data);
      if (ocrUsed) ocrCount++;
      console.log(`  ✓ ${restaurant.name}: ${data.menuItems.length} items, ${data.imageUrls.length} images`);
    } catch (err) {
      console.error(`  ✗ ${restaurant.name}:`, err.message);
      allData.push({
        name: restaurant.name,
        menuUrl: restaurant.menuUrl,
        menuItems: [],
        imageUrls: [],
        error: err.message,
      });
    }
  }

  const outputPath = path.join(__dirname, "../src/data/menu-items.json");
  fs.writeFileSync(outputPath, JSON.stringify({ restaurants: allData, scrapedAt: new Date().toISOString() }, null, 2));
  console.log(`\nSaved to ${outputPath}`);
}

main().catch(console.error);
