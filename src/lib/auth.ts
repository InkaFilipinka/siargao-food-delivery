import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "change-me";
const TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

export interface RestaurantToken {
  type: "restaurant";
  slug: string;
  exp: number;
}
export interface DriverToken {
  type: "driver";
  driverId: string;
  exp: number;
}
export interface CustomerToken {
  type: "customer";
  customerId: string;
  exp: number;
}
export type AuthToken = RestaurantToken | DriverToken | CustomerToken;

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64url");
}
function base64UrlDecode(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
}

/** Create a signed token for restaurant, driver, or customer */
export function createToken(data: RestaurantToken | DriverToken | CustomerToken): string {
  const payload = JSON.stringify({
    ...data,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC,
  });
  const b64 = base64UrlEncode(Buffer.from(payload, "utf8"));
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

/** Verify and decode token. Returns null if invalid. */
export function verifyToken(token: string): AuthToken | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const payload = JSON.parse(
      base64UrlDecode(parts[0]).toString("utf8")
    ) as AuthToken & { exp?: number };
    const expectedSig = sign(parts[0]);
    const actualSig = parts[1];
    if (actualSig.length !== expectedSig.length || !timingSafeEqual(Buffer.from(actualSig), Buffer.from(expectedSig))) {
      return null;
    }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.type === "restaurant" && payload.slug) return { type: "restaurant", slug: payload.slug, exp: payload.exp };
    if (payload.type === "driver" && payload.driverId) return { type: "driver", driverId: payload.driverId, exp: payload.exp };
    if (payload.type === "customer" && (payload as CustomerToken).customerId) return { type: "customer", customerId: (payload as CustomerToken).customerId, exp: payload.exp };
    return null;
  } catch {
    return null;
  }
}

/** Hash password for storage. Returns "salt.hash" hex. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}.${hash.toString("hex")}`;
}

/** Verify password against stored hash */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !password) return false;
  const [saltHex, hashHex] = stored.split(".");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const hash = scryptSync(password, salt, 64);
    const storedHash = Buffer.from(hashHex, "hex");
    return hash.length === storedHash.length && timingSafeEqual(hash, storedHash);
  } catch {
    return false;
  }
}
