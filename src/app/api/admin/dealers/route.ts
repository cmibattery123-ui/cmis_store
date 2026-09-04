import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { updateDealerStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
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
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validated = updateDealerStatusSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Invalid dealer status update payload", 400);
    }

    const { id, status, creditLimit, discountPercent, notes } = validated.data;

    const existingDealer = await db.dealer.findUnique({
      where: { id },
    });
    if (!existingDealer) {
      return apiError("Dealer not found", 404);
    }

    const updatedDealer = await db.$transaction(async (tx: DbTransaction) => {
      const dealer = await tx.dealer.update({
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
          ...(status !== "APPROVED" && {
            approvedAt: null,
            approvedById: null,
          }),
        },
        include: { user: true },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: dealer.userId },
          data: { role: "DEALER" },
        });

        await tx.notification.create({
          data: {
            userId: dealer.userId,
            type: "DEALER",
            title: "Dealer Application Approved",
            message: "Congratulations! Your dealer application has been approved. You can now access dealer pricing and place bulk orders.",
            link: "/dealer/dashboard",
          },
        });
      }

      return dealer;
    });

    return apiSuccess(updatedDealer);
  } catch (error) {
    console.error("[API Admin Dealers PATCH Error]", error);
    return apiError("Internal server error", 500);
  }
}
