import { PrismaClient, IngestionJob, IngestionJobStatus, Prisma } from "@prisma/client";
import { CRAWL_CONFIG } from "../constants";

export class IngestionRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getById(jobId: string): Promise<IngestionJob | null> {
        return await this.prisma.ingestionJob.findUnique({
            where: { id: jobId }
        });
    }

    async updateById(jobId: string, data: Prisma.IngestionJobUpdateInput): Promise<IngestionJob | null> {
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
}