export interface CartItem {
  restaurantName: string;
  restaurantSlug: string;
  itemName: string;
  price: string; // e.g. "120 PHP"
  priceValue: number; // numeric for calculations
  quantity: number;
  /** True if from a grocery (categories include "Groceries"). For max 1 restaurant + 1 grocery per order. */
  isGrocery?: boolean;
}

export interface OrderItem {
  restaurantName: string;
  restaurantSlug?: string;
  itemName: string;
  price: string;
  priceValue: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "assigned"
  | "picked"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryDistanceKm?: number;
  notes?: string;
  items: OrderItem[];
  subtotalPhp: number;
  deliveryFeePhp: number;
  tipPhp: number;
  priorityFeePhp: number;
  totalPhp: number;
  status: OrderStatus;
  timeWindow: "asap" | "scheduled";
  scheduledAt?: string; // ISO datetime when timeWindow is "scheduled"
  allowSubstitutions?: boolean;
  createdAt: string;
}

export type PaymentMethod = "cash" | "card" | "gcash" | "crypto" | "paypal";

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryFeePhp?: number;
  deliveryDistanceKm?: number;
  notes?: string;
  items: OrderItem[];
  timeWindow: "asap" | "scheduled";
  scheduledAt?: string;
  tipPhp?: number;
  priorityDelivery?: boolean;
  allowSubstitutions?: boolean;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
  discountPhp?: number;
  referralCode?: string;
}
