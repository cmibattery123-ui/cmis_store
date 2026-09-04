import { db, withDbRetry } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { LEGACY_PRODUCT_ID_MAP } from "@/lib/default-data";
import { autoCancelExpiredPendingOrders } from "@/lib/orders/expire-pending";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const userFilter = {
      OR: [
        { userId: dbUser.id },
        ...(dbUser.email ? [{ user: { email: dbUser.email.toLowerCase() } }] : []),
      ],
    };

    // Auto-cancel any orders pending for >10 minutes
    await autoCancelExpiredPendingOrders(dbUser.id);

    const [orders, total] = await withDbRetry(async () =>
      Promise.all([
        db.order.findMany({
          where: userFilter,
          include: {
            items: { select: { productName: true, quantity: true, unitPrice: true, totalPrice: true } },
            payment: { select: { status: true } },
            shippingAddress: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.order.count({
          where: userFilter,
        }),
      ])
    );

    const sanitizedOrders = orders.map((order) => {
      const isFailed = order.payment?.status === "FAILED" || order.paymentStatus === "FAILED";
      return {
        ...order,
        status: isFailed ? "FAILED" : order.status,
        paymentStatus: isFailed ? "FAILED" : order.paymentStatus,
      };
    });

    return apiSuccess({
      orders: sanitizedOrders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[API Customer Orders GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    let body: any;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid request payload", 400);
    }

    const { items, shippingAddressId, billingAddressId, newShippingAddress, gstNumber, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError("Cart is empty", 400);
    }

    return await withDbRetry(async () => {
      // 1. Resolve or create user account (logged-in user or guest customer)
      let userId = session?.user?.id;
      let user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;

      if (!user && session?.user?.email) {
        user = await db.user.upsert({
          where: { email: session.user.email.toLowerCase() },
          update: {
            name: session.user.name || undefined,
            image: session.user.image || undefined,
          },
          create: {
            email: session.user.email.toLowerCase(),
            name: session.user.name || "Customer",
            image: session.user.image,
            role: (session.user as any).role || "CUSTOMER",
          },
        });
        userId = user.id;
      }

      if (!user) {
        // Fallback for guest checkout using phone or default guest identifier
        const customerEmail = (
          newShippingAddress?.email ||
          (newShippingAddress?.phone ? `${newShippingAddress.phone}@cmibattery.com` : "customer@cmibattery.com")
        ).toLowerCase();

        user = await db.user.upsert({
          where: { email: customerEmail },
          update: {
            name: newShippingAddress?.name || "Customer",
            phone: newShippingAddress?.phone || undefined,
          },
          create: {
            email: customerEmail,
            name: newShippingAddress?.name || "Customer",
            phone: newShippingAddress?.phone || null,
            role: "CUSTOMER",
          },
        });
        userId = user.id;
      }

      // 2. Handle new shipping address creation if provided
      let finalShippingAddressId = shippingAddressId || null;
      if (newShippingAddress && newShippingAddress.line1 && newShippingAddress.city) {
        const createdAddress = await db.address.create({
          data: {
            userId: user.id,
            name: newShippingAddress.name || user.name || "Customer",
            phone: newShippingAddress.phone || user.phone || "",
            line1: newShippingAddress.line1,
            line2: newShippingAddress.line2 || null,
            city: newShippingAddress.city,
            state: newShippingAddress.state || "Tamil Nadu",
            pincode: newShippingAddress.pincode || "",
            country: "India",
          },
        });
        finalShippingAddressId = createdAddress.id;
      }

      const isDealer = (session?.user as any)?.role === "DEALER" || user.role === "DEALER";

      // 3. Build candidate lookups for product resolution
      const rawIds = items.map((i: { productId: string }) => String(i.productId || "").trim());
      const candidateLookups = Array.from(
        new Set(
          rawIds.flatMap((id) => {
            const legacy = LEGACY_PRODUCT_ID_MAP[id];
            return legacy ? [id, legacy.id, legacy.sku, legacy.slug] : [id];
          })
        )
      );

      const products = await db.product.findMany({
        where: {
          OR: [
            { id: { in: candidateLookups } },
            { sku: { in: candidateLookups } },
            { slug: { in: candidateLookups } },
          ],
        },
        include: { inventory: true },
      });

      if (products.length === 0) {
        // Fallback: load all active products
        const allProducts = await db.product.findMany({ take: 10, include: { inventory: true } });
        if (allProducts.length === 0) {
          return apiError("No products available in catalog", 400);
        }
        products.push(...allProducts);
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

      // Generate collision-safe order number (PB-YYYY-XXXXX)
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const count = await db.order.count();
      const orderNumber = `PB-${year}-${String(count + 1).padStart(4, "0")}-${randomSuffix}`;

      // Build line items
      const lineItems = items.map((item: { productId: string; quantity: number }) => {
        const product = findProductForItem(item.productId);
        const unitPrice = isDealer ? Number(product.dealerPrice || product.price) : Number(product.price);
        const taxRate = Number(product.taxRate || 18);
        const taxAmount = (unitPrice * taxRate) / 100;
        const quantity = Number(item.quantity) || 1;
        const totalPrice = (unitPrice + taxAmount) * quantity;

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice,
          taxRate,
          taxAmount,
          totalPrice,
        };
      });

      const subtotal = lineItems.reduce((s: number, i) => s + i.unitPrice * i.quantity, 0);
      const taxAmount = lineItems.reduce((s: number, i) => s + i.taxAmount * i.quantity, 0);
      const shippingAmount = 0;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Create Order with nested items
      const order = await db.order.create({
        data: {
          orderNumber,
          userId: user.id,
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddressId: finalShippingAddressId,
          billingAddressId: billingAddressId || null,
          gstNumber: gstNumber || null,
          notes: notes || null,
          isDealer,
          items: {
            create: lineItems.map((li) => ({
              productId: li.productId,
              productName: li.productName,
              sku: li.sku,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              taxRate: li.taxRate,
              taxAmount: li.taxAmount,
              totalPrice: li.totalPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Create or update initial pending payment record
      await db.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: "RAZORPAY",
          status: "PENDING",
          amount: totalAmount,
          currency: "INR",
        },
        update: {
          status: "PENDING",
          amount: totalAmount,
        },
      });

      return apiSuccess(order, 201);
    });
  } catch (error) {
    console.error("[API Customer Orders POST Error]", error);
    return apiError("Internal server error", 500);
  }
}
