import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg'
import { PrismaPg } from "@prisma/adapter-pg"

// Declare a global variable to store the Prisma client instance
// This prevents multiple client instances from being created during hot-reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Initialize the pg connection pool
// This uses your DATABASE_URL environment variable
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Initialize the PrismaPg adapter
const adapter = new PrismaPg(pool)

// Use the existing global client or create a new one using the adapter
export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ 
    adapter,
    transactionOptions: {
      maxWait: 10000, // 10s instead of 5s
      timeout: 20000, // 20s
    },
    // Optional: Only log queries in development
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

// In development, store the client on the global object
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}