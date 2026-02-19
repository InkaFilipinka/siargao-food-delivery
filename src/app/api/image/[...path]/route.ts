import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";

const MAX_WIDTH = 1600;
const THUMB_WIDTH = 480;
const QUALITY = 80;

/** GET /api/image/restaurant-images/sunset-pizza/sunset-pizza-1.jpg - Proxy image from Supabase.
 *  Add ?w=480 for thumbnail (resized, compressed webp). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  if (!pathParts?.length) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  const path = pathParts.join("/");
  if (path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const widthParam = searchParams.get("w");
  const targetWidth = widthParam ? Math.min(parseInt(widthParam, 10) || THUMB_WIDTH, MAX_WIDTH) : null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const bucket = pathParts[0];
  const objectPath = pathParts.slice(1).join("/");

  const { data, error } = await supabase.storage.from(bucket).download(objectPath);

  if (error || !data) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  let output: Buffer | Uint8Array = Buffer.from(await data.arrayBuffer());
  let contentType = "image/jpeg";
  const ext = objectPath.split(".").pop()?.toLowerCase();

  if (targetWidth && targetWidth > 0 && !["gif"].includes(ext || "")) {
    try {
      const pipeline = sharp(output as Buffer);
      const meta = await pipeline.metadata();
      const actualWidth = meta.width ?? 0;
      if (actualWidth > targetWidth) {
        output = await pipeline
          .resize(targetWidth, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toBuffer();
        contentType = "image/webp";
      }
    } catch (e) {
      console.error("Image resize error:", e);
    }
  }

  if (contentType === "image/jpeg" && !targetWidth) {
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    contentType = contentTypes[ext || ""] || "image/jpeg";
  }

  return new NextResponse(new Uint8Array(output), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
