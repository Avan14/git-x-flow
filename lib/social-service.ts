// Social Media Service - Wrapper for Ayrshare
// This extends your existing lib/ayrshare.ts

const AYRSHARE_API_URL = 'https://app.ayrshare.com/api';
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY!;

export const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206
};

export interface PostResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Post to single or multiple platforms
export async function postToSocial(
  content: string, 
  platforms: string[]
): Promise<PostResult> {
  console.log(`📱 Posting to: ${platforms.join(', ')}`);

  try {
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        post: content,
        platforms: platforms
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log('✅ Post published successfully!');
      return {
        success: true,
        data
      };
    } else {
      console.error('❌ Post failed:', data);
      return {
        success: false,
        error: data.message || 'Unknown error'
      };
    }
  } catch (error: any) {
    console.error('❌ Post request failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Post to multiple platforms with different content
export async function postMultiplePlatforms(
  posts: Record<string, string>
): Promise<Record<string, PostResult>> {
  console.log(`📱 Posting to ${Object.keys(posts).length} platforms...`);

  const results: Record<string, PostResult> = {};

  for (const [platform, content] of Object.entries(posts)) {
    if (!content) {
      console.warn(`⚠️ Skipping ${platform} (no content)`);
      continue;
    }

    try {
      const result = await postToSocial(content, [platform]);
      results[platform] = result;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`❌ Failed to post to ${platform}:`, error);
      results[platform] = {
        success: false,
        error: error.message
      };
    }
  }

  return results;
}

// Test Ayrshare connection
export async function testAyrshareConnection() {
  try {
    const response = await fetch(`${AYRSHARE_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      }
    });

    const data = await response.json();

    return {
      success: response.ok,
      connected: response.ok,
      accounts: data.activeSocialAccounts || [],
      userInfo: data
    };
  } catch (error: any) {
    return {
      success: false,
      connected: false,
      error: error.message
    };
  }
}

// Get connected social accounts
export async function getConnectedAccounts(): Promise<string[]> {
  try {
    const response = await fetch(`${AYRSHARE_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.activeSocialAccounts || [];
  } catch (error) {
    console.error('Failed to get connected accounts:', error);
    return [];
  }
}