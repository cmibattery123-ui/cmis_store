export interface WhatsAppOrderDetails {
  phone: string;
  template?: string;
  productName: string;
  sku: string;
  price?: number | string;
  url?: string;
}

export interface WhatsAppCartItem {
  name: string;
  sku?: string;
  quantity: number;
  price: number;
}

export interface WhatsAppCartOrderDetails {
  phone: string;
  items: WhatsAppCartItem[];
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  addressSummary?: string;
}

/**
 * Normalizes phone number into international format for WhatsApp (wa.me/...)
 * Auto-prefixes India country code 91 if a 10-digit mobile number is supplied.
 */
export function normalizeWhatsAppPhone(phone: string): string {
  let clean = (phone || "").replace(/\D/g, "");
  if (clean.length === 10) {
    clean = `91${clean}`;
  } else if (clean.startsWith("0") && clean.length === 11) {
    clean = `91${clean.slice(1)}`;
  }
  return clean;
}

/**
 * Builds a valid RFC 3966 telephone URL: tel:+91...
 */
export function buildTelUrl(phone: string): string {
  const clean = normalizeWhatsAppPhone(phone);
  return `tel:+${clean}`;
}

/**
 * Returns a clean, human-friendly display format for telephone/WhatsApp numbers:
 * e.g. "+91 98422 41101"
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const raw = phone.trim();
  if (raw.startsWith("+") && raw.includes(" ")) {
    return raw;
  }
  const clean = normalizeWhatsAppPhone(raw);
  if (clean.startsWith("91") && clean.length === 12) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return `+${clean}`;
}

/**
 * Builds a direct WhatsApp chat link with a professionally pre-composed inquiry & order message.
 */
export function buildWhatsAppOrderUrl({
  phone,
  template,
  productName,
  sku,
  price,
  url,
}: WhatsAppOrderDetails): string {
  const cleanPhone = normalizeWhatsAppPhone(phone);
  const defaultTemplate =
    "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.";

  const formattedPrice =
    price !== undefined && price !== null
      ? `₹${Number(price).toLocaleString("en-IN")}`
      : "";

  let message = (template || defaultTemplate)
    .replace(/{product_name}/g, productName)
    .replace(/{sku}/g, sku || "N/A")
    .replace(/{price}/g, formattedPrice)
    .replace(/{url}/g, url || "");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a WhatsApp order link for multi-item cart orders when the online gateway is disabled.
 */
export function buildWhatsAppCartOrderUrl({
  phone,
  items,
  totalAmount,
  customerName,
  customerPhone,
  addressSummary,
}: WhatsAppCartOrderDetails): string {
  const cleanPhone = normalizeWhatsAppPhone(phone);

  const lines: string[] = [
    "Hello Chinna Mayil Industries,",
    "",
    "I would like to place an order directly via WhatsApp:",
    "",
    "*Order Summary:*",
  ];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. *${item.name}* (Qty: ${item.quantity}) — ₹${Number(item.price * item.quantity).toLocaleString("en-IN")}`
    );
  });

  lines.push("");
  lines.push(`*Estimated Total:* ₹${Number(totalAmount).toLocaleString("en-IN")} (incl. applicable taxes)`);

  if (customerName) {
    lines.push(`*Customer Name:* ${customerName}`);
  }
  if (customerPhone) {
    lines.push(`*Phone:* ${customerPhone}`);
  }
  if (addressSummary) {
    lines.push(`*Delivery Location:* ${addressSummary}`);
  }

  lines.push("");
  lines.push("Please share invoice and bank transfer / payment instructions for dispatch. Thank you!");

  const message = lines.join("\n");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
