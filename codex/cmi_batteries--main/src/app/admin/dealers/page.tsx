import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const statusConfig = {
  PENDING:  { color: "bg-yellow-400/10 text-yellow-400", icon: Clock },
  APPROVED: { color: "bg-green-400/10 text-green-400", icon: CheckCircle },
  REJECTED: { color: "bg-red-400/10 text-red-400", icon: XCircle },
  SUSPENDED:{ color: "bg-gray-400/10 text-gray-400", icon: XCircle },
};

const statuses = ["PENDING","APPROVED","REJECTED","SUSPENDED"];

export default async function AdminDealersPage({ searchParams }: PageProps) {
  const { page: pageParam, status } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = status ? { status: status as keyof typeof statusConfig } : {};

  const [dealers, total] = await Promise.all([
    db.dealer.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { quotations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.dealer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Dealer Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} dealers registered</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/dealers"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !status ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/dealers?status=${s}`}
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
                <th className="text-left p-4">Business</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">GST</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Quotations</th>
                <th className="text-left p-4">Applied</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {dealers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">No dealers found</td>
                </tr>
              )}
              {dealers.map((d) => {
                const cfg = statusConfig[d.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{d.businessName}</p>
                      <p className="text-gray-500 text-xs">{d.user.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-xs">{d.user.email}</p>
                      <p className="text-gray-500 text-xs">{d.phone}</p>
                    </td>
                    <td className="p-4 text-gray-300 text-xs">{d.city}, {d.state}</td>
                    <td className="p-4 text-gray-400 text-xs font-mono">{d.gstNumber ?? "—"}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium w-fit ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />{d.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{d._count.quotations}</td>
                    <td className="p-4 text-gray-500 text-xs">{formatDate(d.createdAt)}</td>
                    <td className="p-4">
                      <Link href={`/admin/dealers/${d.id}`} className="text-gray-500 hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/dealers?page=${p}${status ? `&status=${status}` : ""}`}
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
