import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const [
      totalOrders,
      totalRevenue,
      pendingQuotations,
      lowStockCount,
      totalCustomers,
      recentOrders,
      pendingDealers,
    ] = await Promise.all([
      db.order.count().catch(() => 0),
      db.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      db.quotation.count({ where: { status: "PENDING" } }).catch(() => 0),
      db.inventory.count({ where: { quantity: { lte: 10 } } }).catch(() => 0),
      db.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }).catch(() => []),
      db.dealer.count({ where: { status: "PENDING" } }).catch(() => 0),
    ]);

    return apiSuccess({
      totalOrders,
      totalRevenue: Number(totalRevenue._sum?.amount ?? 0),
      pendingQuotations,
      lowStockCount,
      totalCustomers,
      recentOrders,
      pendingDealers,
    });
  } catch (error) {
    console.error("[admin_dashboard_stats]", error);
    return apiError("Internal server error", 500);
  }
}
