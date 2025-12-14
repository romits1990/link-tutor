// auth.ts (REQUIRED UPDATE)

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// 🌟 Import the Edge-safe config from the new file
import { authConfig } from "@/auth.config" 
// Your prisma client from /app/lib/prisma
import { prisma } from "@/app/lib/prisma" 

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 🌟 FIX 3: Spread the providers/session config from auth.config.ts
  ...authConfig,
  
  // 🌟 FIX 4: ONLY include the database adapter and database strategy here
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database", // Force database session strategy for the main app
  },
})