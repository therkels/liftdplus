"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // This will print the actual stack/message into the console
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4">
          {error?.message || "A client-side exception occurred."}
        </p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
          >
            Try again
          </button>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-lg border"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
