import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { quotationRequestSchema } from "@/lib/validations/order";
import { generateQuotationNumber } from "@/lib/utils/api";
import { LEGACY_PRODUCT_ID_MAP } from "@/lib/default-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({ where: { userId: dbUser.id } });
    if (!dealer) return apiError("Dealer account not found", 404);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where: { dealerId: dealer.id },
        include: {
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quotation.count({ where: { dealerId: dealer.id } }),
    ]);

    return apiSuccess({
      quotations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({ where: { userId: dbUser.id } });
    if (!dealer || dealer.status !== "APPROVED") {
      return apiError("Your dealer account must be approved to request quotations", 403);
    }

    const body = await request.json();
    const validated = quotationRequestSchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { notes, items } = validated.data;

    // Validate products exist and get dealer pricing
    const rawIds = items.map((i) => String(i.productId || "").trim());
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
        isActive: true,
      },
      select: { id: true, name: true, sku: true, slug: true, dealerPrice: true, taxRate: true },
    });

    if (products.length === 0) {
      return apiError("One or more products are invalid or inactive", 400);
    }

    function findProductForItem(itemProductId: string) {
      const legacy = LEGACY_PRODUCT_ID_MAP[itemProductId];
      return (
        products.find((p) => p.id === itemProductId) ||
        (legacy ? products.find((p) => p.id === legacy.id || p.sku === legacy.sku || p.slug === legacy.slug) : null) ||
        products.find((p) => p.sku === itemProductId) ||
        products.find((p) => p.slug === itemProductId)
      );
    }

    // Generate quotation number
    const count = await db.quotation.count();
    const quotationNo = generateQuotationNumber(count + 1);

    // Build line items
    const lineItems = items.map((item) => {
      const product = findProductForItem(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const unitPrice = Number(product.dealerPrice);
      const taxRate = Number(product.taxRate);
      const taxAmount = (unitPrice * taxRate) / 100;
      const totalPrice = (unitPrice + taxAmount) * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount,
        totalPrice,
      };
    });

    const subtotal = lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const taxAmount = lineItems.reduce((s, i) => s + i.taxAmount * i.quantity, 0);

    const quotation = await db.quotation.create({
      data: {
        quotationNo,
        dealerId: dealer.id,
        notes,
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        items: { create: lineItems },
      },
      include: { items: true },
    });

    return apiSuccess(quotation, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}
