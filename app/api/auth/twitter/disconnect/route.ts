// Twitter Disconnect Endpoint
// Removes Twitter connection from SocialConnection table

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaClient } from '@/lib/db';

export async function POST() {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete Twitter connection
        const deleted = await prismaClient.socialConnection.deleteMany({
            where: {
                userId: session.user.id,
                platform: 'twitter',
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: 'No Twitter connection found' },
                { status: 404 }
            );
        }

        console.log(`🔌 Twitter disconnected for user ${session.user.id}`);

        return NextResponse.json({
            success: true,
            message: 'Twitter disconnected successfully',
        });

    } catch (error) {
        console.error('Twitter disconnect error:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect Twitter' },
            { status: 500 }
        );
    }
}

// Also support DELETE method
export { POST as DELETE };
