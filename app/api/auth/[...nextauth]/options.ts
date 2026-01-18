import { NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthConfig = {
    debug:true,
  secret: process.env.AUTH_SECRET,
  
  session :{
    strategy : "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "repo user read:discussion",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
};
