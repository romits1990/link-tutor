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

export type ChunkTextOptions = {
    chunkSize?: number;
    chunkOverlap?: number;
};

export const chunkTextGenerator = async (
    text: string,
    metaData: any, 
    options: ChunkTextOptions = {
        chunkSize: 1000,
        chunkOverlap: 200
    }): Promise<Document[]> => {
        const splitter = new RecursiveCharacterTextSplitter({...options});
        return await splitter.createDocuments([text], [metaData]);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CRAWLING':
      return 'bg-blue-100 text-blue-800';
    case 'VECTORIZING':
      return 'bg-purple-100 text-purple-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};