import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/image/restaurant-images/sunset-pizza/sunset-pizza-1.jpg - Proxy image from Supabase (our domain URL) */
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

  const ext = objectPath.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const contentType = contentTypes[ext || ""] || "image/jpeg";

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
