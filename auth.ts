import NextAuth, {
  type Session,
  type DefaultSession
} from "next-auth";
import { authConfig } from "@/auth.config";

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