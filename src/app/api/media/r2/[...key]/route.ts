import { getFromR2, headR2, r2 } from "@/lib/r2";

const R2_BUCKET = process.env.R2_BUCKET || "cmi-media";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = decodeURIComponent(keyParts.join("/"));

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if Range request
    const rangeHeader = request.headers.get("Range");

    if (rangeHeader) {
      // Handle Range requests for video streaming
      const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;

        const head = await headR2(key);
        if (!head) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const totalSize = head.ContentLength || 0;
        const endByte = end !== undefined ? end : totalSize - 1;
        const contentLength = endByte - start + 1;

        const response = await r2.send(
          new (await import("@aws-sdk/client-s3")).GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Range: `bytes=${start}-${endByte}`,
          })
        );

        const body = response.Body as ReadableStream;
        return new Response(body, {
          status: 206,
          headers: {
            "Content-Type": response.ContentType || "application/octet-stream",
            "Content-Length": String(contentLength),
            "Content-Range": `bytes ${start}-${endByte}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Full file request
    const response = await getFromR2(key);

    if (!response.Body) {
      return new Response(JSON.stringify({ error: "Empty response" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.ContentType || "application/octet-stream");
    if (response.ContentLength) {
      headers.set("Content-Length", String(response.ContentLength));
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    if (response.ETag) {
      headers.set("ETag", response.ETag);
    }

    return new Response(response.Body as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[API Media R2 GET]", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = decodeURIComponent(keyParts.join("/"));

    if (!key) {
      return new Response(null, { status: 400 });
    }

    const head = await headR2(key);
    if (!head) {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", head.ContentType || "application/octet-stream");
    if (head.ContentLength) {
      headers.set("Content-Length", String(head.ContentLength));
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    if (head.ETag) {
      headers.set("ETag", head.ETag);
    }

    return new Response(null, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new Response(null, { status: 404 });
    }
    console.error("[API Media R2 HEAD]", error);
    return new Response(null, { status: 500 });
  }
}
