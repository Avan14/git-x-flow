import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { internalApi } from "@/lib/internal-api";

/**
 * Example Protected Route Handler
 * 
 * Demonstrates how to:
 * 1. Validate session using auth()
 * 2. Access user information from session
 * 3. Make secure calls to the backend using internalApi
 * 
 * This pattern should be followed for all protected API routes
 */

// Example response type from backend
interface UserProfileResponse {
    id: string;
    name: string;
    achievements: number;
}

/**
 * GET /api/health/protected
 * Example protected endpoint that validates session and demonstrates backend call
 */
export async function GET() {
    try {
        // 1. Validate session using Auth.js
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Access user information from session
        const { id, email, name, username, role } = session.user;

        // 3. Example: Make secure backend call (uncomment when backend is available)
        // const backendResult = await internalApi.get<UserProfileResponse>("/api/users/profile");
        // if (!backendResult.success) {
        //   return NextResponse.json(
        //     { error: backendResult.error },
        //     { status: backendResult.status }
        //   );
        // }

        // Return session info for demonstration
        return NextResponse.json({
            success: true,
            message: "Protected route accessed successfully",
            user: {
                id,
                email,
                name,
                username,
                role,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Protected route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/health/protected
 * Example protected POST endpoint
 */
export async function POST(request: Request) {
    try {
        // Validate session
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();

        // Example: Forward to backend
        // const result = await internalApi.post<SomeResponse>("/api/some-endpoint", body);

        return NextResponse.json({
            success: true,
            message: "POST request processed",
            userId: session.user.id,
            receivedData: body,
        });
    } catch (error) {
        console.error("Protected POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
