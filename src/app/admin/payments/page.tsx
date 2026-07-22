import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Eye } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const paymentColors: Record<string, string> = {
  PENDING:  "bg-yellow-400/10 text-yellow-400",
  PAID:     "bg-green-400/10 text-green-400",
  FAILED:   "bg-red-400/10 text-red-400",
  REFUNDED: "bg-gray-400/10 text-gray-400",
};

const statuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const { page: pageParam, status } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = status ? { status: status as "PENDING" | "PAID" | "FAILED" | "REFUNDED" } : {};

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      include: {
        order: { 
          select: { 
            orderNumber: true, 
            user: { select: { name: true, email: true } }
          }
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Payments</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total payments</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/payments"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !status ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/payments?status=${s}`}
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
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="p-4 font-medium">Provider ID</th>
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">No payments found</td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-xs text-gray-400 truncate max-w-[150px]">
                      {p.providerPaymentId || "—"}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">{p.provider}</p>
                  </td>
                  <td className="p-4 font-mono text-primary text-xs">
                    <Link href={`/admin/orders/${p.order.orderNumber}`} className="hover:underline">
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="text-white line-clamp-1">{p.order.user.name}</p>
                    <p className="text-gray-500 text-xs">{p.order.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentColors[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-white font-medium">
                    {formatCurrency(Number(p.amount))}
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${p.orderId}`} className="text-gray-500 hover:text-primary transition-colors">
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/admin/payments?page=${pageNumber}${status ? `&status=${status}` : ""}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                pageNumber === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
