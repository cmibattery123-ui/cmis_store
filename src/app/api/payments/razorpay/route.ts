import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

/**
 * POST /api/payments/razorpay
 * Zero-Trust Razorpay Order Creation Endpoint
 * - Gateway Enablement Shield (checks RAZORPAY_ENABLED setting)
 * - Server-Driven Payable Amount calculation from database
 * - Prepares Razorpay Gateway Order for client checkout
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Gateway Enablement Shield
    const gatewaySetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_ENABLED" },
    });

    if (gatewaySetting && gatewaySetting.value === "false") {
      return apiError(
        "Razorpay Payment Gateway is currently disabled by administrator",
        403
      );
    }

    // 2. Authentication Check
    const session = await auth();
    if (!session || !session.user?.id) {
      return apiError("Unauthorized. Please log in to initiate payment.", 401);
    }

    // 3. Request Validation
    const body = await request.json();
    const validated = createRazorpayOrderSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Invalid request payload. Order ID is required.", 400);
    }

    const { orderId } = validated.data;

    // 4. Server-Driven Payable Amount Fetch (Zero-Trust)
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return apiError("Order not found or access denied.", 404);
    }

    if (order.paymentStatus === "PAID" || order.payment?.status === "PAID") {
      return apiError("This order has already been paid.", 400);
    }

    // Compute total payable strictly on server side in paise
    const totalAmountNum = Number(order.totalAmount);
    const amountInPaise = Math.round(totalAmountNum * 100);

    if (amountInPaise <= 0) {
      return apiError("Invalid order amount.", 400);
    }

    // 5. Fetch Key Credentials from DB or Environment
    const keyIdSetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_KEY_ID" },
    });
    const keySecretSetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_KEY_SECRET" },
    });

    const keyId =
      keyIdSetting?.value ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "";

    const keySecret =
      keySecretSetting?.value ||
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      "";

    let providerOrderId: string;
    let metadataObj: Record<string, unknown> = {};

    if (keyId && keySecret) {
      // Live Razorpay API order creation
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            userId: session.user.id,
            userEmail: session.user.email ?? "",
          },
        }),
      });

      if (!razorpayRes.ok) {
        const errorData = await razorpayRes.json();
        console.error("[Razorpay API Error]", errorData);
        return apiError(
          `Razorpay Order creation failed: ${errorData.error?.description || "Gateway Error"}`,
          502
        );
      }

      const razorpayOrder = await razorpayRes.json();
      providerOrderId = razorpayOrder.id;
      metadataObj = razorpayOrder;
    } else {
      // Development Fallback Mock Order ID
      providerOrderId = `rzp_order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      metadataObj = { mock: true, generatedAt: new Date().toISOString() };
    }

    // 6. Idempotent Payment Record Mutation
    await db.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: keyId && keySecret ? "RAZORPAY" : "MOCK",
        providerOrderId,
        status: "PENDING",
        amount: order.totalAmount,
        currency: "INR",
        metadata: JSON.stringify(metadataObj),
      },
      update: {
        provider: keyId && keySecret ? "RAZORPAY" : "MOCK",
        providerOrderId,
        status: "PENDING",
        amount: order.totalAmount,
        currency: "INR",
        metadata: JSON.stringify(metadataObj),
      },
    });

    return apiSuccess({
      orderId: order.id,
      orderNumber: order.orderNumber,
      providerOrderId,
      razorpayOrderId: providerOrderId,
      amount: totalAmountNum,
      amountInPaise,
      currency: "INR",
      keyId,
    });
  } catch (error) {
    console.error("[API Payments Razorpay POST]", error);
    return apiError("Internal payment creation error", 500);
  }
}
