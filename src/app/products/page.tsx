import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProductCatalogClient from "@/components/products/ProductCatalogClient";
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from "@/lib/default-data";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Products | Perfect Batteries",
  description:
    "Browse our full range of high-performance non-maintenance lithium batteries for vehicles, inverters, and UPS systems.",
};

async function getInitialData() {
  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true, lowStockThreshold: true } },
          specs: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    if (products && products.length > 0) {
      const serialized = products.map((p) => ({
        ...p,
        price: Number(p.price),
        dealerPrice: Number(p.dealerPrice),
        taxRate: Number(p.taxRate),
      }));
      return { products: serialized as any, categories };
    }
  } catch {
    // Fallback for static builds
  }

  return {
    products: DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
  };
}

export default async function ProductsPage() {
  const { products, categories } = await getInitialData();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      <ProductCatalogClient
        initialProducts={products as any}
        initialCategories={categories as any}
      />
      <Footer />
    </main>
  );
}
