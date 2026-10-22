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
 * Gets the S3 client configured with credentials from the database or environment variables.
 */
async function getS3Client() {
  const db = getDb();
  let settings: {
    awsAccessKeyId?: string | null;
    awsSecretKey?: string | null;
    awsRegion?: string | null;
    awsS3Bucket?: string | null;
  } | null = null;

  try {
    settings = await db.cloudSettings.findUnique({
      where: { id: "DEFAULT" },
    });
  } catch (err) {
    console.warn("[S3] Could not read cloudSettings from DB:", err);
  }

  const bucketName =
    settings?.awsS3Bucket ||
    process.env.AWS_S3_BUCKET ||
    process.env.S3_STATIC_BUCKET ||
    process.env.S3_BUCKET ||
    "cmibattery-static-7099";

  const region =
    settings?.awsRegion ||
    process.env.AWS_REGION ||
    "ap-south-1";

  const accessKeyId = settings?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = settings?.awsSecretKey || process.env.AWS_SECRET_ACCESS_KEY;

  const clientConfig: {
    region: string;
    credentials?: { accessKeyId: string; secretAccessKey: string };
  } = { region };

  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = { accessKeyId, secretAccessKey };
  }

  const s3 = new S3Client(clientConfig);

  return { s3, bucketName, region };
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<S3UploadResult> {
  const { s3, bucketName, region } = await getS3Client();

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
