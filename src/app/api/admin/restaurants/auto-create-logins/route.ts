import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { combinedRestaurants } from "@/data/combined";

function requireStaffAuth(request: Request): Response | null {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const staffToken = process.env.STAFF_TOKEN;
  if (staffToken && token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const DEFAULT_PASSWORD = "changeme123";

/** POST - Create portal login (email + password) for all restaurants that don't have one */
export async function POST(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  // Get all slugs: admin_restaurants + static
  const { data: adminRows } = await supabase.from("admin_restaurants").select("slug");
  const adminSlugs = new Set((adminRows || []).map((r: { slug: string }) => r.slug));
  const staticSlugs = combinedRestaurants.map((r) => r.slug);
  const allSlugs = [...new Set([...adminSlugs, ...staticSlugs])];

  const { data: configs } = await supabase
    .from("restaurant_config")
    .select("slug, email, password_hash")
    .in("slug", allSlugs);

  const hasLogin = new Set(
    (configs || []).filter((c) => c.email?.trim() && c.password_hash).map((c) => c.slug)
  );
  const needLogin = allSlugs.filter((s) => !hasLogin.has(s));

  let created = 0;
  for (const slug of needLogin) {
    const email = `${slug}@portal.siargaodelivery.com`;
    const { error } = await supabase.from("restaurant_config").upsert(
      {
        slug,
        email,
        password_hash: hashPassword(DEFAULT_PASSWORD),
        commission_pct: 30,
        delivery_commission_pct: 30,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );
    if (!error) created++;
  }

  return Response.json({
    created,
    total: needLogin.length,
    message: `Created ${created} portal logins. Default password: ${DEFAULT_PASSWORD}. Change in Edit (Commission settings).`,
  });
}
