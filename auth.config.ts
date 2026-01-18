import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export default {
    providers: [
        GitHub({
            authorization: {
                params: {
                    scope: "read:user user:email repo",
                },
            },
        }),
    ],
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isAuthRoute = nextUrl.pathname.startsWith('/signin');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isAuthRoute) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;
