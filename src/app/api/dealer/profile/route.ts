import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({
      where: { userId: dbUser.id },
      include: {
        user: { select: { name: true, email: true, phone: true, image: true, createdAt: true } },
      },
    });

    if (!dealer) return apiError("Dealer account not found", 404);

    return apiSuccess(dealer);
  } catch (error) {
    console.error("[dealer_profile_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { name, email, phone, businessName, businessAddress } = body;

    const userUpdateData: { name?: string; email?: string; phone?: string | null } = {};
    if (typeof name === "string" && name.trim().length >= 2) {
      userUpdateData.name = name.trim();
    }
    if (typeof email === "string" && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return apiError("Please enter a valid email address", 400);
      }
      if (cleanEmail !== dbUser.email.toLowerCase()) {
        const existing = await db.user.findUnique({ where: { email: cleanEmail } });
        if (existing && existing.id !== dbUser.id) {
          return apiError("This email address is already in use", 400);
        }
        userUpdateData.email = cleanEmail;
      }
    }
    if (phone !== undefined) {
      userUpdateData.phone = phone ? String(phone).trim() : null;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await db.user.update({
        where: { id: dbUser.id },
        data: userUpdateData,
      });
    }

    const dealerUpdateData: { businessName?: string; phone?: string; businessAddress?: string } = {};
    if (typeof businessName === "string" && businessName.trim().length >= 2) {
      dealerUpdateData.businessName = businessName.trim();
    }
    if (phone !== undefined && phone) {
      dealerUpdateData.phone = String(phone).trim();
    }
    if (typeof businessAddress === "string" && businessAddress.trim().length > 0) {
      dealerUpdateData.businessAddress = businessAddress.trim();
    }

    if (Object.keys(dealerUpdateData).length > 0) {
      await db.dealer.update({
        where: { userId: dbUser.id },
        data: dealerUpdateData,
      });
    }

    const updatedDealer = await db.dealer.findUnique({
      where: { userId: dbUser.id },
      include: {
        user: { select: { name: true, email: true, phone: true, image: true, createdAt: true } },
      },
    });

    return apiSuccess(updatedDealer);
  } catch (error) {
    console.error("[dealer_profile_patch]", error);
    return apiError("Internal server error", 500);
  }
}

