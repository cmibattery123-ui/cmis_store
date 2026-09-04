"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationRequestSchema, type QuotationRequestInput } from "@/lib/validations/order";
import { Plus, Trash2, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  dealerPrice: number;
}

interface NewQuotationFormProps {
  products: Product[];
}

export default function NewQuotationForm({ products }: NewQuotationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationRequestInput>({
    resolver: zodResolver(quotationRequestSchema),
    defaultValues: {
      notes: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items") || [];

  async function onSubmit(data: QuotationRequestInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/dealer/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Failed to submit quotation");
        return;
      }

      toast.success("Quotation request submitted successfully!");
      router.push("/dealer/quotations");
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  // Calculate estimated total
  const estimatedTotal = (watchedItems || []).reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !item.quantity) return sum;
    return sum + product.dealerPrice * 1.18 * Number(item.quantity);
  }, 0);

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl text-slate-900 dark:text-white">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Products */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600 dark:text-primary" /> Product Lines
          </h2>
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1 })}
            className="flex items-center gap-1 text-xs font-mono font-bold uppercase text-amber-600 dark:text-primary hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const selectedProduct = products.find((p) => p.id === watchedItems[index]?.productId);
            const lineTotal = selectedProduct && watchedItems[index]?.quantity
              ? selectedProduct.dealerPrice * 1.18 * Number(watchedItems[index].quantity)
              : null;

            return (
              <div key={field.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <select
                      {...register(`items.${index}.productId`)}
                      className={inputCls}
                    >
                      <option value="" className="bg-white dark:bg-[#0C0D14] text-slate-900 dark:text-white">Select a product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-[#0C0D14] text-slate-900 dark:text-white">
                          {p.name} ({p.sku}) — {formatCurrency(p.dealerPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    {lineTotal !== null && (
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(lineTotal)}
                      </span>
                    )}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {estimatedTotal > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-gray-400 font-mono text-xs uppercase font-bold">Estimated Total (incl. 18% GST):</span>
            <span className="text-lg font-heading font-bold text-amber-600 dark:text-primary font-mono">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-2">
        <label className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
          Additional Notes / Requirements (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Mention delivery timelines, specific quantities, or special requests..."
          {...register("notes")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-black font-mono font-bold uppercase text-xs py-3.5 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
          </>
        ) : (
          "Submit Quotation Request"
        )}
      </button>
    </form>
  );
}
