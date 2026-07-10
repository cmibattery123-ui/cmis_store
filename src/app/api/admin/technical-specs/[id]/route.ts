import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { model, volts, capacity, length, breadth, height, weight, sortOrder } = body;

    const spec = await db.technicalSpec.update({
      where: { id },
      data: {
        model,
        volts,
        capacity,
        length,
        breadth,
        height,
        weight,
        sortOrder,
      },
    });

    return apiSuccess({ spec });
  } catch (error) {
    console.error("[tech_specs_put]", error);
    return apiError("Failed to update specification", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { id } = await params;
    await db.technicalSpec.delete({
      where: { id },
    });

    return apiSuccess(null);
  } catch (error) {
    console.error("[tech_specs_delete]", error);
    return apiError("Failed to delete specification", 500);
  }
}
