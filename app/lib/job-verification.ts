import { prisma } from '@/app/lib/prisma';
import { IngestionJob } from '@prisma/client';

/**
 * Verifies that a job exists and belongs to the specified user
 * @param jobId - The job ID to verify
 * @param userId - The user ID to check ownership against
 * @returns The job if verification passes
 * @throws Error if job doesn't exist or doesn't belong to user
 */
export async function verifyJobOwnership(jobId: string, userId: string): Promise<IngestionJob> {
  const job = await prisma.ingestionJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== userId) {
    throw new Error('Unauthorized access to job');
  }

  return job;
}
