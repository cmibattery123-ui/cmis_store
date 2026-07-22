import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, image: true },
    });

    if (!user) return apiError("User not found", 404);
    return apiSuccess(user);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const validated = profileUpdateSchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { name, phone } = validated.data;

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(phone && { phone }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return apiSuccess(user);
  } catch {
    return apiError("Internal server error", 500);
  }
}
