import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { dealerRegisterSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = dealerRegisterSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues[0].message, 400);
    }

    const {
      name,
      email,
      phone,
      password,
      businessName,
      gstNumber,
      panNumber,
      businessAddress,
      city,
      state,
      pincode,
    } = validated.data;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError("An account with this email already exists", 409);
    }

    if (gstNumber && gstNumber.trim()) {
      const existingGST = await db.dealer.findUnique({
        where: { gstNumber: gstNumber.trim().toUpperCase() },
      });
      if (existingGST) {
        return apiError("A dealer with this GST number already exists", 409);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          role: "DEALER",
        },
      });

      const dealer = await tx.dealer.create({
        data: {
          userId: user.id,
          businessName,
          gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : null,
          panNumber: panNumber ? panNumber.trim().toUpperCase() : null,
          phone,
          businessAddress,
          city,
          state,
          pincode,
          status: "PENDING",
        },
      });

      return { user, dealer };
    });

    return apiSuccess(
      {
        userId: result.user.id,
        dealerId: result.dealer.id,
        businessName: result.dealer.businessName,
      },
      201
    );
  } catch (error) {
    console.error("[POST /api/auth/dealer-register]", error);
    return apiError("Internal server error during dealer registration", 500);
  }
}
