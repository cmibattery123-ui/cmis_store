"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { actionSuccess, actionError, generateOrderNumber, type ActionResult } from "@/lib/utils/api";
import { checkoutSchema } from "@/lib/validations";
import { paymentService } from "@/services/payments/payment-service";
import { revalidatePath } from "next/cache";

// ============================================================
// CREATE ORDER FROM CART
// ============================================================

export async function createOrder(
  cartItems: { productId: string; quantity: number }[],
  checkoutData: unknown
): Promise<ActionResult<{ orderId: string; paymentOrder: unknown }>> {
  const session = await auth();
  if (!session?.user) return actionError("Please log in to checkout");

  const validated = checkoutSchema.safeParse(checkoutData);
  if (!validated.success) {
    return actionError("Invalid checkout data", validated.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { shippingAddressId, billingAddressId, gstNumber, notes } = validated.data;

  // Fetch product prices
  const products = await db.product.findMany({
    where: { id: { in: cartItems.map((i) => i.productId) }, isActive: true },
    include: { inventory: true },
  });

  if (products.length !== cartItems.length) {
    return actionError("Some products are unavailable");
  }

  const isDealer = session.user.role === "DEALER";

  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;
  const orderItems = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = isDealer ? Number(product.dealerPrice) : Number(product.price);
    const tax = (unitPrice * Number(product.taxRate)) / 100;
    const itemTotal = (unitPrice + tax) * item.quantity;
    subtotal += unitPrice * item.quantity;
    taxAmount += tax * item.quantity;

    return {
      productId: item.productId,
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice,
      taxRate: Number(product.taxRate),
      taxAmount: tax * item.quantity,
      totalPrice: itemTotal,
    };
  });

  const shippingAmount = subtotal >= 5000 ? 0 : 150; // Free shipping over ₹5000
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
  const session = await auth();
  if (!session?.user) return actionError("Unauthorized");

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
}
