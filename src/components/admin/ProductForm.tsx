"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import {
  Plus, Trash2, Loader2, Upload, X, AlertCircle,
  Package, Tag, DollarSign, FileText, Settings
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: Partial<ProductInput> & { id?: string; images?: { url: string; isPrimary: boolean; publicId: string }[] };
  isEdit?: boolean;
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm";
const labelCls = "block text-sm font-medium text-gray-300 mb-1.5";

const TABS = [
  { id: "basic", label: "Basic Info", icon: Package },
  { id: "pricing", label: "Pricing & Tax", icon: DollarSign },
  { id: "specs", label: "Specifications", icon: Tag },
  { id: "seo", label: "SEO & Meta", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function ProductForm({ categories, product, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean; publicId: string }[]>(
    product?.images ?? []
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      shortDesc: product?.shortDesc ?? "",
      price: product?.price ?? 0,
      dealerPrice: product?.dealerPrice ?? 0,
      taxRate: product?.taxRate ?? 18,
      categoryId: product?.categoryId ?? "",
      warrantyMonths: product?.warrantyMonths ?? 12,
      datasheetUrl: product?.datasheetUrl ?? "",
      metaTitle: product?.metaTitle ?? "",
      metaDesc: product?.metaDesc ?? "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
      specs: product?.specs ?? [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specs" as never,
  });

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "cmi-batteries/products");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      const newImg = { url: data.data.url, publicId: data.data.publicId, isPrimary: images.length === 0 };
      setImages((prev) => [...prev, newImg]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Check Cloudinary configuration.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [images]);

  async function onSubmit(data: ProductInput) {
    setServerError(null);
    try {
      // Clean up payload: Zod will fail if weight is NaN
      const cleanWeight = (typeof data.weight === 'number' && !isNaN(data.weight)) ? data.weight : undefined;

      const payload = {
        ...data,
        weight: cleanWeight,
        images: images.map((img, i) => ({
          url: img.url,
          publicId: img.publicId || "cmi-batteries/products/default", // Fallback if missing
          isPrimary: img.isPrimary,
          sortOrder: i,
          altText: data.name,
        })),
        ...(isEdit && product?.id && { id: product.id }),
      };

      const endpoint = isEdit && product?.id 
        ? `/api/admin/products/${product.id}` 
        : "/api/admin/products";

      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Failed to save product");
        return;
      }

      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  // Intercept form errors to show toast if user is on wrong tab
  const onError = (formErrors: any) => {
    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fill in all required fields correctly across all tabs.");
      
      // Auto switch to tab with error
      if (formErrors.price || formErrors.dealerPrice) setActiveTab("pricing");
      else if (formErrors.specs) setActiveTab("specs");
      else if (formErrors.metaTitle || formErrors.metaDesc) setActiveTab("seo");
      else setActiveTab("basic");
    }
  };

  const watchedName = watch("name");

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          {watchedName && <p className="text-gray-400 text-sm mt-0.5">{watchedName}</p>}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {((id === "basic" && (errors.name || errors.sku || errors.categoryId || errors.description)) ||
                (id === "pricing" && (errors.price || errors.dealerPrice)) ||
                (id === "specs" && errors.specs)) && (
                <div className="w-2 h-2 rounded-full bg-red-500 ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* ── Basic Info ── */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input {...register("name")} placeholder="e.g. Perfect LiFe 100Ah Battery" className={inputCls} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelCls}>SKU *</label>
              <input {...register("sku")} placeholder="PB-LIFE-100" className={inputCls} />
              {errors.sku && <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <select {...register("categoryId")} className={inputCls}>
                <option value="" className="bg-[#111]">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Short Description</label>
              <input {...register("shortDesc")} placeholder="One-line product summary" className={inputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Full Description *</label>
              <textarea {...register("description")} rows={5} placeholder="Detailed product description…" className={`${inputCls} resize-none`} />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Warranty (months)</label>
              <input {...register("warrantyMonths", { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Datasheet URL</label>
              <input {...register("datasheetUrl")} type="url" placeholder="https://…" className={inputCls} />
            </div>

            {/* Image upload */}
            <div className="md:col-span-2">
              <label className={labelCls}>Product Images</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-24 h-24 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <Image src={img.url} alt="Product" fill className="object-contain p-1" />
                    {img.isPrimary && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-black text-[9px] font-bold text-center py-0.5">PRIMARY</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className={`flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-gray-600">First image will be set as primary. Max 5 MB per image.</p>
            </div>
          </div>
        )}

        {/* ── Pricing ── */}
        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Retail Price (₹) *</label>
              <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" min={0} className={inputCls} />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Dealer Price (₹) *</label>
              <input {...register("dealerPrice", { valueAsNumber: true })} type="number" step="0.01" min={0} className={inputCls} />
              {errors.dealerPrice && <p className="text-red-400 text-xs mt-1">{errors.dealerPrice.message}</p>}
            </div>
            <div>
              <label className={labelCls}>GST Rate (%)</label>
              <select {...register("taxRate", { valueAsNumber: true })} className={inputCls}>
                {[0, 5, 12, 18, 28].map((r) => (
                  <option key={r} value={r} className="bg-[#111]">{r}%</option>
                ))}
              </select>
            </div>

            {/* Price summary */}
            <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-sm font-medium text-white mb-3">Price Summary (incl. GST)</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Retail (incl. GST)", value: `₹${((watch("price") ?? 0) * (1 + (watch("taxRate") ?? 18) / 100)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` },
                  { label: "Dealer (incl. GST)", value: `₹${((watch("dealerPrice") ?? 0) * (1 + (watch("taxRate") ?? 18) / 100)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` },
                  { label: "Margin", value: `₹${((watch("price") ?? 0) - (watch("dealerPrice") ?? 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` },
                  { label: "Margin %", value: `${watch("price") > 0 ? (((watch("price") - watch("dealerPrice")) / watch("price")) * 100).toFixed(1) : 0}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="text-white font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Specifications ── */}
        {activeTab === "specs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Add technical specifications that appear on the product page.</p>
              <button
                type="button"
                onClick={() => appendSpec({ label: "", value: "", unit: "", sortOrder: specFields.length })}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Spec
              </button>
            </div>

            {specFields.length === 0 && (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl py-12 text-center">
                <Tag className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500">No specs yet. Click &quot;Add Spec&quot; to start.</p>
              </div>
            )}

            <div className="space-y-3">
              {specFields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <input
                      {...register(`specs.${i}.label` as never)}
                      placeholder="Label (e.g. Capacity)"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      {...register(`specs.${i}.value` as never)}
                      placeholder="Value (e.g. 100)"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register(`specs.${i}.unit` as never)}
                      placeholder="Unit (e.g. Ah)"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO ── */}
        {activeTab === "seo" && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Meta Title <span className="text-gray-600 font-normal">(max 60 chars)</span></label>
              <input {...register("metaTitle")} placeholder="Perfect LiFe 100Ah Battery | Perfect Batteries" className={inputCls} />
              <p className="text-xs text-gray-600 mt-1">{(watch("metaTitle") ?? "").length}/60</p>
            </div>
            <div>
              <label className={labelCls}>Meta Description <span className="text-gray-600 font-normal">(max 160 chars)</span></label>
              <textarea {...register("metaDesc")} rows={3} placeholder="High-performance 100Ah LiFePO4 battery…" className={`${inputCls} resize-none`} />
              <p className="text-xs text-gray-600 mt-1">{(watch("metaDesc") ?? "").length}/160</p>
            </div>

            {/* SEO preview */}
            {(watch("metaTitle") || watch("name")) && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Google Preview</p>
                <p className="text-blue-400 text-sm font-medium">
                  {watch("metaTitle") || `${watch("name")} | Perfect Batteries`}
                </p>
                <p className="text-green-600 text-xs">https://cmibattery.com/products/…</p>
                <p className="text-gray-400 text-xs mt-1">
                  {watch("metaDesc") || watch("shortDesc") || watch("description")?.slice(0, 160) || ""}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
              <div>
                <p className="text-white font-medium">Active</p>
                <p className="text-gray-400 text-sm">Show this product on the public site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
              <div>
                <p className="text-white font-medium">Featured</p>
                <p className="text-gray-400 text-sm">Highlight this product on the home page</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              isEdit ? "Update Product" : "Create Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-white/10 text-gray-400 font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
