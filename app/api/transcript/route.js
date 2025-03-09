import { YoutubeTranscript } from "youtube-transcript";

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
  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Extract video ID from URL
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/
    )?.[1];

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Fetch transcript
    const transcriptList = await YoutubeTranscript.fetchTranscript(videoId);
    const rawTranscript = transcriptList.map((item) => item.text).join(" ");

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
      stack: error.stack,
      videoId,
      url,
    });
    return new Response(
      JSON.stringify({
        error: `Failed to fetch transcript: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
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
