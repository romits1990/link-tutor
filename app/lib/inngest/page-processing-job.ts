import { inngest } from "@/app/lib/inngest/client";
import { prisma } from "@/app/lib/prisma";
import { IngestionRepository } from "@/app/repositories/ingestion";
import { EmbeddingsRepository } from "@/app/repositories/embeddings";
import type { Document } from "@langchain/core/documents";
import { embeddings } from "@/app/lib/embeddings";
import { chunkTextGenerator } from "@/app/lib/utils";

const ingestionRepo = new IngestionRepository(prisma);
const embeddingsRepo = new EmbeddingsRepository(prisma);

export const processIndividualPage = inngest.createFunction(
  { id: "process-page" },
  { event: "crawler/page.discovered" },
  async ({ event, step }) => {
    const { jobId, url: sourceUrl, content } = event.data;
    
    // STEP 1: Chunking logic using your utility
    const documents: Document[] = await step.run("chunk-content", async () => {
      return await chunkTextGenerator(content, { sourceUrl });
    });

    // STEP 2: Vector generation using your class
    const vectors = await step.run("generate-vectors", async () => {
      // Inngest will automatically retry if HuggingFace is loading (503)
      return await embeddings.generateVectors(documents);
    });

    // STEP 3: Store vectors in your vector DB
    await step.run("store-vectors", async () => {
      // Bulk save all vectors generated for this page in one go
        return await embeddingsRepo.savePageVectorsBulk(vectors, sourceUrl);
    });

    // STEP 4: Atomic DB Update
    await step.run("increment-and-signal", async () => {
      await ingestionRepo.updateById(jobId, {
            processedPages: { increment: 1 }
      });
      // Signal back to the main function's waitForEvent
      await inngest.send({
        name: "ingestion/page.processed",
        data: { jobId }
      });
    });
  }
);