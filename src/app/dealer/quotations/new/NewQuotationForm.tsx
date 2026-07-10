"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationRequestSchema, type QuotationRequestInput } from "@/lib/validations/order";
import { Plus, Trash2, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
  const watchedItems = watch("items");

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
  const estimatedTotal = watchedItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !item.quantity) return sum;
    return sum + product.dealerPrice * 1.18 * Number(item.quantity);
  }, 0);

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Products */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Product Lines
          </h2>
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1 })}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Product
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const selectedProduct = products.find((p) => p.id === watchedItems[index]?.productId);
            return (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                {/* Product select */}
                <div className="col-span-7">
                  <select
                    {...register(`items.${index}.productId`)}
                    className={inputCls}
                  >
                    <option value="" className="bg-[#111]">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#111]">
                        {p.name} — {p.sku}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <p className="text-red-400 text-xs mt-1">{errors.items[index]?.productId?.message}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-span-3">
                  <input
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="Qty"
                    className={inputCls}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-400 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>

                {/* Remove */}
                <div className="col-span-2 flex items-center justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Per-line price */}
                {selectedProduct && watchedItems[index]?.quantity > 0 && (
                  <div className="col-span-12 text-xs text-gray-400 -mt-1 pl-1">
                    Dealer price: ₹{(selectedProduct.dealerPrice * 1.18 * watchedItems[index].quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })} (incl. 18% GST)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Estimated total */}
        {estimatedTotal > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Estimated Total</span>
            <span className="text-white font-heading font-bold text-lg">
              ₹{estimatedTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Add any special requirements, delivery timeline, or notes for the admin…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            "Submit Quotation Request"
          )}
        </button>
        <a
          href="/dealer/quotations"
          className="flex items-center justify-center border border-white/10 text-gray-400 font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
