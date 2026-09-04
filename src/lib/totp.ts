import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decode Base32 string into Buffer
 */
export function base32Decode(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = "";
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Encode Buffer into Base32 string
 */
export function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (let i = 0; i < buffer.length; i++) {
    bits += buffer[i].toString(2).padStart(8, "0");
  }
  let base32 = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5).padEnd(5, "0");
    base32 += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return base32;
}

/**
 * Generate a new random Base32 TOTP secret key
 */
export function generateTotpSecret(length = 20): string {
  const randomBytes = crypto.randomBytes(length);
  return base32Encode(randomBytes);
}

/**
 * Generate 6-digit TOTP code for a secret key
 */
export function generateTotpCode(secret: string, timeStep = 30, windowOffset = 0): string {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep) + windowOffset;
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(time), 0);

  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 1000000).toString().padStart(6, "0");
}

/**
 * Verify a 6-digit TOTP code against a secret key with time drift tolerance
 */
export function verifyTotpCode(code: string, secret: string, window = 1): boolean {
  if (!code || !secret) return false;
  const cleanCode = code.trim().replace(/\s+/g, "");
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) return false;

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const generated = generateTotpCode(secret, 30, errorWindow);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(generated))) {
      return true;
    }
  }
  return false;
}

/**
 * Generate otpauth:// URI compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 */
export function getOtpAuthUrl(email: string, secret: string, issuer = "Perfect Batteries"): string {
  const label = encodeURIComponent(`Perfect Batteries:${email}`);
  const encIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// Default system secrets for roles if user doesn't have an individual secret set yet
export const DEFAULT_ADMIN_TOTP_SECRET = process.env.ADMIN_2FA_SECRET || "CMIADMIN2FA2026SECRETKEY32";
export const DEFAULT_DEALER_TOTP_SECRET = process.env.DEALER_2FA_SECRET || "CMIDEALER2FA2026SECRETKEY32";
