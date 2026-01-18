// Ayrshare Social Media Posting API Route - Twitter Only
import { NextRequest, NextResponse } from 'next/server';

const AYRSHARE_API_URL = 'https://app.ayrshare.com/api';
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY!;

// POST: Publish to Twitter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platforms } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    // Force Twitter only
    const platformsToUse = ['twitter'];

    // CRITICAL: Ayrshare free plan adds "[Sent with Free Plan] " (22 chars)
    // So we need to limit to 258 chars to stay under 280
    let twitterContent = content;
    if (twitterContent.length > 258) {
      twitterContent = twitterContent.substring(0, 255) + '...';
      console.log(`✂️ Truncated from ${content.length} to ${twitterContent.length} chars (Ayrshare adds 22 char prefix)`);
    }

    console.log(`📱 Posting to Twitter...`);
    console.log(`Content: ${twitterContent.substring(0, 100)}...`);
    console.log(`Length: ${twitterContent.length} chars (+ 22 char Ayrshare prefix = ${twitterContent.length + 22} total)`);

    // Post to Ayrshare
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        post: twitterContent, // Use truncated content
        platforms: platformsToUse
      })
    });

    const data = await response.json();

    console.log('Ayrshare response:', data);

    if (data.status === 'success') {
      console.log('✅ Posted to Twitter successfully!');
      return NextResponse.json({
        success: true,
        data
      });
    } else {
      console.error('❌ Ayrshare error:', data);
      return NextResponse.json({
        success: false,
        error: data.message || data.errors || 'Unknown error'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Post request failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET: Test Ayrshare connection
export async function GET() {
  try {
    const response = await fetch(`${AYRSHARE_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      connected: response.ok,
      accounts: data.activeSocialAccounts || [],
      userInfo: data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message
    }, { status: 500 });
  }
}