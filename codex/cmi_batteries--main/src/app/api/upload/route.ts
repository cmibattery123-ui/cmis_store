import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "cmi-batteries/products";

    if (!file) return apiError("No file provided", 400);

    const isVideo = file.type.startsWith("video/");
    const MAX_SIZE = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB video, 5MB image

    if (file.size > MAX_SIZE) return apiError(`File too large (max ${isVideo ? 20 : 5} MB)`, 400);

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Invalid file type. Only JPEG, PNG, WebP, GIF, MP4, WebM are allowed", 400);
    }

    // Convert file to base64 data URI for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      transformation: isVideo ? [] : [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return apiSuccess({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("[upload]", error);
    return apiError("Image upload failed", 500);
  }
}
