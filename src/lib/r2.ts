import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET = process.env.R2_BUCKET || "cmi-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export const r2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface R2UploadResult {
  key: string;
  url: string;
  publicUrl: string;
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

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<R2UploadResult> {
  const date = new Date();
  const datePrefix = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const safeFilename = sanitizeFilename(filename);
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const key = `${folder}/${datePrefix}/${uniqueId}_${safeFilename}`;

  const checksum = computeChecksum(buffer);

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
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

  const publicUrl = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;

  return {
    key,
    url: `/api/media/r2/${encodeURIComponent(key)}`,
    publicUrl,
    size: buffer.length,
    contentType,
    checksum,
  };
}

export async function getFromR2(key: string) {
  const response = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );

  return response;
}

export async function headR2(key: string) {
  try {
    const response = await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
    return response;
  } catch {
    return null;
  }
}

export async function deleteFromR2(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );
}

export async function listR2(prefix: string, maxKeys: number = 1000) {
  const response = await r2.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
    })
  );
  return response.Contents || [];
}

export async function getPresignedUrl(key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}
