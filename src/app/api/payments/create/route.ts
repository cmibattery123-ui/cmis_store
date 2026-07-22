import { paymentService } from "@/services/payments/payment-service";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Unauthorized", 401);

    const { orderId } = await request.json();
    if (!orderId) return apiError("Order ID is required", 400);

    // Verify this order belongs to the current user
    const order = await db.order.findFirst({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) return apiError("Order not found", 404);

    const result = await paymentService.createPayment(orderId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Payment creation failed", 500);
  }
}
