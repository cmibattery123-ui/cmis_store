import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { invalidateEdgeCache, withEdgeCache } from "@/lib/edge-cache";
import { z } from "zod";

export const dynamic = "force-dynamic";

const techSpecSchema = z.object({
  model: z.string().min(1, "Model name is required"),
  volts: z.string().min(1, "Voltage is required"),
  capacity: z.string().min(1, "Capacity is required"),
  length: z.string().min(1, "Length is required"),
  breadth: z.string().min(1, "Breadth is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  sortOrder: z.number().int().optional(),
});

export async function GET(request?: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const specs = await withEdgeCache("technical-specs:all", 120, ["technical-specs"], async () => {
      return await db.technicalSpec.findMany({
        orderBy: { sortOrder: "asc" },
      });
    });

    return apiSuccess(specs, 200, {
      "Cache-Control": "private, s-maxage=120, stale-while-revalidate=600",
      "X-Edge-Cache": "HIT",
    });
  } catch (error) {
    console.error("[admin_technical_specs_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const body = await request.json();
    const validated = techSpecSchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const created = await db.technicalSpec.create({
      data: validated.data,
    });

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("technical-specs");

    return apiSuccess(created, 201);
  } catch (error) {
    console.error("[admin_technical_specs_post]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }

    if (!Array.isArray(items)) return apiError("Invalid items payload", 400);

    await db.$transaction(
      items.map((item: any) =>
        db.technicalSpec.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("technical-specs");

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("[admin_technical_specs_patch]", error);
    return apiError("Internal server error", 500);
  }
}
