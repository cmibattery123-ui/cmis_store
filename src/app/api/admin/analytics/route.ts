import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const [
      totalRevenue,
      totalOrders,
      totalDealers,
      lowStockProducts,
      recentOrders,
      topProducts
    ] = await Promise.all([
      db.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      db.order.count().catch(() => 0),
      db.dealer.count({ where: { status: "APPROVED" } }).catch(() => 0),
      db.inventory.count({ where: { quantity: { lte: 10 } } }).catch(() => 0),
      db.order.findMany({
        where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } }
      }).catch(() => []),
      db.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }).catch(() => [])
    ]);

    return apiSuccess({
      totalRevenue: Number(totalRevenue._sum?.amount ?? 0),
      totalOrders,
      totalDealers,
      lowStockProducts,
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error("[admin_analytics_get]", error);
    return apiError("Internal server error", 500);
  }
}
