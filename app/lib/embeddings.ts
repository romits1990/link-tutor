import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import type { Document } from "@langchain/core/documents";
export type VectorDocument = Document & { vector: number[] };

class Embeddings extends HuggingFaceInferenceEmbeddings {
    constructor() {
      super({
          model: process.env.HUGGINGFACE_EMBEDDINGS_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
          apiKey: process.env.HUGGINGFACE_API_KEY,
      })
    }

    generateVectors = async (documents: Document[]): Promise<VectorDocument[]> => {
      const rawVectors: number[][] = await this.embedDocuments(documents.map((d) => d.pageContent));
      return documents.map((doc, index) => ({
          ...doc,
          vector: rawVectors[index]
      }));
    }
}

export const embeddings = new Embeddings();
