import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJobOwnership } from '@/app/lib/job-verification';
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { embeddings } from '@/app/lib/embeddings';
import { EmbeddingsRepository } from "@/app/repositories/embeddings";
import { SimilarDocument } from '@/app/lib/types';
import { validateChatRequest } from '@/app/lib/validation';

const embeddingsRepo = new EmbeddingsRepository(prisma);


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

export async function POST(req: Request) {
  const requestBody = await req.json();
  const session = await auth();
  
  const userId = session!.user!.id;
  const { valid, errors } = await validateChatRequest(requestBody, userId);
  if (!valid) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  
  const { messages, jobId }: { messages: UIMessage[]; jobId: string } = requestBody;
  // Get last text message from user
  const lastMessage = messages[messages.length - 1];
  const lastTextContent = lastMessage.parts
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('');

  try {

    // 1. Generate embedding for the user's question
    const [queryVector] = await embeddings.generateEmbeddingsFromTexts([lastTextContent]);
    // 2. Retrieve relevant documents based on the embedding
    const searchResults: SimilarDocument[] = await embeddingsRepo.querySimilarDocuments(jobId, queryVector);

    return await processBotResponse(searchResults, messages);
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to process and return bot response with or without context
async function processBotResponse(searchResults: SimilarDocument[], messages: UIMessage[]) {
  const systemPrompt = searchResults.length === 0
    ? `You are a helpful assistant. If you cannot find relevant information in the ingested content to answer the question, politely inform the user and suggest they try rephrasing their question.`
    : `You are a helpful assistant. Use the following context to answer the user's question:\n\n${searchResults
        .map((c: any) => `Source: ${c.sourceUrl}\nContent: ${c.content}`)
        .join('\n\n')}`;

  const result = await streamText({
    model: groq(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
