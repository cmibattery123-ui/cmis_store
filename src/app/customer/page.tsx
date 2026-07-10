import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { ShoppingCart, Package, MapPin, Clock } from "lucide-react";
import Link from "next/link";

async function getCustomerStats(userId: string) {
  const [totalOrders, totalSpent, recentOrders, addressCount] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.payment.aggregate({
      where: { order: { userId }, status: "PAID" },
      _sum: { amount: true },
    }),
    db.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { select: { productName: true, quantity: true } } },
    }),
    db.address.count({ where: { userId } }),
  ]);

  return {
    totalOrders,
    totalSpent: Number(totalSpent._sum.amount ?? 0),
    recentOrders,
    addressCount,
  };
}

export default async function CustomerDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getCustomerStats(session.user.id);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-400/10 text-yellow-400",
    CONFIRMED: "bg-blue-400/10 text-blue-400",
    PROCESSING: "bg-blue-400/10 text-blue-400",
    SHIPPED: "bg-purple-400/10 text-purple-400",
    DELIVERED: "bg-green-400/10 text-green-400",
    CANCELLED: "bg-red-400/10 text-red-400",
    REFUNDED: "bg-gray-400/10 text-gray-400",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here&apos;s a summary of your account activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Total Spent", value: formatCurrency(stats.totalSpent), icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Saved Addresses", value: stats.addressCount, icon: MapPin, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-heading font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-white">Recent Orders</h2>
          </div>
          <Link href="/customer/orders" className="text-xs text-primary hover:underline">View All</Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Link href="/products" className="text-primary text-sm hover:underline mt-1 block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {stats.recentOrders.map((order) => (
              <Link key={order.id} href={`/customer/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-white font-medium font-mono">{order.orderNumber}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {order.items.map((i) => i.productName).join(", ").slice(0, 50)}…
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-400/10 text-gray-400"}`}>
                    {order.status}
                  </span>
                  <p className="text-white font-medium mt-1">{formatCurrency(Number(order.totalAmount))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/products" className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/40 transition-colors">
          <h3 className="font-medium text-white group-hover:text-primary transition-colors">Browse Products</h3>
          <p className="text-gray-400 text-sm mt-1">Explore our full catalog of batteries</p>
        </Link>
        <Link href="/warranty" className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/40 transition-colors">
          <h3 className="font-medium text-white group-hover:text-primary transition-colors">Warranty Support</h3>
          <p className="text-gray-400 text-sm mt-1">Learn about warranty terms and claims</p>
        </Link>
      </div>
    </div>
  );
}
