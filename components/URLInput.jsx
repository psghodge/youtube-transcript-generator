"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function URLInput({ url, setUrl, onSubmit, loading }) {
  return (
    <Card className="p-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-[0.5px] border-gray-200/50 dark:border-gray-700/50 rounded-xl animate-slide-up">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Enter YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-12 text-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-900/80 rounded-lg placeholder:text-gray-400"
          onKeyDown={(e) => {
            if (e.key === "Enter" && url && !loading) {
              onSubmit();
            }
          }}
        />
        <Button
          onClick={onSubmit}
          disabled={loading || !url}
          className="h-12 px-6 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            "Get Transcript"
          )}
        </Button>
      </div>
    </Card>
  );
}
