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

/** GET /api/support/tickets/[id] - Get ticket with messages */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const customerId = getCustomerId(request);
    const staff = isStaff(request);
    if (!staff && ticket.customer_id !== customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: messages } = await supabase
      .from("support_messages")
      .select("id, ticket_id, sender_type, message, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        phone: ticket.phone,
        email: ticket.email,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      },
      messages: messages || [],
    });
  } catch (err) {
    console.error("Support ticket GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
