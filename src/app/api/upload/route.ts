import { auth } from "@/lib/auth";
import { apiError } from "@/lib/utils/api";
import { uploadToS3 } from "@/lib/s3";
import { storeMediaFile } from "@/lib/media-storage";
import { NextResponse } from "next/server";

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
    const format = file.type.split("/")[1] || "bin";
    const folder = isVideo ? "videos" : "images";

    let uploadUrl = "";
    let uploadId = "";
    let checksum = "";
    let fileSize = buffer.length;

    // 1. First attempt: Upload to S3
    try {
      const result = await uploadToS3(buffer, file.name, file.type, folder);
      uploadUrl = result.publicUrl;
      uploadId = result.key;
      checksum = result.checksum;
      fileSize = result.size;
    } catch (s3Err) {
      console.warn("[API Upload] S3 upload failed or unconfigured, falling back to local database storage:", s3Err);
    }

    // 2. Fallback: If S3 didn't produce a URL, store in local database (MediaFile + MediaChunk)
    if (!uploadUrl) {
      const media = await storeMediaFile({
        buffer,
        filename: file.name,
        mimeType: file.type,
      });
      uploadUrl = media.url;
      uploadId = media.id;
      checksum = media.checksum;
      fileSize = media.totalSize;
    }

    return NextResponse.json({
      success: true,
      url: uploadUrl,
      publicId: uploadId,
      data: {
        url: uploadUrl,
        publicId: uploadId,
        mediaId: uploadId,
        filename: file.name,
        mimeType: file.type,
        bytes: fileSize,
        format,
        checksum,
      },
    });
  } catch (error) {
    console.error("[API Upload POST]", error);
    return apiError("Media upload failed", 500);
  }
}
