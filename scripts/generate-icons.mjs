#!/usr/bin/env node
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const publicDir = join(rootDir, "public");
const appDir = join(rootDir, "src", "app");

// Theme color #ea580c (orange)
const themeColor = { r: 234, g: 88, b: 12 };

async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="rgb(${themeColor.r},${themeColor.g},${themeColor.b})"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${size * 0.2}" fill="white">SD</text>
    </svg>
  `;
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(appDir, { recursive: true });
  const [icon32, icon192, icon512] = await Promise.all([
    generateIcon(32),
    generateIcon(192),
    generateIcon(512),
  ]);
  writeFileSync(join(appDir, "icon.png"), icon32);
  writeFileSync(join(publicDir, "icon-192.png"), icon192);
  writeFileSync(join(publicDir, "icon-512.png"), icon512);
  console.log("Generated app/icon.png (favicon), icon-192.png and icon-512.png");
}

main().catch(console.error);
