import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { quotationRequestSchema } from "@/lib/validations/order";
import { generateQuotationNumber } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
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
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
    if (!dealer || dealer.status !== "APPROVED") {
      return apiError("Your dealer account must be approved to request quotations", 403);
    }

    const body = await request.json();
    const validated = quotationRequestSchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { notes, items } = validated.data;

    // Validate products exist and get dealer pricing
    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, name: true, dealerPrice: true, taxRate: true },
    });

    if (products.length !== productIds.length) {
      return apiError("One or more products are invalid or inactive", 400);
    }

    const productMap = new Map<string, typeof products[0]>(products.map((p) => [p.id, p]));

    // Generate quotation number
    const count = await db.quotation.count();
    const quotationNo = generateQuotationNumber(count + 1);

    // Build line items
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.dealerPrice);
      const taxRate = Number(product.taxRate);
      const taxAmount = (unitPrice * taxRate) / 100;
      const totalPrice = (unitPrice + taxAmount) * item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount: (unitPrice * taxRate) / 100,
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
