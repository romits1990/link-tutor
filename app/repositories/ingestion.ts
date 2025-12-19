import { PrismaClient } from "@prisma/client";
import { KNOWLEDGE_DEPTH_CRAWL_CONFIG } from "@/app/lib/constants";
import { type KnowledgeDepth } from "@/app/lib/validation";
import { type IngestionJob } from "@prisma/client";

export class IngestionRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createSourceIngestionJob(userId: string, pageUrl: string, knowledgeDepth: KnowledgeDepth): Promise<IngestionJob> {
        const source = await this.prisma.source.create({
            data: {
                userId: userId,
                url: pageUrl,
                crawlDepth: KNOWLEDGE_DEPTH_CRAWL_CONFIG[knowledgeDepth].MAX_DEPTH,
                jobs: {
                    create: [ { userId: userId } ]
                }
            },
            select: { jobs: true }
        });
        
       return source.jobs[0];
    }
}
