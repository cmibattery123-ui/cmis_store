import { db } from "@/lib/db";
import crypto from "crypto";

// Default chunk size is 5MB (5,242,880 bytes), strictly below Cloudflare's 25MB limit
export const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
export const MAX_ALLOWED_CHUNK_SIZE = 20 * 1024 * 1024; // 20MB upper boundary

export interface StoreMediaOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  chunkSize?: number;
  width?: number;
  height?: number;
}

export interface MediaFileSummary {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  totalSize: number;
  totalChunks: number;
  chunkSize: number;
  width?: number | null;
  height?: number | null;
  checksum: string;
  createdAt: Date;
}

/**
 * Splits a file buffer into chunks < 25MB and stores metadata and fragments atomically in the database.
 */
export async function storeMediaFile(options: StoreMediaOptions): Promise<MediaFileSummary> {
  const { buffer, filename, mimeType, width, height } = options;
  const totalSize = buffer.length;
  const chunkSize = Math.min(options.chunkSize || DEFAULT_CHUNK_SIZE, MAX_ALLOWED_CHUNK_SIZE);

  const totalChunks = Math.max(1, Math.ceil(totalSize / chunkSize));
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

  // Build chunk payloads
  const chunkRecords: { chunkIndex: number; size: number; data: Buffer }[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);
    const chunkData = buffer.subarray(start, end);

    chunkRecords.push({
      chunkIndex: i,
      size: chunkData.length,
      data: chunkData,
    });
  }

  // Atomically persist MediaFile and all its MediaChunks
  const mediaFile = await db.mediaFile.create({
    data: {
      filename,
      mimeType,
      totalSize,
      totalChunks,
      chunkSize,
      width: width || null,
      height: height || null,
      checksum,
      chunks: {
        create: chunkRecords.map((c) => ({
          chunkIndex: c.chunkIndex,
          size: c.size,
          data: new Uint8Array(c.data),
        })),
      },
    },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      totalSize: true,
      totalChunks: true,
      chunkSize: true,
      width: true,
      height: true,
      checksum: true,
      createdAt: true,
    },
  });

  return {
    ...mediaFile,
    url: `/api/media/${mediaFile.id}`,
    checksum: mediaFile.checksum || checksum,
  };
}

/**
 * Retrieves metadata for a media file without loading heavy binary chunks.
 */
export async function getMediaMetadata(id: string) {
  return db.mediaFile.findUnique({
    where: { id },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      totalSize: true,
      totalChunks: true,
      chunkSize: true,
      width: true,
      height: true,
      checksum: true,
      createdAt: true,
    },
  });
}

/**
 * Retrieves a specific byte slice across chunk boundaries for HTTP 206 Range requests (YouTube-style streaming).
 */
export async function getMediaByteRange(id: string, startByte: number, endByte: number) {
  const meta = await getMediaMetadata(id);
  if (!meta) return null;

  const validStart = Math.max(0, startByte);
  const validEnd = Math.min(meta.totalSize - 1, endByte);
  if (validStart > validEnd) return null;

  const firstChunkIndex = Math.floor(validStart / meta.chunkSize);
  const lastChunkIndex = Math.floor(validEnd / meta.chunkSize);

  const chunks = await db.mediaChunk.findMany({
    where: {
      mediaFileId: id,
      chunkIndex: {
        gte: firstChunkIndex,
        lte: lastChunkIndex,
      },
    },
    orderBy: { chunkIndex: "asc" },
    select: { chunkIndex: true, data: true, size: true },
  });

  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const chunkStartInFile = chunk.chunkIndex * meta.chunkSize;
    const chunkEndInFile = chunkStartInFile + chunk.size - 1;

    // Determine overlap
    const sliceStart = Math.max(0, validStart - chunkStartInFile);
    const sliceEnd = Math.min(chunk.size, validEnd - chunkStartInFile + 1);

    if (sliceStart < sliceEnd) {
      buffers.push(Buffer.from(chunk.data).subarray(sliceStart, sliceEnd));
    }
  }

  const rangeBuffer = Buffer.concat(buffers);

  return {
    buffer: rangeBuffer,
    mimeType: meta.mimeType,
    filename: meta.filename,
    contentRange: `bytes ${validStart}-${validEnd}/${meta.totalSize}`,
    contentLength: rangeBuffer.length,
    totalSize: meta.totalSize,
    checksum: meta.checksum,
  };
}

/**
 * Creates a ReadableStream that sequentially fetches and streams all chunks.
 */
export function createMediaStream(id: string, totalChunks: number): ReadableStream<Uint8Array> {
  let currentChunkIndex = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (currentChunkIndex >= totalChunks) {
        controller.close();
        return;
      }

      try {
        const chunk = await db.mediaChunk.findUnique({
          where: {
            mediaFileId_chunkIndex: {
              mediaFileId: id,
              chunkIndex: currentChunkIndex,
            },
          },
          select: { data: true },
        });

        if (!chunk) {
          controller.close();
          return;
        }

        controller.enqueue(new Uint8Array(chunk.data));
        currentChunkIndex++;
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
