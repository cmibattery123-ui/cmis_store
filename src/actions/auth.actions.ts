"use server";

import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { loginSchema, registerSchema, dealerRegisterSchema } from "@/lib/validations/auth";
import type { LoginInput, RegisterInput, DealerRegisterInput } from "@/lib/validations/auth";
import { actionSuccess, actionError, type ActionResult } from "@/lib/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────────────────────────────────────
export async function loginAction(data: LoginInput): Promise<ActionResult> {
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return actionError("Invalid credentials", validated.error.flatten().fieldErrors as Record<string, string[]>);
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
    return actionSuccess(undefined, "Signed in successfully");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return actionError("Invalid email or password");
        default:
          return actionError("Something went wrong. Please try again.");
      }
    }
    console.error("[loginAction]", error);
    return actionError("An error occurred during login. Please try again.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────
export async function registerAction(data: RegisterInput): Promise<ActionResult> {
  try {
    const validated = registerSchema.safeParse(data);
    if (!validated.success) {
      return actionError(validated.error.issues[0]?.message || "Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { name, email, phone, password } = validated.data;

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return actionError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return actionSuccess(undefined, "Account created successfully");
  } catch (error) {
    console.error("[registerAction]", error);
    return actionError("Failed to create account. Please try again.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (DEALER)
// ─────────────────────────────────────────────────────────────────────────────
export async function dealerRegisterAction(data: DealerRegisterInput): Promise<ActionResult> {
  try {
    const validated = dealerRegisterSchema.safeParse(data);
    if (!validated.success) {
      return actionError(validated.error.issues[0]?.message || "Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const {
      name, email, phone, password,
      businessName, gstNumber, panNumber,
      businessAddress, city, state, pincode,
    } = validated.data;

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return actionError("An account with this email already exists");
    }

    if (gstNumber) {
      const existingGST = await db.dealer.findUnique({
        where: { gstNumber },
      });
      if (existingGST) {
        return actionError("A dealer with this GST number already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction(async (tx: DbTransaction) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          role: "DEALER",
        },
      });

      await tx.dealer.create({
        data: {
          userId: user.id,
          businessName,
          gstNumber: gstNumber || null,
          panNumber: panNumber || null,
          phone,
          businessAddress,
          city,
          state,
          pincode,
          status: "PENDING",
        },
      });
    });

    return actionSuccess(undefined, "Dealer application submitted successfully");
  } catch (error) {
    console.error("[dealerRegisterAction]", error);
    return actionError("Failed to register dealer. Please try again.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  try {
    await signOut({ redirect: false });
    return actionSuccess(undefined, "Signed out successfully");
  } catch (error) {
    console.error("[logoutAction]", error);
    return actionError("Failed to sign out. Please try again.");
  }
}
