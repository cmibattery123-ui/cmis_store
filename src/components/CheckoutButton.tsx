"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  buttonText?: string;
  className?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (errorMsg: string) => void;
  disabled?: boolean;
}

/**
 * CheckoutButton Component
 * Zero-Trust Razorpay Client Integration
 * Loads Razorpay SDK dynamically, requests order creation via server API,
 * and performs HMAC-SHA256 signature verification upon completion.
 */
export default function CheckoutButton({
  orderId,
  amount,
  currency = "INR",
  userDetails,
  buttonText = "Pay with Razorpay",
  className = "",
  onSuccess,
  onError,
  disabled = false,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Dynamically load the Razorpay checkout script if not present
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay Payment Gateway script.");
        setLoading(false);
        return;
      }

      // 2. Call Zero-Trust Server Order Creation API
      const res = await fetch(apiUrl("/api/payments/razorpay"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        const errorMsg = responseData.error || "Failed to initiate payment";
        toast.error(errorMsg);
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      const {
        providerOrderId,
        amountInPaise,
        keyId,
        orderNumber,
      } = responseData.data;

      // Fallback key check
      const razorpayKey =
        keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      // 3. Configure Razorpay Gateway Modal Options
      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency,
        name: "CMI Batteries",
        description: `Payment for Order #${orderNumber || orderId}`,
        image: "/assets/LOGO/logo2.png",
        order_id: providerOrderId,
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        theme: {
          color: "#CCFF00", // High contrast CMI primary accent
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment window closed.");
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            toast.loading("Verifying payment signature...", { id: "pay-verify" });

            // 4. Send payment response to server for HMAC-SHA256 verification
            const verifyRes = await fetch(apiUrl("/api/payments/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              toast.error(
                verifyData.error || "Payment verification failed",
                { id: "pay-verify" }
              );
              onError?.(verifyData.error || "Verification failed");
              setLoading(false);
              return;
            }

            toast.success("Payment completed successfully!", {
              id: "pay-verify",
            });
            
            onSuccess?.(response.razorpay_payment_id);

            // Redirect to order success page
            router.push(`/checkout/success?orderId=${orderId}`);
          } catch (verifyErr) {
            console.error("[Checkout Verification Error]", verifyErr);
            toast.error("Payment verification encountered an unexpected error.", {
              id: "pay-verify",
            });
            setLoading(false);
          }
        },
      };

      // 4. Open Razorpay Modal
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        console.error("[Razorpay Payment Failed]", response.error);
        toast.error(`Payment failed: ${response.error.description || "Transaction declined"}`);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("[Checkout Error]", err);
      toast.error("An error occurred while initiating checkout.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          <span>Processing Payment...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 text-black" />
          <span>{buttonText}</span>
          <ShieldCheck className="w-4 h-4 text-black/70 ml-1" />
        </>
      )}
    </button>
  );
}
