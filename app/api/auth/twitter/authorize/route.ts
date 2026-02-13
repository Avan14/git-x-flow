// Twitter OAuth 1.0a Authorization Endpoint
// Initiates Twitter 3-legged OAuth flow using twitter-api-v2

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { TwitterApi } from 'twitter-api-v2';

export async function GET() {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.redirect(new URL('/signin', process.env.NEXTAUTH_URL));
        }

        // Twitter OAuth 1.0a configuration (Consumer Keys)
        const appKey = process.env.TWITTER_API_KEY;
        const appSecret = process.env.TWITTER_API_SECRET;
        const callbackUrl = process.env.TWITTER_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`;

        if (!appKey || !appSecret) {
            console.error('TWITTER_API_KEY or TWITTER_API_SECRET not configured');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_not_configured', process.env.NEXTAUTH_URL)
            );
        }

        // Create a Twitter client with app credentials to generate auth link
        const client = new TwitterApi({
            appKey,
            appSecret,
        });

        // Generate OAuth 1.0a request token and auth link
        const authLink = await client.generateAuthLink(callbackUrl, {
            linkMode: 'authorize',
        });

        // Store oauth_token_secret in a secure httpOnly cookie
        // (needed to complete the OAuth flow in the callback)
        const cookieStore = await cookies();

        cookieStore.set('twitter_oauth_token', authLink.oauth_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        cookieStore.set('twitter_oauth_token_secret', authLink.oauth_token_secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        console.log('🐦 Redirecting to Twitter OAuth 1.0a...');
        return NextResponse.redirect(authLink.url);

    } catch (error) {
        console.error('Twitter OAuth error:', error);
        return NextResponse.redirect(
            new URL('/dashboard/settings?error=twitter_auth_failed', process.env.NEXTAUTH_URL)
        );
    }
}
