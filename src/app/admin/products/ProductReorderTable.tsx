"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/api";
import { Package, Edit, Eye, GripVertical } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface ProductReorderTableProps {
  products: any[];
  isSortingDisabled: boolean;
  onDragEnd: (result: DropResult) => void;
}

export default function ProductReorderTable({
  products,
  isSortingDisabled,
  onDragEnd,
}: ProductReorderTableProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
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
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-gray-500">
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
                          "border-b border-slate-100 dark:border-white/5 transition-colors",
                          snapshot.isDragging ? "bg-slate-100 dark:bg-white/10 shadow-2xl z-50 table" : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                        )}
                        style={provided.draggableProps.style}
                      >
                        <td className="p-4 w-10 text-center">
                          <div
                            {...provided.dragHandleProps}
                            className={cn(
                              "text-slate-400 dark:text-gray-500 transition-colors p-1 rounded-md",
                              isSortingDisabled ? "opacity-30 cursor-not-allowed" : "hover:text-slate-900 dark:hover:text-white cursor-grab active:cursor-grabbing hover:bg-slate-200 dark:hover:bg-white/10"
                            )}
                            title={isSortingDisabled ? "Sorting disabled while searching" : "Drag to reorder"}
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-900 dark:text-white font-medium line-clamp-1">{p.name}</p>
                          {p.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-primary bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-slate-500 dark:text-gray-400 text-xs">{p.sku}</td>
                        <td className="p-4 text-slate-600 dark:text-gray-300">{p.category?.name}</td>
                        <td className="p-4 text-slate-900 dark:text-white font-bold font-mono">{formatCurrency(Number(p.price))}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            qty === 0 ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              : low ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                          }`}>
                            {qty} units
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            p.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20"
                          }`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/${p.slug}`} target="_blank" className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1" aria-label={`View ${p.name}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={`/admin/products/${p.id}/edit`} className="text-slate-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-primary transition-colors p-1" aria-label={`Edit ${p.name}`}>
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
  );
}
