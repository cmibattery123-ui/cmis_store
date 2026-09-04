import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { uploadVideoToYouTubeChannel, postImageToYouTubeCommunity } from "@/lib/youtube-upload";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minute timeout for video upload

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "CMI Battery Event";
    const description = (formData.get("description") as string) || "";
    const actionType = (formData.get("actionType") as string) || "auto"; // "video" | "image" | "auto"

    if (!file) {
      return apiError("No file provided for YouTube auto-publish", 400);
    }

    const isVideo = file.type.startsWith("video/") || actionType === "video";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isVideo) {
      // Automatic YouTube Video Upload
      const ytResult = await uploadVideoToYouTubeChannel({
        buffer,
        filename: file.name,
        mimeType: file.type || "video/mp4",
        title,
        description,
      });

      if (!ytResult.success) {
        return apiError(ytResult.error || "YouTube video upload failed", 500);
      }

      return apiSuccess({
        mediaType: "VIDEO",
        youtubeVideoId: ytResult.videoId,
        watchUrl: ytResult.watchUrl,
        embedUrl: ytResult.embedUrl,
        thumbnailUrl: ytResult.thumbnailUrl,
        url: ytResult.embedUrl,
      });
    } else {
      // Automatic YouTube Community Post for Image
      const imageUrl = (formData.get("imageUrl") as string) || "";
      const communityResult = await postImageToYouTubeCommunity({
        title,
        description,
        imageUrl,
      });

      return apiSuccess({
        mediaType: "IMAGE",
        communityPostId: communityResult.postId,
        communityPostUrl: communityResult.postUrl,
        message: communityResult.message,
      });
    }
  } catch (error) {
    console.error("[API YouTube Auto Publish Error]", error);
    return apiError("Internal server error auto-publishing to YouTube", 500);
  }
}
