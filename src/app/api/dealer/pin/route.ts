import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    if (dbUser.role !== "DEALER" && dbUser.role !== "ADMIN") {
      return apiError("Only Dealers and Admins can manage Security PIN", 403);
    }

    return apiSuccess({
      hasCustomPin: Boolean(dbUser.pin),
      currentPin: dbUser.pin || "123456",
    });
  } catch (error) {
    console.error("[dealer_pin_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    if (dbUser.role !== "DEALER" && dbUser.role !== "ADMIN") {
      return apiError("Only Dealers and Admins can manage Security PIN", 403);
    }

    const body = await request.json();
    const { pin } = body || {};

    if (!pin || typeof pin !== "string" || pin.trim().length < 4 || pin.trim().length > 8) {
      return apiError("PIN must be between 4 and 8 digits", 400);
    }

    await db.user.update({
      where: { id: dbUser.id },
      data: { pin: pin.trim() },
    });

    return apiSuccess({ message: "Security PIN updated successfully", pin: pin.trim() });
  } catch (error) {
    console.error("[dealer_pin_post]", error);
    return apiError("Internal server error", 500);
  }
}
