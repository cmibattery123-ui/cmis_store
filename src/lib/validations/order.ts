import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING"]).default("SHIPPING"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  newShippingAddress: addressSchema.optional(),
  newBillingAddress: addressSchema.optional(),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST"
    )
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const quotationRequestSchema = z.object({
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
        unitPrice: z.number().positive().optional(), // Overridden by admin
      })
    )
    .min(1, "At least one product is required"),
});

export const quotationApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(1000).optional(),
  validUntil: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        unitPrice: z.number().positive("Unit price must be positive"),
        taxRate: z.number().min(0).max(100).default(18),
      })
    )
    .optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type QuotationRequestInput = z.infer<typeof quotationRequestSchema>;
export type QuotationApprovalInput = z.infer<typeof quotationApprovalSchema>;
