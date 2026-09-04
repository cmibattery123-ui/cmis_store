import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const updatePaymentSettingsSchema = z.object({
  razorpayEnabled: z.boolean(),
  keyId: z.string().optional(),
  keySecret: z.string().optional(),
  webhookSecret: z.string().optional(),
});

/**
 * GET /api/admin/settings/payment
 * Retrieves administrative payment gateway settings.
 */
export async function GET(request?: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user?.role !== "ADMIN") {
      return apiError("Unauthorized access. Admin privileges required.", 403);
    }

    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "RAZORPAY_ENABLED",
            "RAZORPAY_KEY_ID",
            "RAZORPAY_KEY_SECRET",
            "RAZORPAY_WEBHOOK_SECRET",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const razorpayEnabled = settingsMap["RAZORPAY_ENABLED"]
      ? settingsMap["RAZORPAY_ENABLED"] === "true"
      : process.env.RAZORPAY_ENABLED === "true" || true;

    const keyId =
      settingsMap["RAZORPAY_KEY_ID"] ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "";

    const rawSecret =
      settingsMap["RAZORPAY_KEY_SECRET"] ||
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      "";

    const rawWebhookSecret =
      settingsMap["RAZORPAY_WEBHOOK_SECRET"] ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      "";

    return apiSuccess({
      razorpayEnabled,
      keyId,
      // Return masked secrets for admin reference while preserving raw presence
      keySecretConfigured: Boolean(rawSecret),
      keySecretMasked: rawSecret ? `••••••••${rawSecret.slice(-4)}` : "",
      webhookSecretConfigured: Boolean(rawWebhookSecret),
      webhookSecretMasked: rawWebhookSecret
        ? `••••••••${rawWebhookSecret.slice(-4)}`
        : "",
    });
  } catch (error) {
    console.error("[API Admin Payment Settings GET]", error);
    return apiError("Failed to fetch payment settings", 500);
  }
}

/**
 * POST /api/admin/settings/payment
 * Atomically upserts Razorpay gateway settings in systemSetting database table.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth(request);
    if (!session || session.user?.role !== "ADMIN") {
      return apiError("Unauthorized access. Admin privileges required.", 403);
    }

    const body = await request.json();
    const validated = updatePaymentSettingsSchema.safeParse(body);

    if (!validated.success) {
      return apiError("Invalid settings payload", 400);
    }

    const { razorpayEnabled, keyId, keySecret, webhookSecret } = validated.data;

    const upserts = [
      db.systemSetting.upsert({
        where: { key: "RAZORPAY_ENABLED" },
        update: { value: String(razorpayEnabled) },
        create: {
          key: "RAZORPAY_ENABLED",
          value: String(razorpayEnabled),
          description: "Toggles Razorpay Payment Gateway availability",
        },
      }),
    ];

    if (keyId !== undefined) {
      upserts.push(
        db.systemSetting.upsert({
          where: { key: "RAZORPAY_KEY_ID" },
          update: { value: keyId.trim() },
          create: {
            key: "RAZORPAY_KEY_ID",
            value: keyId.trim(),
            description: "Razorpay Key ID for client checkout",
          },
        })
      );
    }

    if (keySecret && !keySecret.includes("••••")) {
      upserts.push(
        db.systemSetting.upsert({
          where: { key: "RAZORPAY_KEY_SECRET" },
          update: { value: keySecret.trim() },
          create: {
            key: "RAZORPAY_KEY_SECRET",
            value: keySecret.trim(),
            description: "Razorpay Key Secret for server verification",
          },
        })
      );
    }

    if (webhookSecret && !webhookSecret.includes("••••")) {
      upserts.push(
        db.systemSetting.upsert({
          where: { key: "RAZORPAY_WEBHOOK_SECRET" },
          update: { value: webhookSecret.trim() },
          create: {
            key: "RAZORPAY_WEBHOOK_SECRET",
            value: webhookSecret.trim(),
            description: "Razorpay Webhook Secret for signature validation",
          },
        })
      );
    }

    await db.$transaction(upserts);

    return apiSuccess({
      message: "Payment settings updated successfully",
      razorpayEnabled,
    });
  } catch (error) {
    console.error("[API Admin Payment Settings POST]", error);
    return apiError("Failed to update payment settings", 500);
  }
}
