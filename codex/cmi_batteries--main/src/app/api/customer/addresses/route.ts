import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, phone, line1, line2, city, state, pincode, type, isDefault } = data;

    // Validate required fields
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If making this the default address, unset previous defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        type: type || "SHIPPING",
        isDefault,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("[ADDRESS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
