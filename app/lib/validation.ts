import { isValidUrl } from "@/app/lib/utils";

export type IngestionJobRequest = {
    pageUrl: string;
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
    return { valid: errors.length === 0, errors };
};