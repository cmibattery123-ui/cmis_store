import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({
      where: { userId: dbUser.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!dealer) {
      return apiSuccess({
        dealer: null,
        totalOrders: 0,
        totalSpent: 0,
        pendingQuotations: 0,
        recentOrders: [],
      });
    }

    const [totalOrders, totalSpent, pendingQuotations, recentOrders] = await Promise.all([
      db.order.count({ where: { userId: dbUser.id } }).catch(() => 0),
      db.payment.aggregate({
        where: { order: { userId: dbUser.id }, status: "PAID" },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      db.quotation.count({ where: { dealerId: dealer.id, status: "PENDING" } }).catch(() => 0),
      db.order.findMany({
        where: { userId: dbUser.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { productName: true, quantity: true, totalPrice: true } },
          payment: { select: { status: true } },
        },
      }).catch(() => []),
    ]);

    return apiSuccess({
      dealer,
      totalOrders,
      totalSpent: Number(totalSpent._sum?.amount ?? 0),
      pendingQuotations,
      recentOrders,
    });
  } catch (error) {
    console.error("[dealer_dashboard_get]", error);
    return apiError("Internal server error", 500);
  }
}
