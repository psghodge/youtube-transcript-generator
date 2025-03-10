import { getSubtitles } from "youtube-caption-extractor";

// Specify Node.js runtime
export const runtime = "nodejs";

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

  try {
    const { url } = await request.json();
    requestUrl = url;

    console.log("Processing request for URL:", url);

    if (!url) {
      console.log("URL is missing in request");
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Fetching transcript for video ID:", videoId);

    // Fetch transcript using youtube-caption-extractor
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: "en", // Try English first
    });

    if (!subtitles || subtitles.length === 0) {
      throw new Error("No transcript available for this video");
    }

    console.log("Transcript fetched successfully, items:", subtitles.length);

    // Combine all subtitle texts
    const rawTranscript = subtitles.map((item) => item.text).join(" ");

    // Decode HTML entities in the transcript
    const transcript = decodeHtmlEntities(rawTranscript);

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
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
      "3. The video owner has disabled transcript access\n\n" +
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
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
