import { prisma } from "./db";

export async function  getPostsForUser(
    userId: string
) {
    const response = await prisma.userAchievement.findMany({
        where: {
            userId: userId,
        },
        include: {
            posts: true,
        },
    });
    if (response) {
        return response;
    }
    else {
        return [];
    }
}