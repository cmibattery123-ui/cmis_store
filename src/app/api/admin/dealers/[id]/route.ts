import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const dealer = await db.dealer.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, createdAt: true } },
        quotations: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, quotationNo: true, status: true, totalAmount: true, createdAt: true },
        },
      },
    });

    if (!dealer) return apiError("Dealer not found", 404);
    return apiSuccess(dealer);
  } catch (error) {
    console.error("[admin_dealers_id_get]", error);
    return apiError("Internal server error", 500);
  }
}
