import { NextRequest, NextResponse } from "next/server";
import { auth, type AuthSession, type AuthUser } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { IngestionRepository } from "@/app/repositories/ingestion";
import type { JobWithSource } from "@/app/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const authSession = await auth() as AuthSession;
    const { id: userId }: AuthUser = authSession.user;

    const ingestionRepository = new IngestionRepository(prisma);
    const job: JobWithSource | null = await ingestionRepository.findById(jobId, { source: true });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Verify the job belongs to the authenticated user
    if (job.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
