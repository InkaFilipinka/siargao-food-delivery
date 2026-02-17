import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export interface OrderReceiptParams {
  to_email: string;
  customer_name: string;
  order_id: string;
  items: string; // formatted list
  subtotal: string;
  delivery_fee: string;
  tip: string;
  priority_fee: string;
  total: string;
  landmark: string;
  address: string;
  time_window: string;
}

export async function sendOrderReceipt(params: OrderReceiptParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS not configured. Skipping email receipt.");
    return;
  }
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...params }, { publicKey: PUBLIC_KEY });
}
