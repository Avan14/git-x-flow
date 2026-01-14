import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

import authConfig from "@/auth.config";

/**
 * NextAuth.js v5 configuration
 * Uses GitHub OAuth for authentication
 * Stores sessions and accounts in PostgreSQL via Prisma
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    // Request additional scopes for reading user activity
                    scope: "read:user user:email repo",
                },
            },
        }),
    ],
    callbacks: {
        /**
         * Add user ID and GitHub username to the session
         */
        async session({ session, token }) {
            // With JWT strategy, user ID comes from token.sub usually
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }

            // Fetch username from DB if needed, or if it's in token
            // For performance, we might want to put username in token at signin

            if (session.user?.id) {
                // We still need to fetch extended data from DB if it's not in token
                // Check if we can get it from token first? 
                // Let's keep DB fetch for now but ensure it's safe (this runs on SERVER, not Edge, so Prisma is fine)

                // Fetch username from account
                const account = await prisma.account.findFirst({
                    where: { userId: session.user.id, provider: "github" },
                });
                if (account) {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: session.user.id },
                        select: { username: true },
                    });
                    (session.user as { username?: string }).username = dbUser?.username ?? null;
                }
            }
            return session;
        },
        /**
         * Store GitHub username on first sign in
         */
        async signIn({ user, account, profile }) {
            if (account?.provider === "github" && profile) {
                // Update user with GitHub username
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        username: (profile as { login?: string }).login,
                    },
                });
            }
            return true;
        },
    },
    debug: process.env.NODE_ENV === "development",
});

// Extend the default session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            username?: string | null;
        };
    }
}
