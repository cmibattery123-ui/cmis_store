import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { uploadToArchiveOrg } from "@/lib/archive-upload";
import { uploadToS3 } from "@/lib/s3";
import { storeMediaFile } from "@/lib/media-storage";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minute timeout for uploading large videos

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "CMI Battery Event Media";
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return apiError("No file provided for upload", 400);
    }

    const isVideo = file.type.startsWith("video/");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Archive.org if credentials exist
    const archiveResult = await uploadToArchiveOrg({
      buffer,
      filename: file.name,
      mimeType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
      title,
      description,
    });

    if (archiveResult.success && archiveResult.url) {
      return apiSuccess({
        mediaType: isVideo ? "VIDEO" : "IMAGE",
        itemId: archiveResult.itemId,
        url: archiveResult.url,
        downloadUrl: archiveResult.downloadUrl,
        embedUrl: archiveResult.embedUrl,
        thumbnailUrl: archiveResult.thumbnailUrl,
      });
    }

    // 2. Seamless Fallback: S3 or embedded database storage (identical to product media)
    console.warn(
      "[Gallery Upload] Archive.org unavailable or unconfigured, using fallback storage:",
      archiveResult.error
    );

    let uploadUrl = "";
    let uploadId = "";

    try {
      const s3Res = await uploadToS3(buffer, file.name, file.type, isVideo ? "videos" : "gallery");
      uploadUrl = s3Res.publicUrl;
      uploadId = s3Res.key;
    } catch (s3Err) {
      console.warn("[Gallery Upload Fallback] S3 upload failed or not configured, falling back to local DB media storage:", s3Err);
    }

    if (!uploadUrl) {
      const media = await storeMediaFile({
        buffer,
        filename: file.name,
        mimeType: file.type,
      });
      uploadUrl = media.url;
      uploadId = media.id;
    }

    return apiSuccess({
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      itemId: uploadId,
      url: uploadUrl,
      downloadUrl: uploadUrl,
      embedUrl: uploadUrl,
      thumbnailUrl: uploadUrl,
    });
  } catch (error: any) {
    console.error("[API Gallery Upload Error]", error);
    return apiError("Internal server error uploading media", 500);
  }
}
