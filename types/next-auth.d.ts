import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

/**
 * Extend Auth.js types to include custom session properties
 * These types are used throughout the application for type safety
 */

declare module "next-auth" {
    /**
     * Extended session with userId, role, and username
     */
    export interface Session {
        user: {
            id: string;
            role: string;
            username: string | null;
            accessToken : string | unknown;
        } & DefaultSession["user"];
    }

    interface Token {
        accessToken?: string;
    }

    /**
     * Extended user with optional role
     */
    interface User extends DefaultUser {
        role?: string;
        username?: string | null;
    }
}

declare module "next-auth/jwt" {
    /**
     * Extended JWT with user identity fields
     */
    interface JWT extends DefaultJWT {
        userId?: string;
        role?: string;
        username?: string | null;
    }
}
