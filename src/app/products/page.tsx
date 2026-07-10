import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, SlidersHorizontal, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Products | Perfect Batteries",
  description: "Browse our full range of high-performance non-maintenance lithium batteries for vehicles, inverters, and UPS systems.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

async function getProducts(searchParams: Awaited<PageProps["searchParams"]>) {
  const page = Number(searchParams.page ?? 1);
  const limit = 12;
  const search = searchParams.search ?? "";
  const categoryId = searchParams.category ?? undefined;
  const [sortBy, sortDir] = (searchParams.sort ?? "sortOrder:asc").split(":");

  const where = {
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { shortDesc: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true } },
        inventory: { select: { quantity: true } },
      },
      orderBy: { [sortBy ?? "sortOrder"]: sortDir ?? "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return { products, total, categories, page, totalPages: Math.ceil(total / limit) };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total, categories, page, totalPages } = await getProducts(params);

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      {/* Header */}
      <section className="bg-gradient-to-b from-black to-[#0A0A0A] border-b border-white/5 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Products</span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white">Our Product Range</h1>
          <p className="text-gray-400 mt-2">{total} products available</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="font-heading font-bold text-white text-sm uppercase tracking-widest">Filters</span>
              </div>

              {/* Search */}
              <form className="mb-5">
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    name="search"
                    defaultValue={params.search}
                    placeholder="Battery name, SKU…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Category */}
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 mt-4">Category</label>
                <select
                  name="category"
                  defaultValue={params.category ?? ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                  ))}
                </select>

                {/* Sort */}
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 mt-4">Sort By</label>
                <select
                  name="sort"
                  defaultValue={params.sort ?? "sortOrder:asc"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="sortOrder:asc" className="bg-[#111]">Recommended</option>
                  <option value="createdAt:desc" className="bg-[#111]">Newest First</option>
                  <option value="createdAt:asc" className="bg-[#111]">Oldest First</option>
                  <option value="price:asc" className="bg-[#111]">Price: Low to High</option>
                  <option value="price:desc" className="bg-[#111]">Price: High to Low</option>
                  <option value="name:asc" className="bg-[#111]">Name: A–Z</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-primary text-black font-bold py-2.5 rounded-xl mt-4 hover:bg-primary/90 transition-colors text-sm"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-heading font-bold text-white">No Products Found</h3>
                <p className="text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => {
                    const primaryImage = product.images[0]?.url;
                    const inStock = (product.inventory?.quantity ?? 0) > 0;

                    return (
                      <Link key={product.id} href={`/products/${product.slug}`}>
                        <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 hover:bg-white/8 transition-all duration-300">
                          <div className="aspect-video bg-white/5 relative overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="w-12 h-12 text-gray-700" />
                              </div>
                            )}
                            {!inStock && (
                              <div className="absolute top-3 left-3 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                Out of Stock
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="text-xs text-primary font-mono uppercase tracking-widest mb-1">
                              {product.category.name}
                            </div>
                            <h3 className="font-heading font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            {product.shortDesc && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.shortDesc}</p>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xl font-heading font-bold text-primary">
                                {formatCurrency(Number(product.price))}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/products?${new URLSearchParams({ ...params, page: String(p) })}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-black"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
