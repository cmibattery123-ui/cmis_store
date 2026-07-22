import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Search, Users } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { page: pageParam, search = "", role } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = {
    ...(role ? { role: role as "CUSTOMER" | "DEALER" | "ADMIN" } : { role: "CUSTOMER" as const }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Customers</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} registered customers</p>
      </div>

      {/* Search + role filter */}
      <div className="flex gap-3 flex-wrap">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or email…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
          />
        </form>
        <div className="flex gap-2">
          {["CUSTOMER", "DEALER", "ADMIN"].map((r) => (
            <Link
              key={r}
              href={`/admin/customers?role=${r}`}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                role === r || (!role && r === "CUSTOMER")
                  ? "bg-primary text-black"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Orders</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No customers found
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white font-medium">{u.name ?? "—"}</td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4 text-gray-400">{u.phone ?? "—"}</td>
                  <td className="p-4 text-gray-400">{u._count.orders}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.isActive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                    }`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
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
              href={`/admin/customers?page=${p}&search=${search}${role ? `&role=${role}` : ""}`}
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
