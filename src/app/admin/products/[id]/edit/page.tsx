"use client";

import React, { useState, useEffect, use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch(`/api/categories`),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodRes.ok && prodData.data) {
          const p = prodData.data;
          setProduct({
            id: p.id,
            name: p.name,
            sku: p.sku,
            slug: p.slug,
            description: p.description,
            shortDesc: p.shortDesc ?? undefined,
            price: Number(p.price),
            dealerPrice: Number(p.dealerPrice),
            taxRate: Number(p.taxRate),
            stock: p.inventory?.quantity ?? 0,
            categoryId: p.categoryId,
            warrantyMonths: p.warrantyMonths,
            datasheetUrl: p.datasheetUrl ?? "",
            metaTitle: p.metaTitle ?? "",
            metaDesc: p.metaDesc ?? "",
            isActive: p.isActive,
            isFeatured: p.isFeatured,
            images: (p.images || []).map((img: any, i: number) => ({
              url: img.url,
              isPrimary: img.isPrimary,
              publicId: img.publicId,
              sortOrder: img.sortOrder ?? i,
            })),
            specs: (p.specs || []).map((s: any) => ({
              label: s.label,
              value: s.value,
              unit: s.unit ?? "",
              sortOrder: s.sortOrder,
            })),
          });
        }
        if (catRes.ok && catData.data) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error("Failed to load product edit data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-gray-400">
        <p>Product not found.</p>
        <Link href="/admin/products" className="text-amber-600 dark:text-primary underline text-sm mt-2 inline-block">
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Edit Product</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} isEdit={true} />
    </div>
  );
}
