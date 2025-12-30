import { isValidUrl } from "@/app/lib/utils";
import { verifyJobOwnership } from "@/app/lib/job-verification";

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

export const validateChatRequest = async (requestBody: any, userId: string): Promise<ValidationResponse> => {
    const errors: string[] = [];
    if (!requestBody.messages) {
        errors.push("messages is required");
    }
    if (!requestBody.jobId) {
        errors.push("jobId is required");
    }
    try {
        await verifyJobOwnership(requestBody.jobId, userId);
    }
    catch (error) {
        errors.push("Unauthorized access to job");
    }
    return { valid: errors.length === 0, errors };
}