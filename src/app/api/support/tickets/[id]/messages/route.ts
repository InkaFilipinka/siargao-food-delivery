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

/** POST /api/support/tickets/[id]/messages - Add message to ticket */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json().catch(() => ({}));
    const { message } = body;
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, customer_id")
      .eq("id", ticketId)
      .single();

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const customerId = getCustomerId(request);
    const staff = isStaff(request);

    let senderType: "customer" | "staff";
    if (staff) {
      senderType = "staff";
    } else if (ticket.customer_id && ticket.customer_id === customerId) {
      senderType = "customer";
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: msg, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_type: senderType,
        message: message.trim(),
      })
      .select("id, sender_type, message, created_at")
      .single();

    if (error) {
      console.error("Support message:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString(), status: staff ? "in_progress" : "open" })
      .eq("id", ticketId);

    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error("Support messages POST:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
