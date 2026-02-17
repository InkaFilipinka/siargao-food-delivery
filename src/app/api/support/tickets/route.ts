import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function isStaff(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7);
    if (process.env.STAFF_TOKEN && t === process.env.STAFF_TOKEN) return true;
  }
  return false;
}

function getCustomerId(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const decoded = verifyToken(auth.slice(7));
  return decoded?.type === "customer" ? decoded.customerId : null;
}

/** POST /api/support/tickets - Create a support ticket */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { subject, message, phone, email } = body;
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const customerId = getCustomerId(request);

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        customer_id: customerId ?? null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        subject: subject.trim(),
        status: "open",
      })
      .select("id, subject, status, created_at")
      .single();

    if (error) {
      console.error("Support ticket create:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    const { error: msgErr } = await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_type: "customer",
      message: message.trim(),
    });

    if (msgErr) {
      console.error("Support message create:", msgErr);
    }

    return NextResponse.json({ ticket: { id: ticket.id, subject: ticket.subject, status: ticket.status, createdAt: ticket.created_at } });
  } catch (err) {
    console.error("Support tickets POST:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** GET /api/support/tickets - List tickets (staff: all, customer: own) */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const customerId = getCustomerId(request);
    const staff = isStaff(request);

    let query = supabase
      .from("support_tickets")
      .select("id, subject, status, phone, email, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (!staff && customerId) {
      query = query.eq("customer_id", customerId);
    } else if (!staff && !customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Support tickets GET:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ tickets: data || [] });
  } catch (err) {
    console.error("Support tickets GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
