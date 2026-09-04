import { auth, getDbUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { addressSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth(req);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    const addresses = await db.address.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ addresses });
  } catch (error) {
    console.error("[ADDRESS_GET]", error);
    return apiError("Internal Server Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth(req);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    let data: unknown;
    try {
      data = await req.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validated = addressSchema.safeParse(data);
    if (!validated.success) {
      return apiError("Invalid address data", 400);
    }

    const { name, phone, line1, line2, city, state, pincode, type, isDefault } = validated.data;

    // If making this the default address, unset previous defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: dbUser.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: dbUser.id,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        type: type || "SHIPPING",
        isDefault: Boolean(isDefault),
      },
    });

    return apiSuccess(address, 201);
  } catch (error) {
    console.error("[ADDRESS_POST]", error);
    return apiError("Internal Server Error", 500);
  }
}
