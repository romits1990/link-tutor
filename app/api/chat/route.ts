import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJobOwnership } from '@/app/lib/job-verification';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  try {
    // Verify job ownership
    await verifyJobOwnership(jobId, session.user.id);

    // Get or create chat for this job
    // let chat = await prisma.chat.findFirst({
    //   where: {
    //     jobId,
    //     userId: session.user.id,
    //   },
    //   include: {
    //     messages: {
    //       orderBy: { createdAt: 'asc' },
    //     },
    //   },
    // });

    // if (!chat) {
    //   chat = await prisma.chat.create({
    //     data: {
    //       jobId,
    //       userId: session.user.id,
    //     },
    //     include: {
    //       messages: {
    //         orderBy: { createdAt: 'asc' },
    //       },
    //     },
    //   });
    // }

    return NextResponse.json({
      chatId: 'dummy-chat-id',
      messages: [
        {
          role: 'assistant',
          content: 'Hello! How can I assist you with your job today?',
        },
        {
          role: 'user',
          content: 'This is a placeholder message. Integrate with your LLM service to provide intelligent responses based on the ingested content.',
        },
    ],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access to job') {
      return NextResponse.json(
        { error: 'Unauthorized access to job' },
        { status: 403 }
      );
    }
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
