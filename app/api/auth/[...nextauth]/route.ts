import NextAuth from "next-auth";
import { authOptions } from "./options";

const authResult = NextAuth(authOptions);

export const GET = authResult.handlers.GET;
export const POST = authResult.handlers.POST;
