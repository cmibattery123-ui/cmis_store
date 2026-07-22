import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  shortDesc: z.string().max(200).optional(),
  sku: z.string().min(2, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  dealerPrice: z.number().positive("Dealer price must be positive"),
  taxRate: z.number().min(0).max(100),
  categoryId: z.string().min(1, "Category is required"),
  warrantyMonths: z.number().int().min(0),
  weight: z.number().positive().optional(),
  datasheetUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string().optional(),
    isPrimary: z.boolean(),
    sortOrder: z.number().int(),
    altText: z.string().optional(),
  })).optional(),
  specs: z.array(z.object({
    label: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    sortOrder: z.number().int(),
  })).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
