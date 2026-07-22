"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/api";
import { Package, Edit, Eye, GripVertical, CheckCircle2 } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductListClientProps {
  initialProducts: any[];
  search: string;
}

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
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
      {isReordering && (
        <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-black/80 px-4 py-2 rounded-full text-sm text-white font-medium border border-white/10 flex items-center gap-2">
             <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             Saving order...
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="w-10 p-4"></th>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <Droppable droppableId="products" isDropDisabled={isSortingDisabled}>
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No products found
                      </td>
                    </tr>
                  )}
                  {products.map((p, index) => {
                    const qty = p.inventory?.quantity ?? 0;
                    const low = qty <= (p.inventory?.lowStockThreshold ?? 10);
                    return (
                      <Draggable key={p.id} draggableId={p.id} index={index} isDragDisabled={isSortingDisabled}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "border-b border-white/5 transition-colors",
                              snapshot.isDragging ? "bg-white/10 shadow-2xl z-50 table" : "hover:bg-white/[0.02]"
                            )}
                            style={provided.draggableProps.style}
                          >
                            <td className="p-4 w-10 text-center">
                              <div
                                {...provided.dragHandleProps}
                                className={cn(
                                  "text-gray-500 transition-colors p-1 rounded-md",
                                  isSortingDisabled ? "opacity-30 cursor-not-allowed" : "hover:text-white cursor-grab active:cursor-grabbing hover:bg-white/10"
                                )}
                                title={isSortingDisabled ? "Sorting disabled while searching" : "Drag to reorder"}
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-white font-medium line-clamp-1">{p.name}</p>
                              {p.isFeatured && (
                                <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">Featured</span>
                              )}
                            </td>
                            <td className="p-4 font-mono text-gray-400 text-xs">{p.sku}</td>
                            <td className="p-4 text-gray-300">{p.category.name}</td>
                            <td className="p-4 text-white">{formatCurrency(Number(p.price))}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                qty === 0 ? "bg-red-400/10 text-red-400"
                                  : low ? "bg-orange-400/10 text-orange-400"
                                  : "bg-green-400/10 text-green-400"
                              }`}>
                                {qty} units
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                p.isActive ? "bg-green-400/10 text-green-400" : "bg-gray-400/10 text-gray-400"
                              }`}>
                                {p.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/products/${p.slug}`} target="_blank" className="text-gray-500 hover:text-white transition-colors">
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link href={`/admin/products/${p.id}/edit`} className="text-gray-500 hover:text-primary transition-colors">
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <DeleteProductButton id={p.id} name={p.name} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    </div>
  );
}
