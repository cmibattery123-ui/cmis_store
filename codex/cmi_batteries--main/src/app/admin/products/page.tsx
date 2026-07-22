import { db } from "@/lib/db";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { Plus, Search } from "lucide-react";
import ProductListClient from "./ProductListClient";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { page: pageParam, search = "" } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 20;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        inventory: { select: { quantity: true, lowStockThreshold: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary text-black font-heading font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <form className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or SKU…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
        />
      </form>

      {/* Table */}
      {/* Table Client Component */}
      <ProductListClient initialProducts={products} search={search} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}&search=${search}`}
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
