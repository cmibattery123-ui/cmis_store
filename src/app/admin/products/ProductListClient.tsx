"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Package, Loader2 } from "lucide-react";

interface ProductListClientProps {
  initialProducts: any[];
  search: string;
}

const ProductReorderTable = dynamic(
  () => import("./ProductReorderTable"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 dark:text-primary" />
        <span className="text-xs font-mono">Loading product table…</span>
      </div>
    ),
  }
);

export default function ProductListClient({ initialProducts, search }: ProductListClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isReordering, setIsReordering] = useState(false);
  const router = useRouter();

  const isSortingDisabled = search.trim().length > 0;

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (isSortingDisabled) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic update
    const newItems = items.map((item, index) => ({
      ...item,
      sortOrder: index, // Ensure visual sync, backend will handle exact numbering
    }));
    setProducts(newItems);

    setIsReordering(true);
    try {
      const payload = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));

      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      if (!res.ok) throw new Error("Reorder failed");
      toast.success("Products reordered successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to reorder products. Please try again.");
      setProducts(initialProducts); // Revert
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden relative">
      {isReordering && (
        <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 shadow-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Saving order...
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <ProductReorderTable
          products={products}
          isSortingDisabled={isSortingDisabled}
          onDragEnd={onDragEnd}
        />
      </div>
    </div>
  );
}
