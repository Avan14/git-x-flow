// lib/db.ts
// This file sets up and exports a cached Prisma Client instance for database interactions.
import { PrismaClient } from "@prisma/client";


const prismaClientReusable = () =>{
  return new PrismaClient()
};

const PrismaClientCache = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

export const prisma = PrismaClientCache.prismaClient ?? prismaClientReusable();

if (process.env.NODE_ENV !== "production") {
  PrismaClientCache.prismaClient = prisma;
}

export type PrismaClientType = typeof prisma;