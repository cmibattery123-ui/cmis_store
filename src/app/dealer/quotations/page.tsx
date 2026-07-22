import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const statusColors: Record<string, string> = {
  PENDING:  "bg-yellow-400/10 text-yellow-400",
  APPROVED: "bg-green-400/10 text-green-400",
  REJECTED: "bg-red-400/10 text-red-400",
  EXPIRED:  "bg-gray-400/10 text-gray-400",
};

export default async function DealerQuotationsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
  if (!dealer) return null;

  const { page: pageParam, status } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 10;

  const where = {
    dealerId: dealer.id,
    ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" }),
  };

  const [quotations, total] = await Promise.all([
    db.quotation.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.quotation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">My Quotations</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total quotations</p>
        </div>
        <Link
          href="/dealer/quotations/new"
          className="flex items-center gap-2 bg-primary text-black font-heading font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Request Quotation
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", "PENDING", "APPROVED", "REJECTED", "EXPIRED"].map((s) => (
          <Link
            key={s}
            href={`/dealer/quotations${s !== "All" ? `?status=${s}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (s === "All" && !status) || status === s
                ? "bg-primary text-black"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {quotations.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center">
          <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <h3 className="text-white font-medium">No Quotations Yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Request a quotation to get custom bulk pricing</p>
          <Link href="/dealer/quotations/new" className="inline-block bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
            Request Your First Quotation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-primary font-medium">{q.quotationNo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(q.createdAt)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[q.status] ?? ""}`}>
                  {q.status}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {q.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{formatCurrency(Number(item.totalPrice))}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-sm">
                  {q.validUntil && (
                    <span className="text-gray-500 text-xs">Valid until: {formatDate(q.validUntil)}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-white font-heading font-bold">{formatCurrency(Number(q.totalAmount))}</span>
                  <p className="text-gray-500 text-xs">incl. GST</p>
                </div>
              </div>

              {q.adminNotes && (
                <div className="mt-3 bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Admin Notes</p>
                  <p className="text-gray-300 text-sm">{q.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/dealer/quotations?page=${p}${status ? `&status=${status}` : ""}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${p === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"}`}
            >{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
