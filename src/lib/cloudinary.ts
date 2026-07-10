import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadResult = {
  url: string;
  publicId: string;
};

export async function uploadImage(
  file: string, // base64 or URL
  folder: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `perfect-batteries/${folder}`,
    transformation: [
      {
        width: options?.maxWidth ?? 1200,
        height: options?.maxHeight ?? 1200,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadPDF(file: string, folder: string): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `perfect-batteries/${folder}`,
    resource_type: "raw",
    format: "pdf",
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFile(publicId: string, resourceType: "image" | "raw" = "image") {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };
