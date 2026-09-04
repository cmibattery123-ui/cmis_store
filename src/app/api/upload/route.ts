import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { uploadToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minute timeout

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("No file provided", 400);

    const isVideo = file.type.startsWith("video/");
    const MAX_SIZE = isVideo ? 500 * 1024 * 1024 : 25 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return apiError(`File too large (max ${isVideo ? 500 : 25} MB)`, 400);
    }

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, PDF", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = isVideo ? "videos" : "images";
    const result = await uploadToS3(buffer, file.name, file.type, folder);

    const format = file.type.split("/")[1] || "bin";

    return apiSuccess({
      url: result.publicUrl,
      publicId: result.key,
      mediaId: result.key,
      filename: file.name,
      mimeType: file.type,
      bytes: result.size,
      format,
      checksum: result.checksum,
    });
  } catch (error) {
    console.error("[API Upload POST]", error);
    return apiError("Media upload failed", 500);
  }
}
