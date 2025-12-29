import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJobOwnership } from '@/app/lib/job-verification';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, message } = body;

    if (!jobId || !message) {
      return NextResponse.json(
        { error: 'Job ID and message are required' },
        { status: 400 }
      );
    }

    // Verify job ownership
    await verifyJobOwnership(jobId, session.user.id);

    // Get or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          jobId,
          userId: session.user.id,
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
      },
    });

    // TODO: Integrate with LLM/chatbot service to get response
    // For now, return a placeholder response
    const assistantResponse = `I received your message: "${message}". This is a placeholder response. Integrate with your LLM service to provide intelligent responses based on the ingested content.`;

    // Save assistant response
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    return NextResponse.json({
      message: assistantResponse,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access to job') {
      return NextResponse.json(
        { error: 'Unauthorized access to job' },
        { status: 403 }
      );
    }
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
