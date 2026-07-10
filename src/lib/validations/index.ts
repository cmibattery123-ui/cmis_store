import { z } from "zod";

// ============================================================
// AUTH
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pin: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number").optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ============================================================
// PRODUCTS
// ============================================================

export const productSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10),
  shortDesc: z.string().max(500).optional(),
  sku: z.string().min(2).max(100),
  price: z.number().positive("Price must be positive"),
  dealerPrice: z.number().positive("Dealer price must be positive"),
  taxRate: z.number().min(0).max(100).default(18),
  categoryId: z.string().cuid("Invalid category"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  warrantyMonths: z.number().int().min(0).max(120).default(12),
  weight: z.number().positive().optional(),
  datasheetUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
  specs: z.array(z.object({
    label: z.string(),
    value: z.string(),
    unit: z.string().optional(),
  })).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ============================================================
// ORDERS
// ============================================================

export const checkoutSchema = z.object({
  shippingAddressId: z.string().cuid(),
  billingAddressId: z.string().cuid(),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

// ============================================================
// ADDRESS
// ============================================================

export const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING"]).default("SHIPPING"),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  line1: z.string().min(5).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid 6-digit pincode"),
  isDefault: z.boolean().default(false),
});

// ============================================================
// DEALER
// ============================================================

export const dealerRegistrationSchema = z.object({
  businessName: z.string().min(2).max(255),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  businessAddress: z.string().min(10).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid 6-digit pincode"),
});

// ============================================================
// QUOTATIONS
// ============================================================

export const quotationRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive("Quantity must be positive"),
  })).min(1, "At least one product required"),
  notes: z.string().max(1000).optional(),
});

export const quotationApprovalSchema = z.object({
  quotationId: z.string().cuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  items: z.array(z.object({
    quotationItemId: z.string().cuid(),
    unitPrice: z.number().positive(),
  })).optional(),
  adminNotes: z.string().max(1000).optional(),
  validDays: z.number().int().positive().default(30),
});

// ============================================================
// PAYMENT
// ============================================================

export const paymentVerificationSchema = z.object({
  orderId: z.string().cuid(),
  providerOrderId: z.string(),
  providerPaymentId: z.string(),
  signature: z.string(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type DealerRegistrationInput = z.infer<typeof dealerRegistrationSchema>;
export type QuotationRequestInput = z.infer<typeof quotationRequestSchema>;
export type QuotationApprovalInput = z.infer<typeof quotationApprovalSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
