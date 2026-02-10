// Twitter OAuth 2.0 Authorization Endpoint
// Initiates Twitter OAuth flow using PKCE

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate secure random string for PKCE
function generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
}

// Generate code challenge from verifier (S256 method)
function generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Generate state for CSRF protection
function generateState(): string {
    return crypto.randomBytes(16).toString('hex');
}

export async function GET() {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.redirect(new URL('/signin', process.env.NEXTAUTH_URL));
        }

        // Twitter OAuth 2.0 configuration
        const clientId = process.env.TWITTER_CLIENT_ID;
        const callbackUrl = process.env.TWITTER_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`;

        if (!clientId || clientId === 'your_twitter_client_id' || clientId.startsWith('your_')) {
            console.error('TWITTER_CLIENT_ID not configured or using placeholder value');
            return NextResponse.redirect(
                new URL('/dashboard/settings?error=twitter_not_configured', process.env.NEXTAUTH_URL)
            );
        }

        // Generate PKCE values
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const state = generateState();

        // Store verifier and state in secure cookie (httpOnly, sameSite: lax)
        const cookieStore = await cookies();

        // Store code verifier (needed for token exchange)
        cookieStore.set('twitter_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        // Store state for CSRF protection
        cookieStore.set('twitter_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        // Build Twitter authorization URL
        // Scopes: tweet.read, tweet.write, users.read, offline.access (for refresh token)
        const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];

        const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', callbackUrl);
        authUrl.searchParams.set('scope', scopes.join(' '));
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        console.log('🐦 Redirecting to Twitter OAuth...');
        return NextResponse.redirect(authUrl.toString());

    } catch (error) {
        console.error('Twitter OAuth error:', error);
        return NextResponse.redirect(
            new URL('/dashboard/settings?error=twitter_auth_failed', process.env.NEXTAUTH_URL)
        );
    }
}
