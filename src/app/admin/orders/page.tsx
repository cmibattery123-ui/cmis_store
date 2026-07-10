import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Eye, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const statusColors: Record<string, string> = {
  PENDING:    "bg-yellow-400/10 text-yellow-400",
  CONFIRMED:  "bg-blue-400/10 text-blue-400",
  PROCESSING: "bg-indigo-400/10 text-indigo-400",
  SHIPPED:    "bg-purple-400/10 text-purple-400",
  DELIVERED:  "bg-green-400/10 text-green-400",
  CANCELLED:  "bg-red-400/10 text-red-400",
  REFUNDED:   "bg-gray-400/10 text-gray-400",
};

const paymentColors: Record<string, string> = {
  PENDING:  "bg-yellow-400/10 text-yellow-400",
  PAID:     "bg-green-400/10 text-green-400",
  FAILED:   "bg-red-400/10 text-red-400",
  REFUNDED: "bg-gray-400/10 text-gray-400",
};

const statuses = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page: pageParam, status } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = status ? { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Orders</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !status ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === s ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-right p-4">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">No orders found</td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-primary text-xs">{o.orderNumber}</td>
                  <td className="p-4">
                    <p className="text-white">{o.user.name}</p>
                    <p className="text-gray-500 text-xs">{o.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="p-4 text-gray-400">{o._count.items} item{o._count.items !== 1 ? "s" : ""}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {o.payment && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentColors[o.payment.status] ?? ""}`}>
                        {o.payment.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-white font-medium">{formatCurrency(Number(o.totalAmount))}</td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="text-gray-500 hover:text-primary transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                p === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
