import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { uploadToArchiveOrg } from "@/lib/archive-upload";

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
      return apiError("No file provided for Archive.org upload", 400);
    }

    const isVideo = file.type.startsWith("video/");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const archiveResult = await uploadToArchiveOrg({
      buffer,
      filename: file.name,
      mimeType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
      title,
      description,
    });

    if (!archiveResult.success) {
      return apiError(archiveResult.error || "Archive.org upload failed", 500);
    }

    return apiSuccess({
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      itemId: archiveResult.itemId,
      url: archiveResult.url,
      downloadUrl: archiveResult.downloadUrl,
      embedUrl: archiveResult.embedUrl,
      thumbnailUrl: archiveResult.thumbnailUrl,
    });
  } catch (error: any) {
    console.error("[API Archive.org Upload Error]", error);
    return apiError("Internal server error uploading to Archive.org", 500);
  }
}
