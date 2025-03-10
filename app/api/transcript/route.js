import { getSubtitles } from "youtube-caption-extractor";
import { headers } from "next/headers";

// Specify Node.js runtime with increased timeout
export const runtime = "nodejs";
export const maxDuration = 10; // Set maximum duration to 10 seconds

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function decodeHtmlEntities(text) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&nbsp;": " ",
  };

  // Replace named entities
  let decodedText = text;
  for (const [entity, char] of Object.entries(entities)) {
    decodedText = decodedText.replace(new RegExp(entity, "g"), char);
  }

  // Replace numeric entities (decimal and hexadecimal)
  decodedText = decodedText
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9A-F]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

  return decodedText;
}

export async function POST(request) {
  let videoId = null;
  let requestUrl = null;

  // Add CORS headers to all responses
  const responseHeaders = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  try {
    const { url } = await request.json();
    requestUrl = url;

    console.log("Processing request for URL:", url);

    if (!url) {
      console.log("URL is missing in request");
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    // Extract video ID from URL
    const matches = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/
    );

    videoId = matches?.[1];
    console.log("Extracted video ID:", videoId);

    if (!videoId) {
      console.log("Invalid YouTube URL format");
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    console.log("Fetching transcript for video ID:", videoId);

    // Try multiple language options with timeout
    const languagesToTry = ["en", "en-US", "en-GB", ""];
    let subtitles = null;
    let lastError = null;

    for (const lang of languagesToTry) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        const subtitlesPromise = getSubtitles({
          videoID: videoId,
          lang: lang,
        });

        subtitles = await Promise.race([subtitlesPromise, timeoutPromise]);

        if (subtitles && subtitles.length > 0) {
          break;
        }
      } catch (e) {
        lastError = e;
        console.log(`Failed to fetch with language ${lang}:`, e.message);
        continue;
      }
    }

    if (!subtitles || subtitles.length === 0) {
      throw new Error(
        lastError?.message || "No transcript available for this video"
      );
    }

    console.log("Transcript fetched successfully, items:", subtitles.length);

    // Combine all subtitle texts with proper spacing
    const rawTranscript = subtitles
      .map((item) => item.text.trim())
      .filter((text) => text.length > 0)
      .join(" ");

    // Decode HTML entities in the transcript
    const transcript = decodeHtmlEntities(rawTranscript);

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Transcript fetch error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      videoId: videoId,
      requestUrl: requestUrl,
      environment: process.env.NODE_ENV,
      runtime: process.env.VERCEL ? "vercel" : "local",
    });

    // Provide a user-friendly error message
    const userMessage =
      "This video's transcript cannot be accessed. This could be because:\n" +
      "1. The video doesn't have captions enabled\n" +
      "2. The captions are auto-generated\n" +
      "3. The video owner has disabled transcript access\n" +
      "4. The video might be region-restricted or private\n" +
      "5. The request timed out\n\n" +
      "Please try a different video that has manual captions enabled.";

    return new Response(
      JSON.stringify({
        error: userMessage,
        details:
          process.env.NODE_ENV === "development"
            ? {
                stack: error.stack,
                videoId: videoId,
                url: requestUrl,
              }
            : undefined,
      }),
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}
