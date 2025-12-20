import { inngest } from "@/app/lib/inngest/client";
import { prisma } from "@/app/lib/prisma";
import { IngestionRepository } from "@/app/repositories/ingestion";
import { Crawler, EVENT_TYPES as CRAWLER_EVENT_TYPES } from "url-crawler";
import type { PageProcessedEventPayload } from "url-crawler";
import { CRAWL_CONFIG } from "@/app/constants";

export type IngestionJobRequestPayload = {
  jobId: string;
  userId: string;
  pageUrl: string
};

// Initialize ONCE at the top level
const ingestionRepo = new IngestionRepository(prisma);

export const processIngestion = inngest.createFunction(
  {
    id: "process-ingestion-job",
    concurrency: 2
  },
  { event: "ingestion/job.created" },

  async ({ event, step }) => {
    const { jobId, userId, pageUrl }: IngestionJobRequestPayload = event.data;

    // STEP 1: Update DB to CRAWLING
    // If the DB call fails, Inngest retries just this block.
    await step.run("mark-as-crawling", async () => {
      return await ingestionRepo.updateJobStatus(jobId, "CRAWLING");
    });

    // STEP 2: Start Crawl
    const crawlResult = await step.run("initiate-crawl-stream", async () => {
      return new Promise<{ totalPages: number }>((resolve, reject) => {
        const crawler = new Crawler(pageUrl, CRAWL_CONFIG);
        let processedPageCount= 0;
        crawler.on(CRAWLER_EVENT_TYPES.PAGE_PROCESSED, async (crawlEventdata: PageProcessedEventPayload) => {
          processedPageCount++;
          await inngest.send({
            name: "crawler/page.discovered",
            data: {
              ...crawlEventdata,
              jobId: jobId,
              userId: userId
            }
          });
        });
        crawler.on(CRAWLER_EVENT_TYPES.CRAWL_COMPLETED, () => resolve({ totalPages: processedPageCount }));
        crawler.on(CRAWLER_EVENT_TYPES.CRAWL_ERROR, reject);
        crawler.startCrawl();
      });
    });

    // STEP 3: Set status to VECTORIZING and save the target count
    await step.run("mark-vectorizing", async () => {
      return await ingestionRepo.updateById(jobId, { 
        status: "VECTORIZING",
        totalPages: crawlResult.totalPages
      });
    });
  }
);


export const processIndividualPage = inngest.createFunction(
  { id: "process-page" },
  { event: "crawler/page.discovered" },
  async ({ event, step }) => {
    const { jobId, pageUrl, content } = event.data;
    
    // 1. Heavy Work (LLM / Vector DB)
    await step.run("vectorize", async () => {
      // ... logic ...
    });

    // 2. Increment and Check Completion
    await step.run("update-progress", async () => {
      return await ingestionRepo.incrementPageProgress(jobId);
    });
  }
);