import { auth, getDbUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+91[\-\s]?)?[0]?[6-9]\d{9}$/.test(val.replace(/\s/g, "")),
      "Please enter a valid 10-digit mobile number"
    )
    .or(z.literal("")),
});

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const user = await db.user.findUnique({
      where: { id: dbUser.id },
      select: { id: true, name: true, email: true, phone: true, role: true, pin: true, createdAt: true, image: true },
    });

    if (!user) return apiError("User not found", 404);
    return apiSuccess({
      ...user,
      hasCustomPin: Boolean(user.pin),
    });
  } catch (error) {
    console.error("[customer profile GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const body = await request.json();
    const validated = profileUpdateSchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { name, phone, email } = validated.data;

    let cleanEmail: string | undefined = undefined;
    if (email) {
      cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== dbUser.email.toLowerCase()) {
        const existing = await db.user.findUnique({
          where: { email: cleanEmail },
        });
        if (existing && existing.id !== dbUser.id) {
          return apiError("This email address is already in use", 400);
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: {
        name,
        ...(cleanEmail && { email: cleanEmail }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    console.error("[customer profile PATCH]", error);
    return apiError("Internal server error", 500);
  }
}
