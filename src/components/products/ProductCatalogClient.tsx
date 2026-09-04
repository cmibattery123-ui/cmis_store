"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, SlidersHorizontal, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_CATEGORIES,
  DefaultProduct,
  DefaultCategory,
} from "@/lib/default-data";
import { apiUrl } from "@/lib/api";

export default function ProductCatalogClient({
  initialProducts,
  initialCategories,
}: {
  initialProducts?: DefaultProduct[];
  initialCategories?: DefaultCategory[];
}) {
  const [products, setProducts] = useState<DefaultProduct[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : DEFAULT_PRODUCTS
  );
  const [categories, setCategories] = useState<DefaultCategory[]>(
    initialCategories && initialCategories.length > 0 ? initialCategories : DEFAULT_CATEGORIES
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("sortOrder:asc");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Sync with API only if initial data was missing/empty
  useEffect(() => {
    const hasInitialData = initialProducts && initialProducts.length > 0 && initialCategories && initialCategories.length > 0;
    if (hasInitialData) return;

    let isMounted = true;
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(apiUrl("/api/products")),
          fetch(apiUrl("/api/categories")),
        ]);

        if (prodRes.ok && isMounted) {
          const prodJson = await prodRes.json();
          if (prodJson?.data?.products?.length > 0) {
            setProducts(prodJson.data.products);
          }
        }

        if (catRes.ok && isMounted) {
          const catJson = await catRes.json();
          if (catJson?.data?.length > 0) {
            setCategories(catJson.data);
          }
        }
      } catch {
        // Fallback already loaded
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialProducts, initialCategories]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (
          category &&
          product.categoryId !== category &&
          product.category?.id !== category &&
          product.category?.slug !== category
        ) {
          return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchDesc = (product.shortDesc || product.description || "").toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "price:asc") return a.price - b.price;
        if (sort === "price:desc") return b.price - a.price;
        if (sort === "name:asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, category, search, sort]);

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

  return (
    <>
      {/* Header - Apple Style */}
      <section className="bg-[#F5F5F7] dark:bg-[#000000] border-b border-black/[0.06] dark:border-white/[0.08] pt-36 pb-14 px-4 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#86868B] text-xs mb-3">
            <Link href="/" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">Store</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
            All Battery Models.
          </h1>
          <p className="text-[#6E6E73] dark:text-[#86868B] mt-2 text-base font-normal">
            {total} high-performance lithium and inverter battery models available.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 bg-[#F5F5F7] dark:bg-[#000000]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] p-6 sticky top-24 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-primary" />
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs uppercase tracking-wider">
                  Filters
                </span>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Model, name, SKU..."
                    className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.1] rounded-full pl-9 pr-4 py-2.5 text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] text-xs focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.1] rounded-full px-4 py-2.5 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.1] rounded-full px-4 py-2.5 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="sortOrder:asc" className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Recommended
                  </option>
                  <option value="price:asc" className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Price: Low to High
                  </option>
                  <option value="price:desc" className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Price: High to Low
                  </option>
                  <option value="name:asc" className="bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Name: A–Z
                  </option>
                </select>
              </div>

              {(search || category || sort !== "sortOrder:asc") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setSort("sortOrder:asc");
                    setPage(1);
                  }}
                  className="w-full bg-primary text-black font-semibold py-2.5 rounded-full mt-3 hover:bg-yellow-300 transition-colors text-xs shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-[28px] bg-white dark:bg-[#161617] border border-dashed border-black/[0.06] dark:border-white/[0.1]">
                <Package className="w-12 h-12 text-[#86868B] mb-4" />
                <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">No Products Found</h3>
                <p className="text-[#6E6E73] dark:text-[#86868B] mt-1 text-sm font-normal">Try adjusting your search query or category filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => {
                    const primaryImage =
                      product.images?.find((img) => img.isPrimary)?.url ||
                      product.images?.[0]?.url ||
                      "";
                    const inStock = (product.inventory?.quantity ?? 1) > 0;

                    return (
                      <Link href={`/products/${product.slug}`} key={product.id} className="group">
                        <div className="h-full flex flex-col justify-between rounded-[24px] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] p-6 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1">
                          {/* Image Container */}
                          <div className="relative aspect-square w-full rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center p-6 mb-5 overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                width={220}
                                height={220}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-contain max-h-[160px] drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="w-12 h-12 text-[#86868B]" />
                              </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-3 right-3">
                              {inStock ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-black/[0.06] dark:border-white/10 text-[10px] font-semibold text-amber-600 dark:text-primary shadow-sm">
                                  In Stock
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[11px] font-semibold text-amber-600 dark:text-primary mb-1">
                                {product.category?.name || "LiFePO4 Battery"}
                              </div>
                              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors line-clamp-2 mb-1.5 tracking-tight">
                                {product.name}
                              </h3>
                              {product.shortDesc && (
                                <p className="text-[#6E6E73] dark:text-[#86868B] text-xs line-clamp-2 leading-relaxed mb-4 font-normal">
                                  {product.shortDesc}
                                </p>
                              )}
                            </div>

                            {/* Price & Specs link */}
                            <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                              <div>
                                <div className="text-[10px] text-[#86868B]">
                                  {product.sku || "CMI-SERIES"}
                                </div>
                                <div className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                                  {formatCurrency(Number(product.price))}
                                </div>
                              </div>

                              <span className="px-3.5 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#242426] border border-black/[0.06] dark:border-white/[0.08] group-hover:bg-primary group-hover:text-black group-hover:border-transparent text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all shadow-sm">
                                View Specs
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                          p === page
                            ? "bg-primary text-black shadow-sm"
                            : "bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#86868B] hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
