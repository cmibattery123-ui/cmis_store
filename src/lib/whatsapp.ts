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
  const cleanPhone = phone.replace(/\D/g, "");
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
  const cleanPhone = phone.replace(/\D/g, "");

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
