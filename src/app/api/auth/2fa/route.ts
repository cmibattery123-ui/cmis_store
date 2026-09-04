import { auth, getDbUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import {
  generateTotpSecret,
  getOtpAuthUrl,
  verifyTotpCode,
  DEFAULT_ADMIN_TOTP_SECRET,
  DEFAULT_DEALER_TOTP_SECRET,
} from "@/lib/totp";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/2fa
 * Returns 2FA status, secret, and otpauth URI for the authenticated admin or dealer
 */
export async function GET(req: Request) {
  try {
    const session = await auth(req);
    const dbUser = await getDbUserFromSession(session);

    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    if (dbUser.role !== "ADMIN" && dbUser.role !== "DEALER") {
      return apiError("2FA is only required for Admin and Dealer accounts", 403);
    }

    const secret =
      dbUser.twoFactorSecret ||
      (dbUser.role === "ADMIN" ? DEFAULT_ADMIN_TOTP_SECRET : DEFAULT_DEALER_TOTP_SECRET);

    const otpAuthUrl = getOtpAuthUrl(dbUser.email, secret);

    return apiSuccess({
      role: dbUser.role,
      twoFactorEnabled: dbUser.twoFactorEnabled || true,
      secret,
      otpAuthUrl,
      instructions: "Scan the otpAuthUrl or enter the secret key manually into Google Authenticator, Authy, or Microsoft Authenticator.",
    });
  } catch (error) {
    console.error("[2FA GET Error]", error);
    return apiError("Internal server error", 500);
  }
}

/**
 * POST /api/auth/2fa
 * Verifies and sets a custom 2FA secret key for an admin or dealer user
 */
export async function POST(req: Request) {
  try {
    const session = await auth(req);
    const dbUser = await getDbUserFromSession(session);

    if (!dbUser) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const { code, secret } = body;

    if (!code || !secret) {
      return apiError("Both code and secret are required", 400);
    }

    const isValid = verifyTotpCode(code, secret);
    if (!isValid) {
      return apiError("Invalid 6-digit authenticator code", 400);
    }

    await db.user.update({
      where: { id: dbUser.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return apiSuccess({ message: "2FA successfully enabled with custom secret" });
  } catch (error) {
    console.error("[2FA POST Error]", error);
    return apiError("Internal server error", 500);
  }
}
