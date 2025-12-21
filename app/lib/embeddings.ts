import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import type { Document } from "@langchain/core/documents";

class Embeddings extends HuggingFaceInferenceEmbeddings {
    constructor() {
        super({
            model: process.env.HUGGINGFACE_EMBEDDINGS_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
            apiKey: process.env.HUGGINGFACE_API_KEY,
        })
    }

    generateVectors = async (documents: Document[]): Promise<number[][]> => {
        return await this.embedDocuments(documents.map((d) => d.pageContent));
    }
}

export const embeddings = new Embeddings();
