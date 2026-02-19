import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

async function checkOrdersAuth(request: Request): Promise<{ ok: true; driverId?: string } | Response> {
  const token = getBearerToken(request);
  const staffToken = process.env.STAFF_TOKEN;

  if (staffToken && token === staffToken) {
    return { ok: true };
  }

  const { verifyToken } = await import("@/lib/auth");
  const decoded = verifyToken(token || "");
  if (decoded?.type === "driver") {
    return { ok: true, driverId: decoded.driverId };
  }

  if (staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { ok: true };
}

/** GET /api/orders - List orders (staff: all, driver: only assigned to them) */
export async function GET(request: Request) {
  try {
    const authResult = await checkOrdersAuth(request);
    if (authResult instanceof Response) return authResult;

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Database connection failed";
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    if (!supabase) {
      return NextResponse.json(
        { error: "Order list requires database. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
    if (authResult.driverId) {
      query = query.eq("driver_id", authResult.driverId);
    }
    const { data: orders, error } = await query;

    if (error) {
      console.error("Orders list error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const orderIds = (orders || []).map((o) => o.id);
    const { data: items } = orderIds.length
      ? await supabase
          .from("order_items")
          .select("order_id, restaurant_name, item_name, price, quantity")
          .in("order_id", orderIds)
      : { data: [] };

    const itemsByOrder = new Map<string, typeof items>();
    for (const i of items || []) {
      const list = itemsByOrder.get(i.order_id) || [];
      list.push(i);
      itemsByOrder.set(i.order_id, list);
    }

    const list = (orders || []).map((o) => ({
      id: o.id,
      status: o.status,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerWhatsapp: o.customer_whatsapp ?? null,
      landmark: o.landmark,
      deliveryAddress: o.delivery_address,
      deliveryLat: o.delivery_lat ?? null,
      deliveryLng: o.delivery_lng ?? null,
      totalPhp: o.total_php,
      tipPhp: o.tip_php ?? 0,
      paymentMethod: o.payment_method ?? "cash",
      paymentStatus: o.payment_status ?? "pending",
      stripePaymentIntentId: (o as { stripe_payment_intent_id?: string }).stripe_payment_intent_id ?? null,
      cardLast4: (o as { card_last4?: string }).card_last4 ?? null,
      cardBrand: (o as { card_brand?: string }).card_brand ?? null,
      arrivedAtHubAt: o.arrived_at_hub_at ?? null,
      cashReceivedByDriver: o.cash_received_by_driver ?? null,
      cashTurnedIn: o.cash_turned_in ?? null,
      updatedBy: o.updated_by ?? null,
      timeWindow: o.time_window,
      scheduledAt: o.scheduled_at,
      createdAt: o.created_at,
      confirmedAt: o.confirmed_at,
      readyAt: o.ready_at,
      assignedAt: o.assigned_at,
      pickedAt: o.picked_at,
      deliveredAt: o.delivered_at,
      driverLat: (o as { driver_lat?: number }).driver_lat ?? null,
      driverLng: (o as { driver_lng?: number }).driver_lng ?? null,
      driverLocationUpdatedAt: (o as { driver_location_updated_at?: string }).driver_location_updated_at ?? null,
      items: itemsByOrder.get(o.id) || [],
    }));

    return Response.json({ orders: list });
  } catch (err) {
    console.error("Orders GET error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
import { sendNtfy } from "@/lib/ntfy";
import { getNtfyTopic } from "@/config/restaurant-extras";
import { getSlugByRestaurantName, getIsGroceryBySlug } from "@/data/combined";
import { costFromDisplay, getCommissionPct } from "@/lib/restaurant-config";
import type { CreateOrderInput, OrderItem } from "@/types/order";

function sendOrderNtfy(orderId: string, items: OrderItem[], landmark: string, customerPhone: string, customerWhatsapp?: string | null) {
  const byRestaurant = new Map<string, { slug: string; items: OrderItem[] }>();
  for (const item of items) {
    const slug =
      item.restaurantSlug ??
      getSlugByRestaurantName(item.restaurantName) ??
      item.restaurantName.toLowerCase().replace(/\s+/g, "-");
    if (!byRestaurant.has(item.restaurantName)) {
      byRestaurant.set(item.restaurantName, { slug, items: [] });
    }
    byRestaurant.get(item.restaurantName)!.items.push(item);
  }
  const phTime = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  for (const [restaurantName, { slug, items: restItems }] of byRestaurant) {
    const topic = getNtfyTopic(slug);
    const lines = restItems.map((i) => `• ${i.itemName} x${i.quantity} - ${i.price}`);
    const contactLines: string[] = [];
    if (customerWhatsapp?.trim()) contactLines.push(`📱 WhatsApp: ${customerWhatsapp.trim()}`);
    if (customerPhone?.trim()) contactLines.push(`📞 Phone: ${customerPhone.trim()}`);
    const contactBlock = contactLines.length ? `\n${contactLines.join("\n")}` : `\n📞 ${customerPhone}`;

    const msg = `🍽️ New order #${String(orderId).slice(0, 8)}

${lines.join("\n")}

📍 ${landmark}
🕐 ${phTime}${contactBlock}`;
    sendNtfy(topic, msg, { title: `${restaurantName} - Order`, priority: "high", tags: "plate_with_cutlery" }).catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderInput = await request.json();
    let customerId: string | undefined;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { verifyToken } = await import("@/lib/auth");
      const decoded = verifyToken(authHeader.slice(7));
      if (decoded?.type === "customer") {
        customerId = decoded.customerId;
      }
    }

    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      customerEmail,
      deliveryAddress,
      landmark,
      deliveryLat,
      deliveryLng,
      deliveryZoneId,
      deliveryZoneName,
      deliveryFeePhp,
      deliveryDistanceKm,
      notes,
      items,
      timeWindow,
      scheduledAt,
      tipPhp,
      priorityDelivery,
      allowSubstitutions,
      paymentMethod,
      promoCode,
      discountPhp,
      referralCode,
      loyaltyPointsRedeemed,
      referralCreditPhp,
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { error: "Name and WhatsApp number are required" },
        { status: 400 }
      );
    }

    if (!landmark?.trim()) {
      return NextResponse.json(
        { error: "Landmark is required (e.g. near Bravo, beside...)" },
        { status: 400 }
      );
    }

    const address = deliveryAddress?.trim() || "See landmark";

    if (!items?.length) {
      return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
    }

    // Max 1 restaurant + 1 grocery per order
    const getSlug = (i: OrderItem) =>
      (i as { restaurantSlug?: string }).restaurantSlug ?? getSlugByRestaurantName(i.restaurantName) ?? i.restaurantName.toLowerCase().replace(/\s+/g, "-");
    const uniqueSlugs = [...new Set(items.map(getSlug).filter(Boolean))];
    const grocerySlugs = uniqueSlugs.filter((slug) => getIsGroceryBySlug(slug));
    const restaurantSlugs = uniqueSlugs.filter((slug) => !getIsGroceryBySlug(slug));
    if (grocerySlugs.length > 1 || restaurantSlugs.length > 1) {
      return NextResponse.json(
        { error: "Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables, then redeploy." },
        { status: 503 }
      );
    }
    const subtotalPhp = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
    const deliveryFee = deliveryFeePhp ?? 0;
    const tip = tipPhp ?? 0;
    const priorityFee = priorityDelivery ? 50 : 0;
    const promoDiscount = Math.min(discountPhp ?? 0, subtotalPhp);
    let loyaltyDiscount = 0;
    let loyaltyPointsToDeduct = 0;
    let referralCreditsToApply: string[] = [];
    let referralDiscount = 0;

    if (supabase && loyaltyPointsRedeemed && loyaltyPointsRedeemed > 0) {
      const pointsValue = Math.floor(loyaltyPointsRedeemed / 10) * 5;
      if (pointsValue > 0) {
        const { data: cust } = await supabase
          .from("customers")
          .select("id, loyalty_points")
          .eq("phone", customerPhone.trim())
          .maybeSingle();
        if (cust && (cust.loyalty_points ?? 0) >= loyaltyPointsRedeemed) {
          loyaltyPointsToDeduct = loyaltyPointsRedeemed;
          loyaltyDiscount = Math.min(pointsValue, subtotalPhp - promoDiscount);
        }
      }
    }
    if (supabase && referralCreditPhp && referralCreditPhp > 0) {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const { data: cust } = await supabase.from("customers").select("id").or(`phone.eq.${customerPhone.trim()},phone.ilike.%${cleanPhone.slice(-6)}`).maybeSingle();
      if (cust) {
        const { data: pending } = await supabase
          .from("referral_credits")
          .select("id, amount_php")
          .eq("referrer_id", cust.id)
          .eq("status", "pending")
          .order("created_at", { ascending: true });
        let remaining = Math.min(referralCreditPhp, subtotalPhp - promoDiscount - loyaltyDiscount);
        for (const c of pending || []) {
          if (remaining <= 0) break;
          const amt = Math.min(c.amount_php ?? 0, remaining);
          if (amt > 0) {
            referralCreditsToApply.push(c.id);
            referralDiscount += amt;
            remaining -= amt;
          }
        }
      }
    }

    const discount = promoDiscount + loyaltyDiscount + referralDiscount;
    const totalPhp = Math.max(0, subtotalPhp - discount + deliveryFee + tip + priorityFee);

    const distanceKm = deliveryDistanceKm ?? 3;
    const prepMins = 20;
    const deliveryMins = Math.ceil(distanceKm * 5);
    const etaDate = new Date();
    etaDate.setMinutes(etaDate.getMinutes() + prepMins + deliveryMins);
    const estimatedDeliveryAt = timeWindow === "scheduled" && scheduledAt
      ? scheduledAt
      : etaDate.toISOString();

    const cancelCutoffDate = new Date();
    cancelCutoffDate.setMinutes(cancelCutoffDate.getMinutes() + 5);

    if (supabase) {
      // Upsert customer account: primary = WhatsApp if provided, else phone
      const primaryPhone = (customerWhatsapp?.trim() || customerPhone.trim()) || "";
      if (primaryPhone && !customerId) {
        const { data: upserted } = await supabase
          .from("customers")
          .upsert(
            {
              phone: primaryPhone,
              name: customerName.trim(),
              email: customerEmail?.trim() || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "phone" }
          )
          .select("id")
          .single();
        if (upserted?.id) customerId = upserted.id;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId ?? null,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_whatsapp: (customerWhatsapp?.trim() || customerPhone.trim()) || null,
          delivery_address: address,
          landmark: landmark.trim(),
          delivery_lat: deliveryLat ?? null,
          delivery_lng: deliveryLng ?? null,
          delivery_zone_id: deliveryZoneId ?? null,
          delivery_zone_name: deliveryZoneName ?? null,
          delivery_distance_km: deliveryDistanceKm ?? null,
          notes: notes?.trim() || null,
          subtotal_php: subtotalPhp,
          delivery_fee_php: deliveryFee,
          tip_php: tip,
          priority_fee_php: priorityFee,
          discount_php: discount,
          total_php: totalPhp,
          promo_code: promoCode?.trim() || null,
          status: "pending",
          time_window: timeWindow ?? "asap",
          scheduled_at: scheduledAt ?? null,
          allow_substitutions: allowSubstitutions ?? true,
          payment_method: paymentMethod ?? "cash",
          payment_status: paymentMethod === "cash" ? "pending" : paymentMethod ? "pending" : "pending",
          estimated_delivery_at: estimatedDeliveryAt,
          cancel_cutoff_at: cancelCutoffDate.toISOString(),
        })
        .select("id, created_at")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      const slugs = [...new Set(items.map((i) => getSlug(i)))];
      const { data: configs } = slugs.length
        ? await supabase.from("restaurant_config").select("slug, commission_pct").in("slug", slugs)
        : { data: [] };
      const commissionBySlug = new Map((configs || []).map((c) => [c.slug, getCommissionPct(c)]));

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => {
          const slug = getSlug(i);
          const commissionPct = commissionBySlug.get(slug) ?? 30;
          const costValue = Math.round(costFromDisplay(i.priceValue, commissionPct) * 100) / 100;
          return {
            order_id: order.id,
            restaurant_name: i.restaurantName,
            item_name: i.itemName,
            price: i.price,
            price_value: i.priceValue,
            cost_value: costValue,
            quantity: i.quantity,
          };
        })
      );

      if (itemsError) {
        console.error("Supabase order_items insert error:", itemsError);
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      if (promoCode?.trim() && discount > 0) {
        const { data: promoRow } = await supabase.from("promo_codes").select("id, uses_count").eq("code", promoCode.trim().toUpperCase()).maybeSingle();
        if (promoRow) {
          await supabase.from("promo_usage").insert({ promo_id: promoRow.id, order_id: order.id, phone: customerPhone.trim() });
          await supabase.from("promo_codes").update({ uses_count: (promoRow.uses_count ?? 0) + 1 }).eq("id", promoRow.id);
        }
      }

      if (referralCode?.trim()) {
        const { data: referrer } = await supabase
          .from("customers")
          .select("id")
          .eq("referral_code", referralCode.trim().toUpperCase())
          .maybeSingle();
        if (referrer) {
          await supabase.from("referral_credits").insert({
            referrer_id: referrer.id,
            referred_order_id: order.id,
            amount_php: 50,
            status: "pending",
          });
        }
      }

      if (loyaltyPointsToDeduct > 0) {
        const { data: cust } = await supabase.from("customers").select("id, loyalty_points").eq("phone", customerPhone.trim()).maybeSingle();
        if (cust) {
          await supabase.from("customers").update({ loyalty_points: Math.max(0, (cust.loyalty_points ?? 0) - loyaltyPointsToDeduct), updated_at: new Date().toISOString() }).eq("id", cust.id);
        }
      }
      for (const credId of referralCreditsToApply) {
        await supabase.from("referral_credits").update({ status: "applied" }).eq("id", credId);
      }

      sendOrderNtfy(order.id, items, landmark.trim(), customerPhone.trim(), customerWhatsapp?.trim() || null);

      return NextResponse.json({
        id: order.id,
        createdAt: order.created_at,
      });
    }

    const id = crypto.randomUUID();
    sendOrderNtfy(id, items, landmark.trim(), customerPhone.trim(), customerWhatsapp?.trim() || null);
    return NextResponse.json({
      id,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Order API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
