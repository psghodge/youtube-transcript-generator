import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request) {
  try {
    // Verify API key is present
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const { transcript } = await request.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Transcript is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI designed to generate detailed, structured summaries of long-form content, such as transcripts, articles, or videos. Your goal is to distill the material into a clear, concise, and comprehensive overview while preserving key details, steps, and intent. Break the summary into logical sections with headings (e.g., Introduction, Part 1, Key Takeaways) to enhance readability. Focus on actionable insights, technical instructions, and the presenter’s main points, avoiding unnecessary filler. Use bullet points or numbered lists for clarity where appropriate. Do not invent information; base your summary solely on the provided content. Aim for a balance between brevity and depth, ensuring a non-expert can understand the material while retaining value for experienced users.",
        },
        {
          role: "user",
          content: `Please provide a detailed summary of the following transcript, using the exact formatting shown in the example:\n\n${transcript}`,
        },
      ],
      max_tokens: 5000,
    });

    const summary = completion.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate summary",
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
