import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import bcrypt from "bcryptjs";
import { createAndSaveEmailOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const { email, password } = body;

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.password || !user.isActive) {
      return apiError("Invalid email or password", 400);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return apiError("Invalid email or password", 400);
    }

    const isPinRequired = user.role === "ADMIN" || user.role === "DEALER";

    return apiSuccess({
      success: true,
      requirePin: isPinRequired,
      require2FA: false,
      role: user.role,
    });
  } catch (error) {
    console.error("[API Auth Pre-check Error]", error);
    return apiError("Internal server error", 500);
  }
}
