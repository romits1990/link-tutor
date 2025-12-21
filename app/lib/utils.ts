import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

export const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch (e) {
        return false;
    }
};

export const chunkTextGenerator = async (text: string, chunkSize = 1000, chunkOverlap = 200): Promise<Document[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap
  });

  return await splitter.createDocuments([text]);
}