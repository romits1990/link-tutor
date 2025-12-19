import { isValidUrl } from "@/app/lib/utils";
import { KNOWLEDGE_DEPTHS } from "@/app/lib/constants";

export type KnowledgeDepth = (typeof KNOWLEDGE_DEPTHS)[number];

export type IngestionJobRequest = {
    pageUrl: string;
    knowledgeDepth: KnowledgeDepth;
};

export type ValidationResponse = { valid: boolean; errors?: string[] };

export const validateIngestionJobRequest = (data: IngestionJobRequest): ValidationResponse => {
    const errors: string[] = [];
    if (!data.pageUrl) {
        errors.push("pageUrl is required");
    }
    if(isValidUrl(data.pageUrl) === false) {
        errors.push("pageUrl is not a valid url");
    }
    if (!data.knowledgeDepth || KNOWLEDGE_DEPTHS.includes(data.knowledgeDepth) === false) {
        errors.push("knowledgeDepth is required and must be a valid depth");
    }
    return { valid: errors.length === 0, errors };
};