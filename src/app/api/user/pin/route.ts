import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const defaultPin = dbUser.role === "CUSTOMER" ? "" : "123456";

    return apiSuccess({
      hasCustomPin: Boolean(dbUser.pin),
      currentPin: dbUser.pin || defaultPin,
      role: dbUser.role,
    });
  } catch (error) {
    console.error("[user_pin_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { pin } = body || {};

    if (!pin || typeof pin !== "string" || pin.trim().length < 4 || pin.trim().length > 8) {
      return apiError("Security PIN must be between 4 and 8 characters/digits", 400);
    }

    const cleanPin = pin.trim();

    await db.user.update({
      where: { id: dbUser.id },
      data: { pin: cleanPin },
    });

    return apiSuccess({ message: "Security PIN updated successfully", pin: cleanPin });
  } catch (error) {
    console.error("[user_pin_post]", error);
    return apiError("Internal server error", 500);
  }
}
