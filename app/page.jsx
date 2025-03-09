"use client";

import { useState } from "react";
import Summary from "../components/Summary";

export default function Page() {
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGetTranscript = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    setTranscript(null);
    setCopySuccess(false);

    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transcript");
      }

      setTranscript(data.transcript);
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary);
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopySuccess(true);
      // Reset copy success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 mt-20">
          Generate YouTube Transcript
        </h1>

        <form onSubmit={handleGetTranscript} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a YouTube URL to get its transcript instantly"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors cursor-pointer"
              disabled={loading}
            >
              Get Transcript
            </button>
          </div>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {transcript && (
          <div className="mb-6 relative">
            <h2 className="text-2xl font-semibold mb-4">Transcript</h2>
            <div className="relative">
              <div className="bg-gray-50 p-4 pb-16 rounded-lg h-[50vh] overflow-y-auto whitespace-pre-wrap">
                {transcript}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 to-transparent py-4">
                <div className="flex justify-end px-4 gap-2">
                  <button
                    onClick={handleCopyTranscript}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer shadow-sm"
                  >
                    Generate Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {summary && <Summary summary={summary} />}
      </div>
    </main>
  );
}
