import { db } from "@/lib/db";
import { apiSuccess } from "@/lib/utils/api";
import { normalizeWhatsAppPhone, formatPhoneDisplay } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "RAZORPAY_ENABLED",
            "WHATSAPP_ENABLED",
            "WHATSAPP_PHONE",
            "WHATSAPP_MESSAGE",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const razorpayEnabled = settingsMap["RAZORPAY_ENABLED"] !== undefined
      ? settingsMap["RAZORPAY_ENABLED"] === "true"
      : process.env.RAZORPAY_ENABLED !== undefined
      ? process.env.RAZORPAY_ENABLED === "true"
      : true;

    const whatsappEnabled = settingsMap["WHATSAPP_ENABLED"] !== undefined
      ? settingsMap["WHATSAPP_ENABLED"] === "true"
      : true;

    const rawPhone =
      settingsMap["WHATSAPP_PHONE"] ||
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE ||
      "914224227227";

    const cleanPhone = normalizeWhatsAppPhone(rawPhone);
    const whatsappPhoneDisplay = formatPhoneDisplay(rawPhone);

    const whatsappMessage =
      settingsMap["WHATSAPP_MESSAGE"] ||
      "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.";

    return apiSuccess(
      {
        razorpayEnabled,
        whatsappEnabled,
        whatsappPhone: cleanPhone,
        whatsappPhoneDisplay,
        whatsappMessage,
      },
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    );
  } catch (error) {
    console.error("[API Payments Status GET]", error);
    return apiSuccess(
      {
        razorpayEnabled: true,
        whatsappEnabled: true,
        whatsappPhone: "914224227227",
        whatsappPhoneDisplay: "+91 422 422 7227",
        whatsappMessage:
          "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.",
      },
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    );
  }
}
