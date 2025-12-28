'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { JobWithSource } from '@/app/lib/types';
import { getStatusColor } from '@/app/lib/utils';

interface JobRowProps {
  job: JobWithSource;
  isHighlighted: boolean;
}

const JobRow = memo(function JobRow({ job, isHighlighted }: JobRowProps) {
  // Status is now provided by parent via job prop (updated via parent's useUserJobsStatus hook)
  const currentStatus = job.status;

  return (
    <tr
      className={`transition ${
        isHighlighted
          ? 'bg-yellow-50 border-yellow-300'
          : 'hover:bg-gray-50'
      }`}
    >
      <td className="border border-gray-200 px-4 py-2">
        <a
          href={job.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate block max-w-xs"
          title={job.source.url}
        >
          {job.source.title || new URL(job.source.url).hostname}
        </a>
      </td>
      <td className="border border-gray-200 px-4 py-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}
        >
          {currentStatus}
        </span>
      </td>
      <td className="border border-gray-200 px-4 py-2">
        {currentStatus === 'COMPLETED' ? (
          <span className="text-green-600 font-semibold">Done</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${job.totalPages > 0 ? (job.processedPages / job.totalPages) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {job.processedPages}/{job.totalPages}
            </span>
          </div>
        )}
      </td>
      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
        {new Date(job.createdAt).toLocaleDateString()}
      </td>
      <td className="border border-gray-200 px-4 py-2">
        <Link
          href={`/chat?jobId=${job.id}`}
          className={`inline-block px-4 py-2 rounded font-medium transition ${
            currentStatus === 'COMPLETED'
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (currentStatus !== 'COMPLETED') {
              e.preventDefault();
            }
          }}
        >
          Chat
        </Link>
      </td>
    </tr>
  );
});

export default JobRow;