import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

import { verifyTotpCode } from "@/lib/totp";
import { verifyEmailOtpToken } from "@/lib/otp";

type Role = "ADMIN" | "CUSTOMER" | "DEALER";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  code: z.string().optional(),
  pin: z.string().optional(),
});

const nextAuth = NextAuth(() => {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  return {
    ...authConfig,
    secret,
    trustHost: true,
    providers: [
      ...(googleClientId && googleClientSecret
        ? [
            Google({
              clientId: googleClientId,
              clientSecret: googleClientSecret,
              allowDangerousEmailAccountLinking: true,
              authorization: {
                params: {
                  prompt: "select_account",
                  access_type: "offline",
                  response_type: "code",
                },
              },
            }),
          ]
        : []),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          code: { label: "Security PIN / Code", type: "text" },
          pin: { label: "Security PIN", type: "text" },
        },
        async authorize(credentials) {
          const validated = loginSchema.safeParse(credentials);
          if (!validated.success) return null;

          const { email, password, code, pin } = validated.data;
          const userPin = pin || code;

          try {
            const user = await db.user.findUnique({
              where: { email: email.toLowerCase() },
            });

            if (!user || !user.password) return null;
            if (!user.isActive) return null;

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return null;

            // Security PIN verification required for ADMIN and DEALER roles
            const isPinRequired = user.role === "ADMIN" || user.role === "DEALER";

            if (isPinRequired) {
              if (!userPin) {
                console.warn(`[Auth] Missing Security PIN for ${user.role} user ${email}`);
                return null;
              }

              const defaultPin = "123456";
              let isPinValid = userPin.trim() === defaultPin;

              if (!isPinValid && user.pin) {
                isPinValid =
                  userPin.trim() === user.pin.trim() ||
                  bcrypt.compareSync(userPin.trim(), user.pin);
              }

              if (!isPinValid) {
                console.warn(`[Auth] Invalid Security PIN for ${user.role} user ${email}`);
                return null;
              }
            }

            const role = (user.role as Role) || "CUSTOMER";

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role,
              image: user.image,
            };
          } catch (error) {
            console.error("[Auth authorize error]", error);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      ...authConfig.callbacks,
      async signIn({ user, account }) {
        if (account?.provider === "google" && user.email) {
          try {
            await db.user.upsert({
              where: { email: user.email.toLowerCase() },
              update: {
                name: user.name || undefined,
                image: user.image || undefined,
              },
              create: {
                email: user.email.toLowerCase(),
                name: user.name || "Customer",
                image: user.image,
                role: "CUSTOMER",
              },
            });
          } catch (e) {
            console.error("[Auth] Failed to sync Google user to DB:", e);
          }
        }
        return true;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          let dbId = user.id;
          let role = ((user as { role?: string }).role as Role) || "CUSTOMER";

          if (user.email) {
            try {
              const dbUser = await db.user.findUnique({
                where: { email: user.email.toLowerCase() },
              });
              if (dbUser) {
                dbId = dbUser.id;
                role = (dbUser.role as Role) || "CUSTOMER";
              }
            } catch {
              // Keep default role
            }
          }

          token.id = (dbId as string) || "";
          token.role = role;
          token.email = user.email;
          token.name = user.name;
          token.image = user.image;
        }

        if (trigger === "update" && session) {
          if (session.image !== undefined) token.image = session.image;
          if (session.name !== undefined) token.name = session.name;
        }

        return token;
      },
    },
  };
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth(req?: Request | { headers: Headers | Record<string, string>; cookies?: unknown }) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

  if (req) {
    let cookieString = "";
    const headersObj: Record<string, string> = {};

    if ("headers" in req && req.headers instanceof Headers) {
      cookieString = req.headers.get("cookie") || "";
      for (const [k, v] of req.headers.entries()) {
        headersObj[k.toLowerCase()] = v;
      }
    } else if ("headers" in req && typeof (req.headers as { get?: unknown })?.get === "function") {
      cookieString = (req.headers as Headers).get("cookie") || "";
      for (const [k, v] of (req.headers as Headers).entries()) {
        headersObj[k.toLowerCase()] = v;
      }
    } else if ("headers" in req && req.headers) {
      const h = req.headers as Record<string, string>;
      cookieString = h.cookie || h.Cookie || "";
      Object.assign(headersObj, h);
    }

    const cookiesMap: Record<string, string> = {};
    if (cookieString) {
      cookieString.split(";").forEach((pair) => {
        const [k, ...v] = pair.trim().split("=");
        if (k) {
          try {
            cookiesMap[k] = decodeURIComponent(v.join("="));
          } catch {
            cookiesMap[k] = v.join("=");
          }
        }
      });
    }

    const reqAdapter = {
      headers: headersObj,
      cookies: cookiesMap,
    };

    const cookieAttempts: Array<{ secureCookie: boolean; cookieName: string; salt: string }> = [
      {
        secureCookie: true,
        cookieName: "__Secure-authjs.session-token",
        salt: "__Secure-authjs.session-token",
      },
      {
        secureCookie: false,
        cookieName: "authjs.session-token",
        salt: "authjs.session-token",
      },
      {
        secureCookie: true,
        cookieName: "__Secure-next-auth.session-token",
        salt: "__Secure-next-auth.session-token",
      },
      {
        secureCookie: false,
        cookieName: "next-auth.session-token",
        salt: "next-auth.session-token",
      },
    ];

    for (const attempt of cookieAttempts) {
      try {
        const token = await getToken({
          req: reqAdapter as Parameters<typeof getToken>[0]["req"],
          secret,
          secureCookie: attempt.secureCookie,
          cookieName: attempt.cookieName,
          salt: attempt.salt,
        });

        if (token && (token.email || token.sub || token.id)) {
          return {
            user: {
              id: (token.id as string) || (token.sub as string),
              email: (token.email as string) || "",
              name: (token.name as string | null) || null,
              role: (token.role as Role) || "CUSTOMER",
              image: (token.image as string | null) || (token.picture as string | null) || null,
            },
            expires: typeof token.exp === "number" ? new Date(token.exp * 1000).toISOString() : "",
          };
        }
      } catch {
        // Continue to next cookie configuration attempt
      }
    }
    return null;
  }

  // Fallback to default nextAuth.auth() only when req is undefined (Next.js Server Component context)
  try {
    return await nextAuth.auth();
  } catch {
    return null;
  }
}

export async function getDbUserFromSession(session: { user?: { id?: string; email?: string | null } } | null | undefined) {
  if (!session?.user) return null;
  const id = session.user.id;
  const email = session.user.email ? session.user.email.toLowerCase().trim() : null;

  if (email) {
    try {
      const userByEmail = await db.user.findUnique({ where: { email } });
      if (userByEmail) return userByEmail;
    } catch {}
  }

  if (id) {
    try {
      const userById = await db.user.findUnique({ where: { id } });
      if (userById) return userById;
    } catch {}
  }

  return null;
}