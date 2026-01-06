import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { VectorDocument } from "@/app/lib/embeddings";
import { SimilarDocument } from "../lib/types";

export class EmbeddingsRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async savePageVectorsBulk(vectors: VectorDocument[], sourceUrl: string) {
        console.log(`[EmbeddingsRepository] Saving ${vectors.length} vectors for ${sourceUrl}`);
        if (vectors.length === 0) {
            console.warn(`[EmbeddingsRepository] No vectors to save for ${sourceUrl}`);
            return;
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. DELETE existing vectors for this specific URL to prevent duplicates
                await tx.$executeRaw`
                    DELETE FROM "Document" 
                    WHERE "metadata"->>'sourceUrl' = ${sourceUrl}
                `;

                // 2. INSERT new vectors - insert one at a time with proper casting
                for (const doc of vectors) {
                    await tx.$executeRaw`
                        INSERT INTO "Document" ("id", "content", "metadata", "embedding")
                        VALUES (
                            ${crypto.randomUUID()},
                            ${doc.pageContent},
                            ${JSON.stringify({ ...doc.metadata })}::jsonb,
                            ${'[' + doc.vector.join(',') + ']'}::vector
                        )
                    `;
                }
            });
        } catch (error) {
            console.error(`[EmbeddingsRepository] Error saving vectors for ${sourceUrl}:`, error);
            throw error;
        }
    }

    /**
     * Performs a Cosine Similarity search using pgvector
     * 1 - Cosine Distance = Cosine Similarity
     */
    async querySimilarDocuments(sourceUrlMeta: string, queryVector: number[], limit: number = 5): Promise<SimilarDocument[]> {
        // We use $queryRaw because Prisma doesn't natively support vector operators yet
        const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                "id", 
                "content", 
                "metadata", 
                1 - ("embedding" <=> ${JSON.stringify(queryVector)}::vector) as similarity
            FROM "Document"
            WHERE "metadata"->>'sourceUrl' = ${sourceUrlMeta}
            ORDER BY "embedding" <=> ${JSON.stringify(queryVector)}::vector
            LIMIT ${limit};
        `;

        return results;
    }
}