import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/db";

/**
 * Auth.js (NextAuth v5) Configuration
 * 
 * Architecture:
 * - Next.js handles ALL user authentication (login, logout, OAuth, sessions)
 * - JWT-based sessions (no database session lookups)
 * - Session exposes userId, role, and username for downstream use
 * - Backend receives trusted identity via internal API helper, never handles auth
 */
export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    // Prisma adapter for user/account persistence
    adapter: PrismaAdapter(prisma),

    // Use JWT strategy for sessions (stateless, no database lookups)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Import providers and pages from auth.config.ts
    ...authConfig,

   callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated
     * Persists user data into the token for session access
     */
    async jwt({ token, user, account, profile }) {
        // Save GitHub access token
        if (account?.access_token) {
            token.accessToken = account.access_token;
        }

        // Initial sign in - persist user data to token
        if (user) {
            token.userId = user.id;
            token.role = "user";

            // Extract GitHub username from profile if available
            if (profile && account?.provider === "github") {
                token.username = (profile as { login?: string }).login || null;

                // Update user record with GitHub username if not set
                if (token.username && user.id) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { username: token.username },
                    }).catch(() => {});
                }
            }
        }

        // Fetch latest user data on subsequent requests if needed
        if (token.userId && !token.username) {
            const dbUser = await prisma.user.findUnique({
                where: { id: token.userId as string },
                select: { username: true },
            });
            if (dbUser?.username) {
                token.username = dbUser.username;
            }
        }

        return token;
    },

    /**
     * Session callback - exposes token data to client session
     * Only includes safe, non-sensitive information
     */
    async session({ session, token }) {
        if (token && session.user) {
            session.user.id = token.userId as string;
            session.user.role = token.role as string;
            session.user.username = token.username as string | null;
            session.user.accessToken = token.accessToken as string; // ← ADD THIS LINE
        }
        return session;
    },
},

    events: {
        /**
         * Sign out event - can be used for additional cleanup
         */
        async signOut() {
            // Session is automatically invalidated by Auth.js
            // Add any additional cleanup logic here if needed
        },
    },

    // Enable debug logging in development
    debug: process.env.NODE_ENV === "development",
});

/**
 * Helper to get the current user's access token for GitHub API calls
 * Returns null if no session or no GitHub account linked
 */
export async function getGitHubAccessToken(): Promise<string | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: "github",
        },
        select: {
            access_token: true,
        },
    });

    return account?.access_token || null;
}
