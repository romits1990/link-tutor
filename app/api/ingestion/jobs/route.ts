import { NextRequest, NextResponse } from "next/server";
import { auth, type AuthSession, type AuthUser } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import type { 
    IngestionJobRequest,
    ValidationResponse
} from "@/app/lib/validation";
import { validateIngestionJobRequest } from "@/app/lib/validation";
import { IngestionRepository } from "@/app/repositories/ingestion";
import { type IngestionJob } from "@prisma/client";
import { inngest } from "@/app/lib/inngest/client";
import type { IngestionJobRequestPayload } from "@/app/lib/inngest/functions";

export async function POST(req: NextRequest) {
    try {
        const reqData: IngestionJobRequest = await req.json();
        const validation: ValidationResponse = validateIngestionJobRequest(reqData);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        const authSession = await auth() as AuthSession;
        const { id: userId }: AuthUser = authSession.user;
        // const userId = "cmjgq07c40000m4hjc0dyq1bk";
        const { pageUrl } = reqData;
        const ingestionRepository = new IngestionRepository(prisma);
        const ingestionJob: IngestionJob = await ingestionRepository.createSourceIngestionJob(userId, pageUrl);
        const eventData: IngestionJobRequestPayload = {
            jobId: ingestionJob.id,
            userId,
            pageUrl
        };
        await inngest.send({
            name: "ingestion/job.created",
            data: eventData
        });

        return NextResponse.json(
            { jobId: ingestionJob.id },
            { status: 202 }
        );
    } catch (error) {
        console.error("Failed to create ingestion job:", error);
        return NextResponse.json({ error: "Failed to create ingestion job" }, { status: 500 });
    }
}