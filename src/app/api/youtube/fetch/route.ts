import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/** Extract YouTube Video ID from various URL formats or raw ID */
function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const cleanInput = input.trim();

  // If input is already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Regex patterns for YouTube URLs (watch, shorts, embed, youtu.be, etc.)
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
  ];

  for (const regex of regexes) {
    const match = cleanInput.match(regex);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlOrId = searchParams.get("url") || searchParams.get("id");

    if (!urlOrId) {
      return apiError("YouTube URL or Video ID is required", 400);
    }

    const videoId = extractYouTubeVideoId(urlOrId);
    if (!videoId) {
      return apiError("Invalid YouTube URL or Video ID format", 400);
    }

    const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeWatchUrl)}&format=json`;

    let title = "YouTube Event Video";
    let authorName = "";
    let oembedData: any = null;

    try {
      const oembedRes = await fetch(oembedUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 3600 },
      });

      if (oembedRes.ok) {
        oembedData = await oembedRes.json();
        title = oembedData.title || title;
        authorName = oembedData.author_name || "";
      }
    } catch (e) {
      console.warn("[YouTube oEmbed fetch warning]", e);
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const maxResThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return apiSuccess({
      videoId,
      title,
      authorName,
      thumbnailUrl,
      maxResThumbnailUrl,
      embedUrl,
      rawUrl: youtubeWatchUrl,
    });
  } catch (error) {
    console.error("[YouTube API Fetch Error]", error);
    return apiError("Internal server error fetching YouTube video data", 500);
  }
}
