import { NextRequest, NextResponse } from "next/server";
import { auth, type AuthSession, type AuthUser } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { IngestionRepository } from "@/app/repositories/ingestion";
import type { JobWithSource } from '@/app/lib/types';

export async function GET(req: NextRequest) {
  try {
    const authSession = await auth() as AuthSession;
    const { id: userId }: AuthUser = authSession.user;
    const ingestionRepository = new IngestionRepository(prisma);
    const ingestionJobs: JobWithSource[] = await ingestionRepository.findUserJobs(userId, {
      source: true
    });
    return NextResponse.json(ingestionJobs);
  } catch (error) {
    console.error("Failed to fetch ingestion jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingestion jobs" },
      { status: 500 }
    );
  }
}
