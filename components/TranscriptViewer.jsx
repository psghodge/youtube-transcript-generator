"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function TranscriptViewer({ transcript }) {
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSummary = async () => {
    if (!transcript) return;
    try {
      setLoadingSummary(true);
      setSummaryError("");

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
      console.error("Summary error:", error);
      setSummaryError(error.message || "Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!transcript) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="p-6 relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-[0.5px] border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg">
        <div className="relative h-[40vh]">
          <Textarea
            value={transcript}
            readOnly
            className="absolute inset-0 w-full h-full p-4 text-lg leading-relaxed bg-transparent border-none focus:ring-0 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          />
        </div>
        <div className="absolute bottom-6 right-6 flex space-x-4">
          <Button
            onClick={generateSummary}
            disabled={loadingSummary}
            className="transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md hover:shadow-lg bg-violet-600 hover:bg-violet-700"
          >
            {loadingSummary ? "Generating..." : "Generate Summary"}
          </Button>
          <Button
            onClick={copyToClipboard}
            className={`transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md hover:shadow-lg ${
              copied
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </Card>

      {summaryError && (
        <div className="p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-center backdrop-blur-sm">
          {summaryError}
        </div>
      )}

      {summary && (
        <Card className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-[0.5px] border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Summary
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary}
          </p>
        </Card>
      )}
    </div>
  );
}
