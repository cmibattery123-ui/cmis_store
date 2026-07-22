export interface PaymentCreateParams {
  orderId: string;
  amount: number; // in INR (not paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentCreateResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerifyParams {
  orderId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  paymentId?: string;
  failureReason?: string;
}

export interface PaymentRefundParams {
  providerPaymentId: string;
  amount?: number; // partial refund in INR
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId?: string;
  failureReason?: string;
}

export interface PaymentProvider {
  createOrder(params: PaymentCreateParams): Promise<PaymentCreateResult>;
  verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult>;
  refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult>;
}
