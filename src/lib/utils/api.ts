import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupee currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Convert a string to a URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a sequential order number like PB-2024-00001 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, "0");
  return `PB-${year}-${padded}`;
}

/** Generate a quotation number like QT-2024-00001 */
export function generateQuotationNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, "0");
  return `QT-${year}-${padded}`;
}

/** Format a date to locale string */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format a datetime to locale string */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Calculate GST amounts */
export function calculateGST(baseAmount: number, taxRate: number) {
  const taxAmount = (baseAmount * taxRate) / 100;
  const totalAmount = baseAmount + taxAmount;
  return { baseAmount, taxAmount, totalAmount };
}

/** Truncate a string to n characters */
export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

/** Build a JSON error response */
export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Build a JSON success response */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

/** Check if a string is a valid CUID */
export function isCuid(str: string): boolean {
  return /^c[a-z0-9]{24,}$/.test(str);
}

// ─────────────────────────────────────────────────────────────
// Server Action Helpers
// ─────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Return a successful action result */
export function actionSuccess<T = undefined>(
  data?: T,
  message?: string
): ActionResult<T> {
  return { success: true, data, message };
}

/** Return a failed action result */
export function actionError(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { success: false, error, fieldErrors };
}
