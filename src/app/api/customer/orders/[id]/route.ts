import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { autoCancelExpiredPendingOrders } from "@/lib/orders/expire-pending";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    await autoCancelExpiredPendingOrders(dbUser.id);

    const { id } = await params;

    const order = await db.order.findFirst({
      where: {
        id,
        OR: [
          { userId: dbUser.id },
          ...(dbUser.email ? [{ user: { email: dbUser.email.toLowerCase() } }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) return apiError("Order not found", 404);

    const isFailed = order.payment?.status === "FAILED" || order.paymentStatus === "FAILED";
    const sanitizedOrder = {
      ...order,
      status: isFailed ? "FAILED" : order.status,
      paymentStatus: isFailed ? "FAILED" : order.paymentStatus,
    };

    return apiSuccess(sanitizedOrder);
  } catch (error) {
    console.error("[customer order detail error]", error);
    return apiError("Internal server error", 500);
  }
}
