import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { getDb } from "./db";

export interface S3UploadResult {
  key: string;
  url: string; // Internal or proxy URL, but we'll use direct publicUrl for S3
  publicUrl: string; // The direct AWS S3 URL
  size: number;
  contentType: string;
  checksum: string;
}

function computeChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

/**
 * Gets the S3 client configured with credentials from the database.
 */
async function getS3Client() {
  const db = getDb();
  const settings = await db.cloudSettings.findUnique({
    where: { id: "DEFAULT" },
  });

  if (!settings || !settings.awsAccessKeyId || !settings.awsSecretKey || !settings.awsS3Bucket) {
    throw new Error("AWS S3 is not configured in Cloud Settings.");
  }

  const s3 = new S3Client({
    region: settings.awsRegion || "ap-south-1",
    credentials: {
      accessKeyId: settings.awsAccessKeyId,
      secretAccessKey: settings.awsSecretKey,
    },
  });

  return { s3, settings };
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<S3UploadResult> {
  const { s3, settings } = await getS3Client();
  const bucketName = settings.awsS3Bucket as string;
  const region = settings.awsRegion || "ap-south-1";

  const date = new Date();
  const datePrefix = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const safeFilename = sanitizeFilename(filename);
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const key = `${folder}/${datePrefix}/${uniqueId}_${safeFilename}`;

  const checksum = computeChecksum(buffer);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
      Metadata: {
        "original-filename": encodeURIComponent(filename),
        checksum,
      },
    })
  );

  // Because the setup script disabled BlockPublicAccess and added a PublicRead policy,
  // we can construct the direct S3 URL!
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return {
    key,
    url: publicUrl,
    publicUrl,
    size: buffer.length,
    contentType,
    checksum,
  };
}
