import { isValidUrl } from "@/app/lib/utils";
import { KNOWLEDGE_DEPTHS } from "@/app/lib/constants";

export type KnowledgeDepthType = (typeof KNOWLEDGE_DEPTHS)[number];

export type IngestionJobRequestType = {
    pageUrl: string;
    knowledgeDepth: KnowledgeDepthType;
};

export type ValidationResponseType = { valid: boolean; errors?: string[] };

export const validateIngestionJobRequest = (data: IngestionJobRequestType): ValidationResponseType => {
    const errors: string[] = [];
    if (!data.pageUrl) {
        errors.push("pageUrl is required");
    }
    if(isValidUrl(data.pageUrl) === false) {
        errors.push("pageUrl is not a valid url");
    }
    const allowedDepths = ['basic', 'advanced', 'expert'];
    if (!data.knowledgeDepth || allowedDepths.includes(data.knowledgeDepth) === false) {
        errors.push("knowledgeDepth is required and must be a number");
    }
    return { valid: errors.length === 0, errors };
};