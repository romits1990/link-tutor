import { PrismaClient, IngestionJob, IngestionJobStatus } from "@prisma/client";
import { CRAWL_CONFIG } from "../constants";

export class IngestionRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async updateById(jobId: string, data: Partial<IngestionJob>): Promise<IngestionJob | null> {
        return await this.prisma.ingestionJob.update({
            where: { id: jobId },
            data
        });
    }

    /**
     * Initial creation (Used in your Route Handler)
     * Sets status to PENDING by default
     */
    async createSourceIngestionJob(userId: string, pageUrl: string): Promise<IngestionJob> {
        const source = await this.prisma.source.create({
            data: {
                userId,
                url: pageUrl,
                crawlDepth: CRAWL_CONFIG.MAX_DEPTH,
                jobs: {
                    create: [{ userId }]
                }
            },
            include: { jobs: true }
        });
        
        return source.jobs[0];
    }

    /**
     * Status updates (Used inside Inngest step.run blocks)
     */
    async updateJobStatus(jobId: string, status: IngestionJobStatus): Promise<IngestionJob> {
        return await this.prisma.ingestionJob.update({
            where: { id: jobId },
            data: { status }
        });
    }

    /**
     * Updates page progress and automatically marks job as COMPLETED
     * if the last page has been processed.
     */
    async incrementPageProgress(jobId: string): Promise<IngestionJob> {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Atomically increment the counter and get the fresh state
            const updatedJob = await tx.ingestionJob.update({
                where: { id: jobId },
                data: { 
                    processedPages: { increment: 1 } 
                },
            });

            // 2. Check if we've reached the target. 
            // Because we are in a transaction, 'updatedJob' is guaranteed 
            // to be the current state after our specific increment.
            if (updatedJob.processedPages >= updatedJob.totalPages && updatedJob.status !== "COMPLETED") {
                return await tx.ingestionJob.update({
                    where: { id: jobId },
                    data: { status: "COMPLETED" }
                });
            }

            return updatedJob;
        });
    }
}