import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Middleware for route protection
 * Redirects unauthenticated users to sign-in page for protected routes
 */
export default auth(async (req) => {
    const session = req.auth;
    const { pathname } = req.nextUrl;


    // Protected routes that require authentication
    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard"];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to sign-in if accessing protected route without session
    if (isProtectedRoute && !session) {
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Redirect to dashboard if already signed in and accessing auth pages
    const authRoutes = ["/signin"];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Match all paths except static files and API routes
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
    ],
};
