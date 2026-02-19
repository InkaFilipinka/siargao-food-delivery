import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "restaurant-images";
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function requireStaffAuth(request: Request): Response | null {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const staffToken = process.env.STAFF_TOKEN;
  if (staffToken && token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function getExt(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** POST /api/admin/upload-restaurant-image - Upload image for restaurant (staff only) */
export async function POST(request: NextRequest) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Form data required" }, { status: 400 });

  const file = formData.get("file") as File | null;
  const slug = formData.get("slug")?.toString()?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!file || !slug) {
    return NextResponse.json({ error: "file and slug required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed (jpg, png, webp, gif)" }, { status: 400 });
  }

  const ext = getExt(mime);
  const folder = slug;

  try {
    // Ensure bucket exists (createBucket fails silently if already exists)
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      fileSizeLimit: `${MAX_SIZE_MB}MB`,
    }).catch(() => {});

    // List existing files to get next number
    const { data: existing } = await supabase.storage.from(BUCKET).list(folder);
    const prefix = `${slug}-`;
    const numbers = (existing || [])
      .filter((f) => f.name?.startsWith(prefix))
      .map((f) => {
        const match = f.name.match(new RegExp(`^${prefix.replace(/-/g, "\\-")}(\\d+)\\.`));
        return match ? parseInt(match[1], 10) : 0;
      });
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const filename = `${slug}-${nextNum}.${ext}`;
    const path = `${folder}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const imageUrl = `${baseUrl}/api/image/${BUCKET}/${folder}/${filename}`;

    return NextResponse.json({ url: imageUrl, filename });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
