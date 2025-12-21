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
}