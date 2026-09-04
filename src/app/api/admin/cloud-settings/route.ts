import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = getDb();
    let settings = await db.cloudSettings.findUnique({
      where: { id: "DEFAULT" },
    });

    if (!settings) {
      settings = await db.cloudSettings.create({
        data: {
          id: "DEFAULT",
        },
      });
    }

    // Never return the full secret key to the frontend for security, just mask it
    return NextResponse.json({
      awsAccessKeyId: settings.awsAccessKeyId || "",
      awsSecretKey: settings.awsSecretKey ? "****************" : "",
      awsRegion: settings.awsRegion || "ap-south-1",
      awsAccountId: settings.awsAccountId || "",
      awsS3Bucket: settings.awsS3Bucket || "",
    });
  } catch (error: any) {
    console.error("GET CloudSettings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cloud settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { awsAccessKeyId, awsSecretKey, awsRegion, awsAccountId, awsS3Bucket } = body;

    const db = getDb();
    
    // If the secret key is masked (starts with ****), don't overwrite it
    const updateData: any = {
      awsAccessKeyId,
      awsRegion,
      awsAccountId,
      awsS3Bucket,
    };

    if (awsSecretKey && !awsSecretKey.startsWith("***")) {
      updateData.awsSecretKey = awsSecretKey;
    }

    const settings = await db.cloudSettings.upsert({
      where: { id: "DEFAULT" },
      update: updateData,
      create: {
        id: "DEFAULT",
        ...updateData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST CloudSettings error:", error);
    return NextResponse.json(
      { error: "Failed to update cloud settings" },
      { status: 500 }
    );
  }
}
