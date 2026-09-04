import type {
  PaymentProvider,
  PaymentCreateParams,
  PaymentCreateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
  PaymentRefundParams,
  PaymentRefundResult,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    return {
      providerOrderId: `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: params.amount,
      currency: params.currency || "INR",
      provider: "MOCK",
      metadata: params.notes,
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    if (!params.providerPaymentId) {
      return { success: false, failureReason: "Missing payment ID" };
    }
    return {
      success: true,
      paymentId: params.providerPaymentId,
    };
  }

  async refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundId: `mock_rfnd_${Date.now()}`,
    };
  }
}
