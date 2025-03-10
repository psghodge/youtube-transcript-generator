import { google } from "googleapis";

// Initialize the YouTube API client
const youtube = google.youtube("v3");

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

function extractVideoId(url) {
  const matches = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/
  );
  return matches?.[1];
}

export async function POST(request) {
  if (!process.env.YOUTUBE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "YouTube API key not configured" }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { url } = await request.json();
    const videoId = extractVideoId(url);

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get caption tracks
    const captionResponse = await youtube.captions.list({
      key: process.env.YOUTUBE_API_KEY,
      part: "snippet",
      videoId: videoId,
    });

    const captionTracks = captionResponse.data.items || [];
    if (captionTracks.length === 0) {
      throw new Error("No captions available for this video");
    }

    // Find English captions, preferring manual over auto-generated
    const selectedTrack =
      captionTracks.find(
        (track) =>
          track.snippet.language === "en" && !track.snippet.trackKind === "ASR"
      ) || captionTracks.find((track) => track.snippet.language === "en");

    if (!selectedTrack) {
      throw new Error("No English captions available for this video");
    }

    // Download the caption track
    const transcriptResponse = await youtube.captions.download({
      key: process.env.YOUTUBE_API_KEY,
      id: selectedTrack.id,
      tfmt: "srt", // Request transcript in SRT format
    });

    // Clean up the SRT format to get plain text
    const transcript = transcriptResponse.data
      .replace(
        /\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g,
        ""
      )
      .replace(/\n\n/g, " ")
      .trim();

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Transcript fetch error:", {
      message: error.message,
      name: error.name,
      environment: process.env.NODE_ENV,
    });

    const userMessage =
      "This video's transcript cannot be accessed. This could be because:\n" +
      "1. The video doesn't have captions enabled\n" +
      "2. The captions are not available in English\n" +
      "3. The video owner has disabled transcript access\n" +
      "4. The video might be region-restricted or private";

    return new Response(
      JSON.stringify({
        error: userMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
