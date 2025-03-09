import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const Summary = ({ summary }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <div className="bg-gray-50 p-4 rounded-lg relative">
          <ReactMarkdown
            components={{
              root: ({ node, ...props }) => (
                <div className="prose prose-blue max-w-none" {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold mb-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 mb-4" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            }}
          >
            {summary}
          </ReactMarkdown>
          <button
            onClick={handleCopy}
            className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default Summary;
