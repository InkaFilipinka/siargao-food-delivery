import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRestaurantBySlug } from "@/data/combined";

function getStaffToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function requireStaffAuth(request: Request): Response | null {
  const staffToken = process.env.STAFF_TOKEN;
  if (!staffToken) return null;
  const token = getStaffToken(request);
  if (token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const PREP_OPTIONS = [5, 10, 20, 30, 45];

/** POST /api/restaurant/orders/[orderId] - Accept or reject (staff auth) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authErr = requireStaffAuth(request);
    if (authErr) return authErr;

    const { orderId } = await params;
    const body = await request.json();
    const { slug, action, prepMins } = body as {
      slug?: string;
      action?: "accept" | "reject";
      prepMins?: number;
    };

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "slug required" },
        { status: 400 }
      );
    }

    const restaurant = getRestaurantBySlug(slug.trim());
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (action === "reject") {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 503 }
        );
      }

      const { error } = await supabase
        .from("order_restaurant_status")
        .upsert(
          {
            order_id: orderId,
            restaurant_slug: slug.trim(),
            status: "rejected",
            prep_mins: null,
            accepted_at: null,
          },
          { onConflict: "order_id,restaurant_slug" }
        );

      if (error) {
        console.error("Reject error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    if (action === "accept") {
      const prep = prepMins != null && PREP_OPTIONS.includes(Number(prepMins))
        ? Number(prepMins)
        : 15;

      const supabase = getSupabaseAdmin();
      if (!supabase) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 503 }
        );
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("order_restaurant_status")
        .upsert(
          {
            order_id: orderId,
            restaurant_slug: slug.trim(),
            status: "accepted",
            prep_mins: prep,
            accepted_at: now,
          },
          { onConflict: "order_id,restaurant_slug" }
        );

      if (error) {
        console.error("Accept error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, status: "accepted", prepMins: prep });
    }

    return NextResponse.json(
      { error: "action must be accept or reject" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Restaurant order update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
