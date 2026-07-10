import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const { status, adminNotes } = await request.json();

    if (!status) return apiError("Status is required", 400);

    const validUntil = status === "APPROVED" 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
      : null;

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
        ...(validUntil && { validUntil }),
      },
    });

    return apiSuccess(quotation);
  } catch (error) {
    console.error("[update_quotation]", error);
    return apiError("Internal server error", 500);
  }
}
