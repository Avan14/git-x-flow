"use server";

import { prisma } from "./db";

export async function UserAchievements(id: string, userId: string) {
    const response = await prisma.achievement.findFirst({
        where: {
            id,
            userId: userId,
        },
        include: {
            content: true,
        },
    });

    if (response) {
        return response;
    } else {
        return null;
    }
}
