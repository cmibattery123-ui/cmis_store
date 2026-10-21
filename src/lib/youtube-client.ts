/**
 * Client-Side YouTube Utility
 * Fetches video metadata, thumbnails, and embed links directly from YouTube in the browser
 * without routing video data through the server.
 */

/** Extract 11-char YouTube Video ID from any URL format or raw ID */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const cleanInput = input.trim();

  // If input is already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Regex patterns for YouTube URLs (watch, shorts, embed, youtu.be, live, etc.)
  const regexes = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
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

/** Generate all direct YouTube links from any video URL or ID */
export function getYouTubeLinks(urlOrId: string) {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  return {
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxResThumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

/** Helper to convert any YouTube URL to a direct embed URL */
export function toYouTubeEmbedUrl(urlOrId: string): string {
  const links = getYouTubeLinks(urlOrId);
  return links ? links.embedUrl : urlOrId;
}

/**
 * Fetch video metadata directly in the browser via YouTube's public oEmbed API.
 * This completely avoids server roundtrips or backend proxying.
 */
export async function fetchYouTubeOembedDirect(urlOrId: string): Promise<{
  title: string;
  authorName: string;
  thumbnailUrl: string;
  embedUrl: string;
  watchUrl: string;
  videoId: string;
} | null> {
  const links = getYouTubeLinks(urlOrId);
  if (!links) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(links.watchUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || "YouTube Event Video",
        authorName: data.author_name || "",
        thumbnailUrl: links.thumbnailUrl,
        embedUrl: links.embedUrl,
        watchUrl: links.watchUrl,
        videoId: links.videoId,
      };
    }
  } catch (err) {
    console.warn("[Client YouTube oEmbed fetch error, fallback to direct links]", err);
  }

  return {
    title: "YouTube Event Video",
    authorName: "",
    thumbnailUrl: links.thumbnailUrl,
    embedUrl: links.embedUrl,
    watchUrl: links.watchUrl,
    videoId: links.videoId,
  };
}
