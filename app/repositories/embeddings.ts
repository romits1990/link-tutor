import { PrismaClient } from "@prisma/client";
import { VectorDocument } from "@/app/lib/embeddings";
import { SimilarDocument } from "../lib/types";

export class EmbeddingsRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async savePageVectorsBulk(vectors: VectorDocument[], sourceUrl: string) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. DELETE existing vectors for this specific URL to prevent duplicates
            // We search inside the JSONB metadata field for the sourceUrl
            await tx.$executeRaw`
                DELETE FROM "Document" 
                WHERE "metadata"->>'sourceUrl' = ${sourceUrl}
            `;

            // 2. INSERT new vectors
            const query = `
                INSERT INTO "Document" ("id", "content", "metadata", "embedding")
                VALUES ${vectors.map((_, i) => 
                    `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}::vector)`
                ).join(', ')}
            `;

            const flattenedValues = vectors.flatMap((doc) => [
                crypto.randomUUID(), // Always new IDs for fresh chunks
                doc.pageContent,
                JSON.stringify({ ...doc.metadata }),
                `[${doc.vector.join(",")}]`
            ]);

            return await tx.$executeRawUnsafe(query, ...flattenedValues);
        });
    }

    /**
     * Performs a Cosine Similarity search using pgvector
     * 1 - Cosine Distance = Cosine Similarity
     */
    async querySimilarDocuments(jobId: string, queryVector: number[], limit: number = 5): Promise<SimilarDocument[]> {
        // We use $queryRaw because Prisma doesn't natively support vector operators yet
        const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                "id", 
                "content", 
                "metadata", 
                1 - ("embedding" <=> ${JSON.stringify(queryVector)}::vector) as similarity
            FROM "Document"
            WHERE "metadata"->>'jobId' = ${jobId}
            ORDER BY "embedding" <=> ${JSON.stringify(queryVector)}::vector
            LIMIT ${limit};
        `;

        return results;
    }
}