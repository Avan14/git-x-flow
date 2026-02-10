// Twitter OAuth 2.0 Callback Endpoint
// Exchanges authorization code for access tokens and saves to SocialConnection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prismaClient } from '@/lib/db';

interface TwitterTokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    scope: string;
    refresh_token?: string;
}

interface TwitterUserResponse {
    data: {
        id: string;
        name: string;
        username: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.redirect(new URL('/signin', process.env.NEXTAUTH_URL));
        }

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Handle authorization denied
        if (error) {
            console.error('Twitter OAuth error:', error);
            return NextResponse.redirect(
                new URL(`/dashboard/settings?error=twitter_denied&message=${error}`, process.env.NEXTAUTH_URL)
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_invalid_callback', process.env.NEXTAUTH_URL)
            );
        }

        // Retrieve and validate state and code verifier from cookies
        const cookieStore = await cookies();
        const storedState = cookieStore.get('twitter_oauth_state')?.value;
        const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

        if (!storedState || state !== storedState) {
            console.error('Twitter OAuth state mismatch');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_state_mismatch', process.env.NEXTAUTH_URL)
            );
        }

        if (!codeVerifier) {
            console.error('Twitter OAuth code verifier not found');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_verifier_missing', process.env.NEXTAUTH_URL)
            );
        }

        // Exchange authorization code for access token
        const clientId = process.env.TWITTER_CLIENT_ID!;
        const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
        const callbackUrl = process.env.TWITTER_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`;

        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: clientId,
                redirect_uri: callbackUrl,
                code_verifier: codeVerifier,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Twitter token exchange failed:', errorData);
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_token_failed', process.env.NEXTAUTH_URL)
            );
        }

        const tokens: TwitterTokenResponse = await tokenResponse.json();

        // Fetch user profile from Twitter
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        if (!userResponse.ok) {
            console.error('Failed to fetch Twitter user profile');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_profile_failed', process.env.NEXTAUTH_URL)
            );
        }

        const twitterUser: TwitterUserResponse = await userResponse.json();

        // Calculate token expiration (Twitter tokens typically expire in 2 hours)
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        // Upsert SocialConnection record
        await prismaClient.socialConnection.upsert({
            where: {
                userId_platform: {
                    userId: session.user.id,
                    platform: 'twitter',
                },
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || null,
                expiresAt,
                platformUserId: twitterUser.data.id,
                username: twitterUser.data.username,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                platform: 'twitter',
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || null,
                expiresAt,
                platformUserId: twitterUser.data.id,
                username: twitterUser.data.username,
                isActive: true,
            },
        });

        console.log(`✅ Twitter connected for user ${session.user.id} (@${twitterUser.data.username})`);

        // Clear OAuth cookies
        cookieStore.delete('twitter_oauth_state');
        cookieStore.delete('twitter_code_verifier');

        // Redirect back to settings with success
        return NextResponse.redirect(
            new URL('/dashboard/settings?twitter=connected', process.env.NEXTAUTH_URL)
        );

    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.redirect(
            new URL('/dashboard/settings?error=twitter_callback_failed', process.env.NEXTAUTH_URL)
        );
    }
}
