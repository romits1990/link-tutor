import { PrismaClient } from '@prisma/client';

export class ChatMessageRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

  // ChatMessage CRUD Operations

  /**
   * Add a message to a chat
   */
  async addMessage(chatId: string, role: 'user' | 'assistant', content: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        messages: {
          create: {
            role,
            content,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get all messages for a chat
   */
  async getMessagesByChatId(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return chat?.messages ?? [];
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(messageId: string) {
    const chats = await this.prisma.chat.findMany({
      include: {
        messages: {
          where: { id: messageId },
        },
      },
    });
    return chats[0]?.messages[0] ?? null;
  }

  /**
   * Delete a specific message
   */
  async deleteMessage(messageId: string) {
    // Get the chatId first
    const chats = await this.prisma.chat.findMany({
      include: {
        messages: {
          where: { id: messageId },
        },
      },
    });
    
    if (!chats[0]?.messages[0]) return null;

    return this.prisma.chat.update({
      where: { id: chats[0].id },
      data: {
        messages: {
          delete: { id: messageId },
        },
      },
    });
  }

  /**
   * Update a message content
   */
  async updateMessage(messageId: string, content: string) {
    const chats = await this.prisma.chat.findMany({
      include: {
        messages: {
          where: { id: messageId },
        },
      },
    });

    if (!chats[0]?.messages[0]) return null;

    return this.prisma.chat.update({
      where: { id: chats[0].id },
      data: {
        messages: {
          update: {
            where: { id: messageId },
            data: { content },
          },
        },
      },
    });
  }

  /**
   * Delete all messages in a chat
   */
  async deleteMessagesByChat(chatId: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        messages: {
          deleteMany: {},
        },
      },
    });
  }

  /**
   * Get recent messages (limit)
   */
  async getRecentMessages(chatId: string, limit: number = 50) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });
    return chat?.messages ?? [];
  }

  /**
   * Batch add messages (for initial chat setup)
   */
  async addMessages(chatId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        messages: {
          createMany: {
            data: messages,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
