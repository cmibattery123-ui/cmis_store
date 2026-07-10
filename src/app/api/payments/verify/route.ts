import { paymentService } from "@/services/payments/payment-service";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { orderId, providerOrderId, providerPaymentId, signature } = body;

    if (!orderId || !providerOrderId || !providerPaymentId) {
      return apiError("Missing required payment fields", 400);
    }

    const result = await paymentService.verifyPayment({
      orderId,
      providerOrderId,
      providerPaymentId,
      signature,
    });

    if (!result.success) {
      return apiError(result.failureReason ?? "Payment verification failed", 400);
    }

    return apiSuccess({ verified: true, paymentId: result.paymentId });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Verification failed", 500);
  }
}
