import { auth } from "@/lib/auth";
import { SignJWT } from "jose";

/**
 * Secure Internal API Helper
 * 
 * This module provides secure service-to-service communication between
 * Next.js and the cloud backend. It ensures:
 * 
 * 1. User session is validated via Auth.js before any backend call
 * 2. User identity is forwarded via a short-lived signed JWT
 * 3. An internal service token authenticates Next.js to the backend
 * 4. No cookies or session tokens are forwarded to the backend
 * 
 * The backend should:
 * - Validate the INTERNAL_SERVICE_TOKEN
 * - Verify and trust the signed user JWT
 * - Never handle user login directly
 */

const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;
const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8080";

// JWT expiration time (5 minutes - short-lived for security)
const JWT_EXPIRATION_SECONDS = 300;

export interface InternalApiUser {
    userId: string;
    email: string | null;
    username: string | null;
    role: string;
}

export interface InternalApiOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    headers?: Record<string, string>;
}

export interface InternalApiResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    status: number;
}

/**
 * Create a short-lived signed JWT containing user identity
 * This JWT is used to securely pass user info to the backend
 */
async function createInternalUserToken(user: InternalApiUser): Promise<string> {
    if (!INTERNAL_JWT_SECRET) {
        throw new Error("INTERNAL_JWT_SECRET is not configured");
    }

    const secret = new TextEncoder().encode(INTERNAL_JWT_SECRET);

    const token = await new SignJWT({
        userId: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${JWT_EXPIRATION_SECONDS}s`)
        .setIssuer("gitxflow-nextjs")
        .setAudience("gitxflow-backend")
        .sign(secret);

    return token;
}

/**
 * Make a secure authenticated request to the internal backend
 * 
 * @param endpoint - Backend API endpoint (e.g., "/api/users/profile")
 * @param options - Request options (method, body, headers)
 * @returns Promise with the result containing success status and data/error
 * 
 * @example
 * const result = await internalApiFetch<UserProfile>("/api/users/profile");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function internalApiFetch<T>(
    endpoint: string,
    options: InternalApiOptions = {}
): Promise<InternalApiResult<T>> {
    try {
        // Validate session
        const session = await auth();

        if (!session?.user?.id) {
            return {
                success: false,
                error: "Unauthorized: No valid session",
                status: 401,
            };
        }

        // Validate configuration
        if (!INTERNAL_SERVICE_TOKEN) {
            console.error("INTERNAL_SERVICE_TOKEN is not configured");
            return {
                success: false,
                error: "Server configuration error",
                status: 500,
            };
        }

        // Create user identity for backend
        const user: InternalApiUser = {
            userId: session.user.id,
            email: session.user.email || null,
            username: session.user.username || null,
            role: session.user.role || "user",
        };

        // Create short-lived signed JWT with user identity
        const userToken = await createInternalUserToken(user);

        // Build request URL
        const url = `${BACKEND_BASE_URL}${endpoint}`;

        // Build headers - NO cookies forwarded
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            // Service-to-service authentication
            "X-Internal-Service-Token": INTERNAL_SERVICE_TOKEN,
            // Signed user identity token
            "Authorization": `Bearer ${userToken}`,
            // Additional user context headers (for convenience)
            "X-User-Id": user.userId,
            ...options.headers,
        };

        // Make the request
        const response = await fetch(url, {
            method: options.method || "GET",
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            // Explicitly don't include credentials/cookies
            credentials: "omit",
        });

        // Handle response
        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: errorText || `Backend error: ${response.status}`,
                status: response.status,
            };
        }

        // Parse JSON response
        const data = await response.json() as T;

        return {
            success: true,
            data,
            status: response.status,
        };
    } catch (error) {
        console.error("Internal API fetch error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500,
        };
    }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const internalApi = {
    get: <T>(endpoint: string, headers?: Record<string, string>) =>
        internalApiFetch<T>(endpoint, { method: "GET", headers }),

    post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
        internalApiFetch<T>(endpoint, { method: "POST", body, headers }),

    put: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
        internalApiFetch<T>(endpoint, { method: "PUT", body, headers }),

    patch: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
        internalApiFetch<T>(endpoint, { method: "PATCH", body, headers }),

    delete: <T>(endpoint: string, headers?: Record<string, string>) =>
        internalApiFetch<T>(endpoint, { method: "DELETE", headers }),
};
