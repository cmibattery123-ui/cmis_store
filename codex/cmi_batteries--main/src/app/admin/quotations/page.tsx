import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Eye } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const statusColors: Record<string, string> = {
  PENDING:  "bg-yellow-400/10 text-yellow-400",
  APPROVED: "bg-green-400/10 text-green-400",
  REJECTED: "bg-red-400/10 text-red-400",
  EXPIRED:  "bg-gray-400/10 text-gray-400",
};

const statuses = ["PENDING","APPROVED","REJECTED","EXPIRED"];

export default async function AdminQuotationsPage({ searchParams }: PageProps) {
  const { page: pageParam, status } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" } : {};

  const [quotations, total] = await Promise.all([
    db.quotation.findMany({
      where,
      include: {
        dealer: {
          select: { businessName: true, user: { select: { name: true, email: true } } },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.quotation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Quotations</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total quotations</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/admin/quotations" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!status ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>All</Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/quotations?status=${s}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === s ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>{s}</Link>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="text-left p-4">Quotation #</th>
                <th className="text-left p-4">Dealer</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Valid Until</th>
                <th className="text-left p-4">Date</th>
                <th className="text-right p-4">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No quotations found</td></tr>
              )}
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-primary text-xs">{q.quotationNo}</td>
                  <td className="p-4">
                    <p className="text-white">{q.dealer.businessName}</p>
                    <p className="text-gray-500 text-xs">{q.dealer.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-400">{q._count.items} items</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[q.status] ?? ""}`}>{q.status}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{q.validUntil ? formatDate(q.validUntil) : "—"}</td>
                  <td className="p-4 text-gray-400 text-xs">{formatDate(q.createdAt)}</td>
                  <td className="p-4 text-right text-white">{formatCurrency(Number(q.totalAmount))}</td>
                  <td className="p-4">
                    <Link href={`/admin/quotations/${q.id}`} className="text-gray-500 hover:text-primary transition-colors">
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
            <Link key={p} href={`/admin/quotations?page=${p}${status ? `&status=${status}` : ""}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${p === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"}`}
            >{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
