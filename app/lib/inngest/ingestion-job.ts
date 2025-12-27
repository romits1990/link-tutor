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

    // STEP 4: Wait for the last page to finish
    // This pauses the function until the processing job sends a 'page.processed' signal
    await step.waitForEvent("wait-for-all-pages", {
        event: "ingestion/page.processed", 
        timeout: "2h",
        match: "data.jobId",
        // Use an async function to get fresh DB data
        if: (async () => {
            const job = await ingestionRepo.getById(jobId);
            console.log({job})
            // Ensure job exists and all pages are processed
            return !!job && job.totalPages > 0 && job.processedPages >= job.totalPages;
        }) as any
    });

    await step.run("finalize-ingestion-job", async () => {
      return await ingestionRepo.updateJobStatus(jobId, "COMPLETED");
    });

    // STEP 5: Trigger your new Notification Job
    await step.sendEvent("trigger-final-notification", {
      name: "notification/crawl-completed",
      data: { jobId, userId }
    });

    
  }
);