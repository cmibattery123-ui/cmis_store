import type {
  PaymentProvider,
  PaymentCreateParams,
  PaymentCreateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
  PaymentRefundParams,
  PaymentRefundResult,
} from "./types";

/**
 * Mock payment provider for development / testing.
 * Simulates Razorpay-like order IDs but never makes real network calls.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 50));

    return {
      providerOrderId: `mock_order_${Date.now()}_${params.orderId.slice(-6)}`,
      amount: params.amount,
      currency: params.currency ?? "INR",
      provider: "MOCK",
      metadata: {
        receipt: params.receipt,
        notes: params.notes,
      },
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    await new Promise((r) => setTimeout(r, 50));

    // In mock mode, any payment starting with "mock_pay_" is valid
    if (params.providerPaymentId.startsWith("mock_pay_")) {
      return {
        success: true,
        paymentId: params.providerPaymentId,
      };
    }

    // Simulate a failure
    return {
      success: false,
      failureReason: "Mock verification failed — invalid payment ID format",
    };
  }

  async refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult> {
    await new Promise((r) => setTimeout(r, 50));

    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
    };
  }
}
