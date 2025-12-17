import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import type { 
    IngestionJobRequestType,
    ValidationResponseType 
} from "@/app/lib/validation";
import { validateIngestionJobRequest } from "@/app/lib/validation";

export async function POST(req: NextRequest) {
    const reqData: IngestionJobRequestType = await req.json();
    console.log("Ingestion Job Request Data:", reqData);

    const validation: ValidationResponseType = validateIngestionJobRequest(reqData);
    if (!validation.valid) {
        return NextResponse.json({ error: validation.errors }, { status: 400 });
    }
    const { pageUrl, knowledgeDepth } = reqData;
    return NextResponse.json(
        { message: `Ingestion job for ${pageUrl} with depth ${knowledgeDepth} has been accepted.` },
        { status: 202 }
    );
}