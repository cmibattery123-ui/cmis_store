"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { actionSuccess, actionError } from "@/lib/utils/api";
import type { ActionResult } from "@/lib/utils/api";
import { AuthError } from "next-auth";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ============================================================
// REGISTER
// ============================================================

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { name, email, password, phone } = validated.data;

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return actionError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: "CUSTOMER",
      },
    });

    return actionSuccess({ email }, "Account created successfully");
  } catch (error) {
    console.error("[registerUser]", error);
    return actionError("Something went wrong. Please try again.");
  }
}

// ============================================================
// LOGIN
// ============================================================

export async function loginUser(formData: {
  email: string;
  password: string;
  callbackUrl?: string;
}): Promise<ActionResult> {
  try {
    const validated = loginSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Invalid credentials");
    }

    await signIn("credentials", {
      email: formData.email.toLowerCase(),
      password: formData.password,
      redirectTo: formData.callbackUrl ?? "/",
    });

    return actionSuccess(undefined, "Logged in successfully");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return actionError("Invalid email or password");
        default:
          return actionError("Authentication failed. Please try again.");
      }
    }
    throw error; // Re-throw redirect errors
  }
}

// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

// ============================================================
// CHECK ADMIN STATUS
// ============================================================

export async function checkIsAdmin(email: string): Promise<boolean> {
  try {
    if (!email) return false;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { role: true },
    });
    return user?.role === "ADMIN";
  } catch (error) {
    console.error("[checkIsAdmin]", error);
    return false;
  }
}

/** Complete the role choice required for first-time OAuth users. */
export async function completeOnboardingAction(role: "CUSTOMER" | "DEALER"): Promise<ActionResult<{ role: "CUSTOMER" | "DEALER" }>> {
  const session = await auth();
  if (!session?.user?.id) return actionError("Please sign in before choosing an account type.");
  if (role !== "CUSTOMER" && role !== "DEALER") return actionError("Invalid account type.");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!user) return actionError("User account was not found.");
  if (user.role && user.role !== role) return actionError("Your account type has already been set.");

  await db.user.update({ where: { id: session.user.id }, data: { role } });
  revalidatePath("/");
  return actionSuccess({ role }, "Account type saved.");
}
