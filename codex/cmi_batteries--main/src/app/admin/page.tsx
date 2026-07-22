import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/api";
import {
  Package, ShoppingCart, Users, TrendingUp,
  AlertTriangle, Clock, CheckCircle, DollarSign,
} from "lucide-react";

async function getDashboardStats() {
  const [
    totalOrders,
    totalRevenue,
    pendingQuotations,
    lowStockCount,
    totalCustomers,
    recentOrders,
    pendingDealers,
  ] = await Promise.all([
    db.order.count(),
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    db.quotation.count({ where: { status: "PENDING" } }),
    db.inventory.count({ where: { quantity: { lte: db.inventory.fields.lowStockThreshold } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    db.dealer.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    pendingQuotations,
    lowStockCount,
    totalCustomers,
    recentOrders,
    pendingDealers,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const widgets = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Pending Quotations",
      value: stats.pendingQuotations.toLocaleString(),
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Pending Dealers",
      value: stats.pendingDealers.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, Administrator</p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {widgets.map((w) => (
          <div key={w.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${w.bg}`}>
              <w.icon className={`w-6 h-6 ${w.color}`} />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-white">{w.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">{w.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-heading font-bold text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No orders yet</td>
                </tr>
              )}
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-primary">{order.orderNumber}</td>
                  <td className="p-4 text-white">{order.user.name ?? order.user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-gray-400/10 text-gray-400"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right text-white font-medium">
                    {formatCurrency(Number(order.totalAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
