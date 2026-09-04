import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * Generate a random 6-digit numeric OTP code
 */
export function generateNumericOtp(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Create and save a 6-digit OTP verification token for a user email
 */
export async function createAndSaveEmailOtp(email: string): Promise<string> {
  const cleanEmail = email.toLowerCase().trim();
  const identifier = `2fa:${cleanEmail}`;
  const code = generateNumericOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Delete existing tokens for this identifier
  await db.verificationToken.deleteMany({
    where: { identifier },
  }).catch(() => {});

  // Create new verification token
  await db.verificationToken.create({
    data: {
      identifier,
      token: code,
      expires,
    },
  });

  // Log OTP code clearly in server log for testing/dev environments
  console.log(`\n==================================================`);
  console.log(`[2FA OTP CODE] Sent to ${cleanEmail}: ${code}`);
  console.log(`[2FA OTP CODE] Valid for 10 minutes (expires: ${expires.toLocaleTimeString()})`);
  console.log(`==================================================\n`);

  return code;
}

/**
 * Verify if the 6-digit OTP code matches an active DB verification token
 */
export async function verifyEmailOtpToken(email: string, code: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const identifier = `2fa:${cleanEmail}`;
  const cleanCode = code.trim().replace(/\s+/g, "");

  if (!cleanCode || cleanCode.length !== 6) return false;

  const tokenRecord = await db.verificationToken.findFirst({
    where: {
      identifier,
      token: cleanCode,
      expires: { gte: new Date() },
    },
  });

  if (!tokenRecord) return false;

  // Consume (delete) the token once verified
  await db.verificationToken.deleteMany({
    where: { identifier },
  }).catch(() => {});

  return true;
}
