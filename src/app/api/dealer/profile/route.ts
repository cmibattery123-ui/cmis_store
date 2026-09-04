import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({
      where: { userId: dbUser.id },
      include: {
        user: { select: { name: true, email: true, phone: true, image: true, createdAt: true } },
      },
    });

    if (!dealer) return apiError("Dealer account not found", 404);

    return apiSuccess(dealer);
  } catch (error) {
    console.error("[dealer_profile_get]", error);
    return apiError("Internal server error", 500);
  }
}
