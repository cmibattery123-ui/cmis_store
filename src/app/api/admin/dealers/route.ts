import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status");

    const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : {};

    const [dealers, total] = await Promise.all([
      db.dealer.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, createdAt: true } },
          _count: { select: { quotations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dealer.count({ where }),
    ]);

    return apiSuccess({
      dealers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id, status, creditLimit, discountPercent, notes } = await request.json();
    if (!id || !status) return apiError("Missing required fields", 400);

    const dealer = await db.dealer.update({
      where: { id },
      data: {
        status,
        ...(creditLimit !== undefined && { creditLimit }),
        ...(discountPercent !== undefined && { discountPercent }),
        ...(notes !== undefined && { notes }),
        ...(status === "APPROVED" && {
          approvedAt: new Date(),
          approvedById: session.user.id,
        }),
      },
    });

    return apiSuccess(dealer);
  } catch {
    return apiError("Internal server error", 500);
  }
}
