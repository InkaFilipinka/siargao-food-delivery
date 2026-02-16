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
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Something went wrong
        </h1>
        <pre className="text-left text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg overflow-auto mb-6">
          {error.message}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
