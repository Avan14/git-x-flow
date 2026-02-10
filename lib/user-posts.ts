import { prisma } from "./db";

export async function getPostsForUser(userId: string) {
    const response = await prisma.scheduledPost.findMany({
        where: {
            userId: userId,
        },
        include: {
            content: {
                include: {
                    achievement: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    
    return response || [];
}