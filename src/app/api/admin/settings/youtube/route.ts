import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "YOUTUBE_CLIENT_ID",
            "YOUTUBE_CLIENT_SECRET",
            "YOUTUBE_REFRESH_TOKEN",
            "YOUTUBE_API_KEY",
            "YOUTUBE_PRIVACY_STATUS",
          ],
        },
      },
    });

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return apiSuccess({
      clientId: settingsMap["YOUTUBE_CLIENT_ID"] || process.env.YOUTUBE_CLIENT_ID || "",
      clientSecret: settingsMap["YOUTUBE_CLIENT_SECRET"] || process.env.YOUTUBE_CLIENT_SECRET || "",
      refreshToken: settingsMap["YOUTUBE_REFRESH_TOKEN"] || process.env.YOUTUBE_REFRESH_TOKEN || "",
      apiKey: settingsMap["YOUTUBE_API_KEY"] || process.env.YOUTUBE_API_KEY || "",
      privacyStatus: settingsMap["YOUTUBE_PRIVACY_STATUS"] || process.env.YOUTUBE_PRIVACY_STATUS || "public",
    });
  } catch (error) {
    console.error("[GET /api/admin/settings/youtube]", error);
    return apiError("Failed to fetch YouTube settings", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const { clientId, clientSecret, refreshToken, apiKey, privacyStatus } = body || {};

    const upserts = [
      { key: "YOUTUBE_CLIENT_ID", value: clientId || "" },
      { key: "YOUTUBE_CLIENT_SECRET", value: clientSecret || "" },
      { key: "YOUTUBE_REFRESH_TOKEN", value: refreshToken || "" },
      { key: "YOUTUBE_API_KEY", value: apiKey || "" },
      { key: "YOUTUBE_PRIVACY_STATUS", value: privacyStatus || "public" },
    ];

    for (const item of upserts) {
      await db.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value, description: "YouTube Channel API Setting" },
      });
    }

    return apiSuccess({ message: "YouTube settings saved successfully" });
  } catch (error) {
    console.error("[POST /api/admin/settings/youtube]", error);
    return apiError("Failed to save YouTube settings", 500);
  }
}
