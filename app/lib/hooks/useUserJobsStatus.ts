import { useEffect, useState } from 'react';
import PusherClient from 'pusher-js';
import type { IngestionJob } from '@prisma/client';

export interface JobStatusUpdate {
  jobId: string;
  status: IngestionJob['status'];
  message?: string;
}

/**
 * Hook that listens for all job status updates for a specific user
 * Subscribes to user-specific channel: user-${userId}
 * @param userId - The ID of the user
 * @returns A map of jobId -> JobStatusUpdate for all jobs that have been updated
 */
export function useUserJobsStatus(userId: string | null) {
  const [jobUpdates, setJobUpdates] = useState<Record<string, JobStatusUpdate>>({});

  useEffect(() => {
    if (!userId) return;

    const pusher = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );

    // Subscribe to user-specific channel
    const channel = pusher.subscribe(`user-${userId}`);

    const handleJobUpdate = (data: JobStatusUpdate) => {
      setJobUpdates((prev) => ({
        ...prev,
        [data.jobId]: data,
      }));
    };

    channel.bind('job-complete', handleJobUpdate);

    return () => {
      channel.unbind('job-complete', handleJobUpdate);
      pusher.unsubscribe(`user-${userId}`);
      pusher.disconnect();
    };
  }, [userId]);

  return jobUpdates;
}
