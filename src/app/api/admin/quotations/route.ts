import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

// GET /api/admin/quotations
export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status");

    const where = status ? { status: status as any } : {};

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where,
        include: {
          dealer: { select: { businessName: true, user: { select: { name: true, email: true, phone: true } } } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quotation.count({ where }),
    ]);

    return apiSuccess({
      quotations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

// PATCH /api/admin/quotations
export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id, status, adminNotes } = await request.json();
    if (!id || !status) return apiError("Missing required fields", 400);

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    return apiSuccess(quotation);
  } catch {
    return apiError("Internal server error", 500);
  }
}
