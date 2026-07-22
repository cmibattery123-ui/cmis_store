import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils/api";
import {
  ShoppingCart, FileText, PackageSearch,
  Clock, CheckCircle, Wallet, Warehouse
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDealerStats(userId: string) {
  // First get the dealer record for this user
  const dealer = await db.dealer.findUnique({
    where: { userId },
  });

  if (!dealer) return null;

  const [
    totalOrders,
    totalSpent,
    pendingQuotations,
    recentOrders,
  ] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.payment.aggregate({
      where: { order: { userId }, status: "PAID" },
      _sum: { amount: true },
    }),
    db.quotation.count({ where: { dealerId: dealer.id, status: "PENDING" } }),
    db.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    dealer,
    totalOrders,
    totalSpent: Number(totalSpent._sum.amount ?? 0),
    pendingQuotations,
    recentOrders,
  };
}

export default async function DealerDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getDealerStats(session.user.id);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <h2 className="text-xl font-heading font-bold">Account Setup Pending</h2>
        <p className="text-gray-400">Your dealer application is not yet complete.</p>
        <Link href="/auth/dealer-register">
          <Button>Complete Registration</Button>
        </Link>
      </div>
    );
  }

  const widgets = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Quotations",
      value: stats.pendingQuotations.toLocaleString(),
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Dealer Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back, {stats.dealer.businessName}
        </p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-heading font-bold text-white">Recent Orders</h2>
              <Link href="/dealer/orders" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="text-left p-4">Order #</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">No recent orders</td>
                    </tr>
                  )}
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-primary">{order.orderNumber}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                          {order.status}
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

        <div className="space-y-4">
          <h3 className="font-heading font-bold text-white mb-4">Quick Actions</h3>
          
          <Link href="/dealer/products" className="block">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <PackageSearch className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-white">Browse Catalog</div>
                <div className="text-xs text-gray-400">View products with dealer pricing</div>
              </div>
            </div>
          </Link>

          <Link href="/dealer/quotations/new" className="block">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-white">Request Quotation</div>
                <div className="text-xs text-gray-400">Get custom bulk pricing</div>
              </div>
            </div>
          </Link>

          <Link href="/dealer/inventory" className="block">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-medium text-white">Check Inventory</div>
                <div className="text-xs text-gray-400">View live stock availability</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
