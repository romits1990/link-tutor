import type { IngestionJob } from '@prisma/client';

export interface JobWithSource extends IngestionJob {
  source: {
    id: string;
    url: string;
    title: string | null;
  };
}
