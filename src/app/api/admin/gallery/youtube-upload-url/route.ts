import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { getYouTubeAccessToken, getYouTubeCredentials, OFFICIAL_CHANNEL_HANDLE } from "@/lib/youtube-upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const { title, description, mimeType, fileSize } = body || {};

    const accessToken = await getYouTubeAccessToken();
    const creds = await getYouTubeCredentials();

    if (!accessToken) {
      // Simulation mode if credentials not set
      const mockId = `yt_${Date.now()}`;
      return apiSuccess({
        isSimulation: true,
        videoId: mockId,
        watchUrl: `https://www.youtube.com/watch?v=${mockId}`,
        embedUrl: `https://www.youtube.com/embed/${mockId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${mockId}/hqdefault.jpg`,
      });
    }

    const videoTitle = title || "CMI Battery Event Video";
    const videoDescription = description || "Official Video published on @cmibattery";
    const privacyStatus = creds.privacyStatus || "public";

    const metadata = {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: ["cmibattery", "CMI Battery", "Perfect Batteries"],
        categoryId: "28",
      },
      status: {
        privacyStatus,
        embeddable: true,
      },
    };

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": (fileSize || 0).toString(),
          "X-Upload-Content-Type": mimeType || "video/mp4",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      let parsedMsg = initRes.statusText || `HTTP ${initRes.status}`;
      try {
        const parsedJson = JSON.parse(errText);
        if (parsedJson.error?.message) {
          parsedMsg = parsedJson.error.message;
        }
      } catch {}
      return apiError(`YouTube API Init Error: ${parsedMsg}`, 500);
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return apiError("No upload URL returned by YouTube API", 500);
    }

    return apiSuccess({
      isSimulation: false,
      uploadUrl,
    });
  } catch (error: any) {
    console.error("[YouTube Direct Upload Session Error]", error);
    return apiError(error.message || "Failed to create YouTube upload session", 500);
  }
}
