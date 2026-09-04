import { NextRequest, NextResponse } from "next/server";
import { getMediaMetadata, getMediaByteRange, createMediaStream } from "@/lib/media-storage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    const rangeHeader = request.headers.get("range");

    // 1. Handle HTTP 206 Range requests (Progressive Video/Audio/Image Chunk Streaming)
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const meta = await getMediaMetadata(id);
      if (!meta) {
        return new NextResponse("Media not found", { status: 404 });
      }

      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : meta.totalSize - 1;

      const rangeResult = await getMediaByteRange(id, start, end);
      if (!rangeResult) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${meta.totalSize}` },
        });
      }

      return new NextResponse(rangeResult.buffer, {
        status: 206,
        headers: {
          "Content-Range": rangeResult.contentRange,
          "Accept-Ranges": "bytes",
          "Content-Length": rangeResult.contentLength.toString(),
          "Content-Type": rangeResult.mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "ETag": `"${rangeResult.checksum}"`,
        },
      });
    }

    // 2. Full Media Streaming (HTTP 200)
    const meta = await getMediaMetadata(id);
    if (!meta) {
      return new NextResponse("Media not found", { status: 404 });
    }

    const stream = createMediaStream(id, meta.totalChunks);

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": meta.mimeType,
        "Content-Length": meta.totalSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": `"${meta.checksum}"`,
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.filename)}"`,
      },
    });
  } catch (error) {
    console.error("[API Media GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const meta = await getMediaMetadata(id);
    if (!meta) {
      return new NextResponse("Media not found", { status: 404 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": meta.mimeType,
        "Content-Length": meta.totalSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": `"${meta.checksum}"`,
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
