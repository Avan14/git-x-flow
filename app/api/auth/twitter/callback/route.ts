// Twitter OAuth 1.0a Callback Endpoint
// Exchanges request token for access token and saves to SocialConnection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prismaClient } from '@/lib/db';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.redirect(new URL('/signin', process.env.NEXTAUTH_URL));
        }

        const searchParams = request.nextUrl.searchParams;
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        const denied = searchParams.get('denied');

        // Handle authorization denied
        if (denied) {
            console.error('Twitter OAuth denied by user');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_denied', process.env.NEXTAUTH_URL)
            );
        }

        if (!oauthToken || !oauthVerifier) {
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_invalid_callback', process.env.NEXTAUTH_URL)
            );
        }

        // Retrieve stored oauth_token_secret from cookie
        const cookieStore = await cookies();
        const storedOAuthToken = cookieStore.get('twitter_oauth_token')?.value;
        const storedOAuthTokenSecret = cookieStore.get('twitter_oauth_token_secret')?.value;
        console.log("OAuth Token from query:", oauthToken);
        console.log("Stored cookie token:", storedOAuthToken);
        console.log("Stored cookie secret:", storedOAuthTokenSecret);
        if (!storedOAuthToken || !storedOAuthTokenSecret) {
            console.error('Twitter OAuth token/secret not found in cookies');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_session_expired', process.env.NEXTAUTH_URL)
            );
        }

        // Verify the oauth_token matches
        if (oauthToken !== storedOAuthToken) {
            console.error('Twitter OAuth token mismatch');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_token_mismatch', process.env.NEXTAUTH_URL)
            );
        }

        // Exchange request token for access token using OAuth 1.0a
        const appKey = process.env.TWITTER_API_KEY!;
        const appSecret = process.env.TWITTER_API_SECRET!;

        const tempClient = new TwitterApi({
            appKey,
            appSecret,
            accessToken: oauthToken,
            accessSecret: storedOAuthTokenSecret,
        });

        const {
            accessToken,
            accessSecret,
            screenName,
            userId: twitterUserId,
        } = await tempClient.login(oauthVerifier);

        // Fetch full user profile using the permanent access token
        const authenticatedClient = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
        });

        let username = screenName;
        let platformUserId = twitterUserId;

        // Try to get more details from v2 API (optional, screenName from login is sufficient)
        try {
            const me = await authenticatedClient.v2.me();
            username = me.data.username || screenName;
            platformUserId = me.data.id || twitterUserId;
        } catch {
            // v2 endpoint may fail on free tier, screenName from login is fine
            console.log('Could not fetch v2 profile, using screenName from OAuth login');
        }

        // Upsert SocialConnection record
        // KEY: accessToken goes to accessToken field
        //      accessSecret goes to refreshToken field (this is what the worker reads)
        //      expiresAt is null (OAuth 1.0a tokens don't expire)
        await prismaClient.socialConnection.upsert({
            where: {
                userId_platform: {
                    userId: session.user.id,
                    platform: 'twitter',
                },
            },
            update: {
                accessToken: accessToken,
                refreshToken: accessSecret,   // Worker reads this as accessSecret
                expiresAt: null,              // OAuth 1.0a tokens don't expire
                platformUserId: platformUserId,
                username: username,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                platform: 'twitter',
                accessToken: accessToken,
                refreshToken: accessSecret,   // Worker reads this as accessSecret
                expiresAt: null,              // OAuth 1.0a tokens don't expire
                platformUserId: platformUserId,
                username: username,
                isActive: true,
            },
        });

        console.log(`✅ Twitter connected via OAuth 1.0a for user ${session.user.id} (@${username})`);

        // Clear OAuth cookies
        cookieStore.delete('twitter_oauth_token');
        cookieStore.delete('twitter_oauth_token_secret');

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
