import NextAuth, {
  type Session,
  type DefaultSession
} from "next-auth";
import { authConfig } from "@/auth.config";
import crypto from 'crypto';

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export type AuthSession = Session;
export type AuthUser = AuthSession["user"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig
});

export const signUserId = (userId: string): string => {
  // Create HMAC signature with server secret
  const secret = process.env.AUTH_SECRET || '';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(userId)
    .digest('hex');
  
  // Return userId:signature so API can verify
  return `${userId}:${signature}`;
}

export const verifySignedUserId = (signedUserId: string | null): string | null => {
  if (!signedUserId) {
    return null;
  }

  // Verify HMAC signature
  const secret = process.env.AUTH_SECRET || '';
  const [userId, signature] = signedUserId.split(':');

  if (!userId || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(userId)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    return userId;
  }

  return null;
};