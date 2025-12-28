'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserJobsStatus } from '@/app/lib/hooks/useUserJobsStatus';
import JobRow from '@/app/components/job-row';
import type { JobWithSource } from '@/app/lib/types';

export function JobsList({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<JobWithSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);
  const fetchedJobIdsRef = useRef<Set<string>>(new Set());
  const hasInitialFetchRef = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Subscribe to all job updates for this user only after component mounts
  const jobUpdates = useUserJobsStatus(hasMounted ? userId : null);

  // Fetch initial jobs on mount
  useEffect(() => {
    if (hasInitialFetchRef.current) return;
    hasInitialFetchRef.current = true;

    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/ingestion/jobs/list');
        const data: JobWithSource[] = await response.json();
        setJobs(data);
        // Mark all initial jobs as fetched
        data.forEach(job => fetchedJobIdsRef.current.add(job.id));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setIsLoading(false);
      }
    };

    fetchJobs();
    setHasMounted(true);
  }, []);

  // Handle new jobs from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    
    if (jobId && !fetchedJobIdsRef.current.has(jobId)) {
      fetchedJobIdsRef.current.add(jobId);
      setHighlightedJobId(jobId);
      
      const fetchNewJob = async () => {
        try {
          const response = await fetch(`/api/ingestion/jobs/${jobId}`);
          const newJob: JobWithSource = await response.json();
          setJobs(prev => {
            // update status for existing
            const exists = prev.some(job => job.id === newJob.id);
            if (exists) {
              return prev.map(job => job.id === newJob.id ? newJob : job);
            }
            // add new
            return [...prev, newJob];
          });
        } catch (error) {
          console.error('Failed to fetch new job:', error);
        }
      };
      
      fetchNewJob();
    }
  }, []);

  // Update job status based on Pusher updates
  useEffect(() => {
    if (Object.keys(jobUpdates).length === 0) return;

    setJobs(prev =>
      prev.map(job => ({
        ...job,
        status: jobUpdates[job.id]?.status || job.status
      }))
    );
  }, [jobUpdates]);

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
          {jobs.map((job) => (
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
