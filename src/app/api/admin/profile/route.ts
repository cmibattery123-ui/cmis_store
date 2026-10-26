import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const data = await request.json();

    const updateData: { image?: string; name?: string; email?: string } = {};
    if (data.image !== undefined) updateData.image = data.image;
    if (typeof data.name === "string" && data.name.trim().length >= 2) {
      updateData.name = data.name.trim();
    }
    if (typeof data.email === "string" && data.email.trim()) {
      const cleanEmail = data.email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return apiError("Please enter a valid email address", 400);
      }
      const existing = await db.user.findUnique({ where: { email: cleanEmail } });
      if (existing && existing.id !== session.user.id) {
        return apiError("This email address is already in use", 400);
      }
      updateData.email = cleanEmail;
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return apiSuccess({ user });
  } catch (error) {
    console.error("[profile_update]", error);
    return apiError("Internal server error", 500);
  }
}
