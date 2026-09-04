import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError, generateOrderNumber } from "@/lib/utils/api";
import { LEGACY_PRODUCT_ID_MAP } from "@/lib/default-data";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const gatewaySetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_ENABLED" },
    });

    if (gatewaySetting && gatewaySetting.value === "false") {
      return apiError("Razorpay Payment Gateway is currently disabled by administrator", 403);
    }

    const session = await auth(request);
    const body = await request.json();
    const validated = checkoutSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Invalid checkout request payload", 400);
    }

    const { productId, quantity, orderId } = validated.data;

    let targetOrderId = orderId;
    let targetOrderNumber = "";
    let totalAmount = 0;

    if (!targetOrderId) {
      if (!productId) {
        return apiError("Either productId or orderId must be provided", 400);
      }

      const legacy = LEGACY_PRODUCT_ID_MAP[productId];
      const candidateLookups = legacy
        ? [productId, legacy.id, legacy.sku, legacy.slug]
        : [productId];

      const product = await db.product.findFirst({
        where: {
          OR: [
            { id: { in: candidateLookups } },
            { sku: { in: candidateLookups } },
            { slug: { in: candidateLookups } },
          ],
          isActive: true,
        },
        include: { inventory: true },
      });

      if (!product) {
        return apiError("Product not found or inactive", 444);
      }

      if ((product.inventory?.quantity ?? 0) <= 0) {
        return apiError("Product is out of stock", 400);
      }

      // Ensure user ID (session user or guest user account)
      let userId = session?.user?.id;
      let user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;

      if (!user && session?.user?.email) {
        user = await db.user.upsert({
          where: { email: session.user.email.toLowerCase() },
          update: {},
          create: {
            email: session.user.email.toLowerCase(),
            name: session.user.name || "Customer",
            image: session.user.image,
            role: session.user.role || "CUSTOMER",
          },
        });
      }

      if (!user) {
        user = await db.user.upsert({
          where: { email: "guest@cmibattery.com" },
          update: {},
          create: {
            email: "guest@cmibattery.com",
            name: "Guest Customer",
            role: "CUSTOMER",
          },
        });
      }
      userId = user.id;

      const count = await db.order.count();
      const orderNumber = generateOrderNumber(count + 1);
      const unitPrice = Number(product.price);
      const taxRate = Number(product.taxRate);
      const taxAmount = (unitPrice * taxRate) / 100;
      const subtotal = unitPrice * quantity;
      const totalTax = taxAmount * quantity;
      const shippingAmount = 0;
      const finalAmount = subtotal + totalTax + shippingAmount;

      const order = await db.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          taxAmount: totalTax,
          shippingAmount,
          totalAmount: finalAmount,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity,
                unitPrice,
                taxRate,
                taxAmount,
                totalPrice: (unitPrice + taxAmount) * quantity,
              },
            ],
          },
        },
      });

      targetOrderId = order.id;
      targetOrderNumber = order.orderNumber;
      totalAmount = finalAmount;
    } else {
      const order = await db.order.findUnique({
        where: { id: targetOrderId },
        include: { user: true },
      });
      if (!order) return apiError("Order not found", 404);

      if (!session?.user?.id) {
        return apiError("Unauthorized", 401);
      }

      const isAuthorized =
        order.userId === session.user.id ||
        (session.user.email && order.user?.email?.toLowerCase() === session.user.email.toLowerCase()) ||
        session.user.role === "ADMIN";

      if (!isAuthorized) {
        return apiError("Unauthorized for this order", 403);
      }

      targetOrderNumber = order.orderNumber;
      totalAmount = Number(order.totalAmount);
    }

    const amountInPaise = Math.round(totalAmount * 100);

    // Key settings
    const keyIdSetting = await db.systemSetting.findUnique({ where: { key: "RAZORPAY_KEY_ID" } });
    const keySecretSetting = await db.systemSetting.findUnique({ where: { key: "RAZORPAY_KEY_SECRET" } });

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
          receipt: targetOrderNumber,
        }),
      });

      if (!razorpayRes.ok) {
        const errorData = await razorpayRes.json();
        return apiError(`Razorpay order creation failed: ${errorData.error?.description || "Gateway error"}`, 502);
      }

      const razorpayOrder = await razorpayRes.json();
      providerOrderId = razorpayOrder.id;
      metadataObj = razorpayOrder;
    } else {
      providerOrderId = `rzp_order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      metadataObj = { mock: true, generatedAt: new Date().toISOString() };
    }

    await db.payment.upsert({
      where: { orderId: targetOrderId },
      create: {
        orderId: targetOrderId,
        provider: keyId && keySecret ? "RAZORPAY" : "MOCK",
        providerOrderId,
        status: "PENDING",
        amount: totalAmount,
        currency: "INR",
        metadata: JSON.stringify(metadataObj),
      },
      update: {
        provider: keyId && keySecret ? "RAZORPAY" : "MOCK",
        providerOrderId,
        status: "PENDING",
        amount: totalAmount,
        currency: "INR",
        metadata: JSON.stringify(metadataObj),
      },
    });

    return apiSuccess({
      orderId: targetOrderId,
      orderNumber: targetOrderNumber,
      providerOrderId,
      razorpayOrderId: providerOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: "INR",
      keyId,
    });
  } catch (error) {
    console.error("[API Checkout Razorpay POST]", error);
    return apiError("Internal server error", 500);
  }
}
