"use client";

import React, { useState, useEffect } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

export default function NewProductPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (res.ok && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">New Product</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">Add a new battery or accessory to inventory</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
