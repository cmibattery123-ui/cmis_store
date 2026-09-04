import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING"]).default("SHIPPING"),
  name: z.string().min(2, "Name is required").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  line1: z.string().min(5, "Address line 1 is required").max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  pincode: z.string().regex(/^[1-9][0-9]{5}$|^\d{6}$/, "Invalid 6-digit pincode"),
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

export const dealerRegistrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(255),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST number"
    )
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional()
    .or(z.literal("")),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  businessAddress: z.string().min(10, "Complete address required").max(500),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  pincode: z.string().regex(/^[1-9][0-9]{5}$|^\d{6}$/, "Invalid 6-digit pincode"),
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
  quotationId: z.string().min(1, "Quotation ID is required"),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(1000).optional(),
  validDays: z.number().int().positive().default(30),
  validUntil: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        quotationItemId: z.string().optional(),
        unitPrice: z.number().positive("Unit price must be positive"),
        taxRate: z.number().min(0).max(100).default(18),
      })
    )
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "FAILED",
    "REFUNDED",
  ]),
});

export const updateDealerStatusSchema = z.object({
  id: z.string().min(1, "Dealer ID is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  creditLimit: z.number().optional(),
  discountPercent: z.number().optional(),
  notes: z.string().optional(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  userId: z.string().optional(),
  type: z.string().optional(),
});

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const paymentFailSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().optional(),
});

export const paymentVerificationSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  providerOrderId: z.string().min(1, "Provider Order ID is required"),
  providerPaymentId: z.string().min(1, "Provider Payment ID is required"),
  signature: z.string().min(1, "Signature is required"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type DealerRegistrationInput = z.infer<typeof dealerRegistrationSchema>;
export type QuotationRequestInput = z.infer<typeof quotationRequestSchema>;
export type QuotationApprovalInput = z.infer<typeof quotationApprovalSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateDealerStatusInput = z.infer<typeof updateDealerStatusSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentFailInput = z.infer<typeof paymentFailSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
