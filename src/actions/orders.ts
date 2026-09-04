"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { actionSuccess, actionError, generateOrderNumber, type ActionResult } from "@/lib/utils/api";
import { checkoutSchema } from "@/lib/validations";
import { paymentService } from "@/services/payments/payment-service";
import { revalidatePath } from "next/cache";
import { LEGACY_PRODUCT_ID_MAP } from "@/lib/default-data";

// ============================================================
// CREATE ORDER FROM CART
// ============================================================

export async function createOrder(
  cartItems: { productId: string; quantity: number }[],
  checkoutData: unknown
): Promise<ActionResult<{ orderId: string; paymentOrder: unknown }>> {
  try {
    const session = await auth();
    if (!session?.user) return actionError("Please log in to checkout");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return actionError("Your cart is empty");
    }

    const validated = checkoutSchema.safeParse(checkoutData);
    if (!validated.success) {
      return actionError("Invalid checkout data", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { shippingAddressId, billingAddressId, gstNumber, notes } = validated.data;

    // Build candidate lookups for product resolution
    const rawIds = cartItems.map((i) => String(i.productId || "").trim()).filter(Boolean);
    if (rawIds.length === 0) {
      return actionError("Invalid items in cart");
    }

    const candidateLookups = Array.from(
      new Set(
        rawIds.flatMap((id) => {
          const legacy = LEGACY_PRODUCT_ID_MAP[id];
          return legacy ? [id, legacy.id, legacy.sku, legacy.slug] : [id];
        })
      )
    );

    // Fetch product prices
    const products = await db.product.findMany({
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

    if (products.length === 0) {
      return actionError("Some products are unavailable");
    }

    function findProductForItem(itemProductId: string) {
      const legacy = LEGACY_PRODUCT_ID_MAP[itemProductId];
      return (
        products.find((p) => p.id === itemProductId) ||
        (legacy ? products.find((p) => p.id === legacy.id || p.sku === legacy.sku || p.slug === legacy.slug) : null) ||
        products.find((p) => p.sku === itemProductId) ||
        products.find((p) => p.slug === itemProductId) ||
        products[0]
      );
    }

    const isDealer = session.user.role === "DEALER";

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const orderItems = cartItems.map((item) => {
      const product = findProductForItem(item.productId);
      const unitPrice = isDealer ? Number(product.dealerPrice || product.price) : Number(product.price);
      const tax = (unitPrice * Number(product.taxRate || 18)) / 100;
      const itemTotal = (unitPrice + tax) * item.quantity;
      subtotal += unitPrice * item.quantity;
      taxAmount += tax * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        taxRate: Number(product.taxRate || 18),
        taxAmount: tax * item.quantity,
        totalPrice: itemTotal,
      };
    });

    const shippingAmount = 0; // Free shipping
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate sequential order number
    const orderCount = await db.order.count();

    // Create order in DB
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(orderCount + 1),
        userId: session.user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        shippingAddressId,
        billingAddressId,
        gstNumber: gstNumber || null,
        notes,
        isDealer,
        items: { create: orderItems },
        payment: {
          create: {
            status: "PENDING",
            amount: totalAmount,
            provider: process.env.PAYMENT_PROVIDER === "razorpay" ? "RAZORPAY" : "MOCK",
          },
        },
      },
    });

    // Create payment order with provider
    const paymentOrder = await paymentService.createPayment(order.id);

    revalidatePath("/customer/orders");
    return actionSuccess({ orderId: order.id, paymentOrder });
  } catch (error) {
    console.error("[createOrder]", error);
    return actionError("Failed to create order. Please try again.");
  }
}

// ============================================================
// VERIFY PAYMENT & UPDATE ORDER
// ============================================================

export async function verifyPayment(params: {
  orderId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return actionError("Unauthorized");

    if (!params?.orderId || !params?.providerOrderId || !params?.providerPaymentId || !params?.signature) {
      return actionError("Missing required payment verification parameters");
    }

    const result = await paymentService.verifyPayment({
      orderId: params.orderId,
      providerOrderId: params.providerOrderId,
      providerPaymentId: params.providerPaymentId,
      signature: params.signature,
    });

    if (!result.success) {
      return actionError("Payment verification failed");
    }

    revalidatePath("/customer/orders");
    return actionSuccess(undefined, "Payment successful");
  } catch (error) {
    console.error("[verifyPayment]", error);
    return actionError("Failed to verify payment. Please try again.");
  }
}
