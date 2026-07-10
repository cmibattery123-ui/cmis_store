import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/api";
import { 
  TrendingUp, Users, ShoppingCart, CreditCard, 
  PackageSearch, AlertTriangle, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default async function AdminAnalyticsPage() {
  // Aggregate calculations
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
    }),
    db.order.count(),
    db.dealer.count({ where: { status: "APPROVED" } }),
    db.product.count({
      where: {
        isActive: true,
        inventory: { quantity: { lte: 10 } } // threshold
      }
    }),
    db.order.findMany({
      where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } }
    }),
    db.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    })
  ]);

  const revenue = Number(totalRevenue._sum.amount ?? 0);

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(revenue),
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-400/10",
      link: "/admin/payments"
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      link: "/admin/orders"
    },
    {
      title: "Active Dealers",
      value: totalDealers.toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      link: "/admin/dealers"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      link: "/admin/inventory"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Analytics Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Performance metrics and high-level business intelligence.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <Link href={stat.link} className="text-gray-500 hover:text-white transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{stat.title}</p>
            </div>
            {/* Background decorative icon */}
            <stat.icon className={`absolute -bottom-4 -right-4 w-24 h-24 ${stat.color} opacity-[0.03] group-hover:scale-110 transition-transform duration-500`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <PackageSearch className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-white">Top Selling Products</h2>
          </div>
          <div className="p-5 flex-1">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm py-12">
                Not enough data to determine top products.
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{product.productName}</p>
                        <p className="text-xs text-gray-400">{product._sum.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{formatCurrency(Number(product._sum.totalPrice))}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Revenue Streams */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-white">Recent Order Activity</h2>
          </div>
          <div className="p-5 flex-1">
            {recentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm py-12">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-white">{order.user.name}</p>
                      <p className="text-xs font-mono text-gray-500">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(Number(order.totalAmount))}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
