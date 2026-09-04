import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    if (products && products.length > 0) {
      return products.map((p) => ({ slug: p.slug }));
    }
  } catch {
    // Fallback for static builds
  }

  return DEFAULT_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = DEFAULT_PRODUCTS.find((p) => p.slug === slug);

  if (!product) return { title: "Battery Product | Perfect Batteries" };

  return {
    title: `${product.name} | Chinna Mayil Industries — Perfect Batteries`,
    description: product.shortDesc || product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let productData = DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;

  try {
    const dbProduct = await db.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (dbProduct) {
      productData = {
        ...dbProduct,
        price: Number(dbProduct.price),
        dealerPrice: Number(dbProduct.dealerPrice),
        taxRate: Number(dbProduct.taxRate),
      } as any;
    }
  } catch {
    // Graceful fallback to default data
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      <ProductDetailClient slug={slug} initialProduct={productData as any} />
      <Footer />
    </main>
  );
}
