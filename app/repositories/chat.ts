import { PrismaClient } from '@prisma/client';

export class ChatRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

  // Chat CRUD Operations

  /**
   * Create a new chat session for a job
   */
  async createChat(jobId: string, userId: string) {
    return this.prisma.chat.create({
      data: {
        jobId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get a chat by ID with all messages
   */
  async getChatById(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get or create a chat for a specific job
   */
  async getOrCreateChat(jobId: string, userId: string) {
    let chat = await this.prisma.chat.findFirst({
      where: {
        jobId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      chat = await this.createChat(jobId, userId);
    }

    return chat;
  }

  /**
   * Get all chats for a user
   */
  async getChatsByUserId(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        job: {
          include: {
            source: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all chats for a specific job
   */
  async getChatsByJobId(jobId: string) {
    return this.prisma.chat.findMany({
      where: { jobId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a chat and all its messages
   */
  async deleteChat(chatId: string) {
    return this.prisma.chat.delete({
      where: { id: chatId },
    });
  }

  /**
   * Update chat metadata (e.g., updatedAt timestamp)
   */
  async updateChat(chatId: string, data: { updatedAt?: Date }) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
