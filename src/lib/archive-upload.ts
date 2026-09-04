import crypto from "crypto";
import { db } from "@/lib/db";

export interface ArchiveUploadParams {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  title: string;
  description?: string;
}

export interface ArchiveUploadResult {
  success: boolean;
  itemId?: string;
  url?: string;
  downloadUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

function sanitizeItemIdentifier(name: string): string {
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 30);
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `cmi-battery-${safeName}-${randomSuffix}`;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export async function getArchiveCredentials() {
  const accessKey = process.env.ARCHIVE_ACCESS_KEY || process.env.IA_ACCESS_KEY || "";
  const secretKey = process.env.ARCHIVE_SECRET_KEY || process.env.IA_SECRET_KEY || "";

  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ["ARCHIVE_ACCESS_KEY", "ARCHIVE_SECRET_KEY"],
        },
      },
    });

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return {
      accessKey: settingsMap["ARCHIVE_ACCESS_KEY"] || accessKey,
      secretKey: settingsMap["ARCHIVE_SECRET_KEY"] || secretKey,
    };
  } catch {
    return { accessKey, secretKey };
  }
}

/** Upload media payload to Archive.org (Internet Archive) with 100% UNLIMITED storage & bandwidth */
export async function uploadToArchiveOrg(
  params: ArchiveUploadParams
): Promise<ArchiveUploadResult> {
  try {
    const creds = await getArchiveCredentials();
    const isVideo = params.mimeType.startsWith("video/");
    const safeFilename = sanitizeFilename(params.filename);
    const identifier = sanitizeItemIdentifier(params.title || safeFilename);

    if (!creds.accessKey || !creds.secretKey) {
      console.warn("[Archive.org Upload] S3 credentials missing in .env or System Settings.");
      return {
        success: false,
        error: "Archive.org S3 Keys missing in .env! Please paste your free ARCHIVE_ACCESS_KEY & ARCHIVE_SECRET_KEY from https://archive.org/account/s3.php into .env",
      };
    }

    const uploadUrl = `https://s3.us.archive.org/${identifier}/${safeFilename}`;

    const headers: Record<string, string> = {
      Authorization: `LOW ${creds.accessKey}:${creds.secretKey}`,
      "x-archive-auto-make-bucket": "1",
      "x-archive-meta-title": params.title || "CMI Battery Event Media",
      "x-archive-meta-mediatype": isVideo ? "movies" : "image",
      "x-archive-meta-collection": "opensource_media",
      "Content-Type": params.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
      "Content-Length": params.buffer.length.toString(),
    };

    if (params.description) {
      headers["x-archive-meta-description"] = params.description;
    }

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers,
      body: new Uint8Array(params.buffer),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[Archive.org Upload Failed]", res.status, errText);
      return {
        success: false,
        error: `Archive.org upload failed (HTTP ${res.status}): ${errText || res.statusText}`,
      };
    }

    const fileUrl = `https://archive.org/download/${identifier}/${safeFilename}`;
    const embedUrl = `https://archive.org/embed/${identifier}`;
    const thumbnailUrl = isVideo
      ? `https://archive.org/download/${identifier}/__ia_thumb.jpg`
      : fileUrl;

    return {
      success: true,
      itemId: identifier,
      url: fileUrl,
      downloadUrl: fileUrl,
      embedUrl,
      thumbnailUrl,
    };
  } catch (error: any) {
    console.error("[Archive.org Upload Exception]", error);
    return {
      success: false,
      error: error.message || "Failed to upload media to Archive.org",
    };
  }
}
