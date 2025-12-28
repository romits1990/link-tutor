'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUserJobsStatus } from '@/app/lib/hooks/useUserJobsStatus';
import JobRow from '@/app/components/job-row';
import type { JobWithSource } from '@/app/lib/types';

export function JobsList({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<JobWithSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const processedJobIdRef = useRef<string | null>(null);
  const jobsRef = useRef<JobWithSource[]>([]);
  
  // Subscribe to all job updates for this user
  const jobUpdates = useUserJobsStatus(userId);

  // Update status map whenever jobUpdates changes
  useEffect(() => {
    setStatusMap(prev => {
      let hasChanges = false;
      const updated = { ...prev };
      
      Object.entries(jobUpdates).forEach(([jobId, update]) => {
        if (updated[jobId] !== update.status) {
          updated[jobId] = update.status;
          hasChanges = true;
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }, [jobUpdates]);

  // Memoized function to fetch and add a single job
  const fetchAndAddJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/ingestion/jobs/${jobId}`);
      const newJob: JobWithSource = await response.json();
      
      setJobs(prev => {
        if (prev.some(j => j.id === jobId)) {
          return prev;
        }
        jobsRef.current = [newJob, ...prev];
        return jobsRef.current;
      });
      setHighlightedJobId(jobId);
    } catch (error) {
      console.error('Failed to fetch new job:', error);
    }
  }, []);

  useEffect(() => {
    // Fetch initial jobs only once on mount
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/ingestion/jobs/list');
        const data: JobWithSource[] = await response.json();
        jobsRef.current = data;
        setJobs(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Extract jobId from URL and fetch if new
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    
    if (jobId && jobId !== processedJobIdRef.current) {
      processedJobIdRef.current = jobId;
      fetchAndAddJob(jobId);
    }

    // Listen for URL changes via popstate
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const newJobId = params.get('jobId');
      if (newJobId && newJobId !== processedJobIdRef.current) {
        processedJobIdRef.current = newJobId;
        fetchAndAddJob(newJobId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchAndAddJob]);

  // Memoized jobs with applied status updates to prevent unnecessary JobRow re-renders
  const jobsWithStatus = useMemo(() => {
    return jobs.map(job => ({
      ...job,
      status: (statusMap[job.id] as any) || job.status
    }));
  }, [jobs, statusMap]);

  if (isLoading && jobs.length === 0) {
    return <div className="text-center py-8 text-gray-500">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No jobs yet. Submit a page URL to get started!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white">
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">URL</th>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Status</th>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Progress</th>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Created</th>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobsWithStatus.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              isHighlighted={highlightedJobId === job.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
