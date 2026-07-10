import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    const specs = await db.technicalSpec.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return apiSuccess({ specs });
  } catch (error) {
    console.error("[tech_specs_get]", error);
    return apiError("Failed to fetch specifications", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const { model, volts, capacity, length, breadth, height, weight, sortOrder } = body;

    const spec = await db.technicalSpec.create({
      data: {
        model,
        volts,
        capacity,
        length,
        breadth,
        height,
        weight,
        sortOrder: sortOrder ?? 0,
      },
    });

    return apiSuccess({ spec });
  } catch (error) {
    console.error("[tech_specs_post]", error);
    return apiError("Failed to create specification", 500);
  }
}
