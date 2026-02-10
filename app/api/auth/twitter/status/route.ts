// Twitter Connection Status Endpoint
// Returns the current Twitter connection status for the authenticated user

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaClient } from '@/lib/db';

export async function GET() {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check for Twitter connection
        const connection = await prismaClient.socialConnection.findFirst({
            where: {
                userId: session.user.id,
                platform: 'twitter',
                isActive: true,
            },
            select: {
                username: true,
                platformUserId: true,
                expiresAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!connection) {
            return NextResponse.json({
                connected: false,
            });
        }

        // Check if token is expired
        const isExpired = connection.expiresAt && connection.expiresAt < new Date();

        return NextResponse.json({
            connected: true,
            username: connection.username,
            platformUserId: connection.platformUserId,
            tokenExpired: isExpired,
            connectedAt: connection.createdAt,
            updatedAt: connection.updatedAt,
        });

    } catch (error) {
        console.error('Twitter status error:', error);
        return NextResponse.json(
            { error: 'Failed to get Twitter status' },
            { status: 500 }
        );
    }
}
