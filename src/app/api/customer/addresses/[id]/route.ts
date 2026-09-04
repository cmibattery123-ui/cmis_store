import { auth, getDbUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(req);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;

    // Verify ownership
    const address = await db.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== dbUser.id) {
      return apiError("Address not found", 404);
    }

    await db.address.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("[ADDRESS_DELETE]", error);
    return apiError("Internal Server Error", 500);
  }
}
