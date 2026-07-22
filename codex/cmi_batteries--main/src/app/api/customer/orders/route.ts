import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, generateOrderNumber } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: { select: { productName: true, quantity: true, unitPrice: true, totalPrice: true } },
          payment: { select: { status: true } },
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where: { userId: session.user.id } }),
    ]);

    return apiSuccess({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { items, shippingAddressId, billingAddressId, gstNumber, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError("Cart is empty", 400);
    }

    const isDealer = session.user.role === "DEALER";

    // Fetch products with pricing
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { inventory: true },
    });

    if (products.length !== productIds.length) {
      return apiError("One or more products are unavailable", 400);
    }

    // Generate order number
    const count = await db.order.count();
    const orderNumber = generateOrderNumber(count + 1);

    // Build line items
    const lineItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = isDealer ? Number(product.dealerPrice) : Number(product.price);
      const taxRate = Number(product.taxRate);
      const taxAmount = (unitPrice * taxRate) / 100;
      const totalPrice = (unitPrice + taxAmount) * item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount: (unitPrice * taxRate) / 100,
        totalPrice,
      };
    });

    const subtotal = lineItems.reduce((s: number, i: typeof lineItems[0]) => s + i.unitPrice * i.quantity, 0);
    const taxAmount = lineItems.reduce((s: number, i: typeof lineItems[0]) => s + i.taxAmount * i.quantity, 0);
    const shippingAmount = subtotal >= 5000 ? 0 : 150;
    const totalAmount = subtotal + taxAmount + shippingAmount;

    const order = await db.$transaction(async (tx: DbTransaction) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddressId: shippingAddressId || null,
          billingAddressId: billingAddressId || null,
          gstNumber: gstNumber || null,
          notes: notes || null,
          isDealer,
          items: { create: lineItems },
        },
        include: { items: true },
      });

      // Reserve inventory
      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { reservedQuantity: { increment: item.quantity } },
        });
      }

      // Create pending payment record
      await tx.payment.create({
        data: {
          orderId: o.id,
          provider: "MOCK",
          status: "PENDING",
          amount: totalAmount,
          currency: "INR",
        },
      });

      return o;
    });

    return apiSuccess(order, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}
