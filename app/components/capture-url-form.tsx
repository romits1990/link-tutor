'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { submitUrl } from '@/app/actions/ingestion';

export function CaptureUrlForm() {
  const [pageUrl, setPageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      await submitUrl(pageUrl);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add Page URL</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pageUrl" className="block text-sm font-medium mb-2">
            Page URL
          </label>
          <input
            id="pageUrl"
            type="url"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
