import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const data = await request.json();

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.image !== undefined && { image: data.image }),
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    return apiSuccess({ user });
  } catch (error) {
    console.error("[profile_update]", error);
    return apiError("Internal server error", 500);
  }
}
