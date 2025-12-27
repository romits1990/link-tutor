import { PrismaClient } from "@prisma/client";
import { VectorDocument } from "@/app/lib/embeddings";

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
}