import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth;

export const config = {
    matcher: [
        // Match all paths except static files and API routes
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
    ],
};
