import { prismaClient } from "@/lib/db";

export const runtime = 'nodejs'; 

export async function GET() {
  try {
    const response = await prismaClient.user.findFirst();
    if (!response) {
      return new Response("Database connected but no users found", { status: 200 });
    }
    return new Response("Database connected", { status: 200 });
  } catch (e) {
    console.error("Database connection error:", e);
    return new Response("Database not connected", { status: 500 });
  }
}