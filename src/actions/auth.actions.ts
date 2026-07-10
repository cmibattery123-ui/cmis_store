"use server";

import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { loginSchema, registerSchema, dealerRegisterSchema } from "@/lib/validations/auth";
import type { LoginInput, RegisterInput, DealerRegisterInput } from "@/lib/validations/auth";

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────────────────────────────────────
export async function loginAction(data: LoginInput) {
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid credentials" };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────
export async function registerAction(data: RegisterInput) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, phone, password } = validated.data;

  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { error: "An account with this email already exists" };
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

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (DEALER)
// ─────────────────────────────────────────────────────────────────────────────
export async function dealerRegisterAction(data: DealerRegisterInput) {
  const validated = dealerRegisterSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
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
    return { error: "An account with this email already exists" };
  }

  if (gstNumber) {
    const existingGST = await db.dealer.findUnique({
      where: { gstNumber },
    });
    if (existingGST) {
      return { error: "A dealer with this GST number already exists" };
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

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirect: false });
  return { success: true };
}
