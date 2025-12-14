// middleware.ts 

import { authConfig } from "@/auth.config"
import NextAuth from "next-auth"

// 🌟 FIX 1: Change the named export 'auth' to a default export
export default NextAuth(authConfig).auth;

export const config = {
  // Only match routes you want protected
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}