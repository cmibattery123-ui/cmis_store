import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const validated = reorderSchema.safeParse(body);
    if (!validated.success) {
      return apiError(validated.error.issues[0].message, 400);
    }

    // Update in transaction
    await db.$transaction(
      validated.data.items.map((item) =>
        db.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return apiSuccess({ success: true });
  } catch {
    return apiError("Internal server error", 500);
  }
}
