"use client";

import React, { useState, useEffect } from "react";
import NewQuotationForm from "./NewQuotationForm";
import { Loader2 } from "lucide-react";

export default function NewQuotationPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dealer/products?limit=100");
        const json = await res.json();
        if (res.ok && json.data?.products) {
          setProducts(
            json.data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              dealerPrice: Number(p.dealerPrice || p.price),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load products for quotation:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
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
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Request Quotation</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          Submit a quotation request for bulk pricing. An admin will review and respond within 24 hours.
        </p>
      </div>
      <NewQuotationForm products={products} />
    </div>
  );
}
