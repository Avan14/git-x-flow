// AI Analysis API Route - Fetches ALL GitHub data for analysis
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiAgent } from '@/lib/ai-agent';
import { GitHubService } from '@/lib/github-service'; // Fixed: Added 's'

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 === Starting AI Analysis ===');
    
    // Get authenticated user session
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with GitHub.' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const platformsParam = searchParams.get('platforms') || 'twitter,linkedin';
    const platforms = platformsParam.split(',');

    console.log(`📊 Analyzing last ${days} days for platforms: ${platforms.join(', ')}`);

    // 🚀 Step 1: Fetch ALL GitHub data using new service
    console.log('📥 Fetching ALL GitHub data...');
    
    const githubService = new GitHubService(session.user.accessToken as string);
    const githubData = await githubService.getActivitySummary(days);

    console.log('✅ GitHub data fetched:', {
      repos: githubData.stats.totalRepos,
      commits: githubData.stats.totalCommits,
      prs: githubData.stats.totalPRs,
      comments: githubData.stats.totalComments
    });

    // Check if there's any activity
    if (githubData.stats.totalCommits === 0 && 
        githubData.stats.totalPRs === 0 && 
        githubData.stats.newRepos === 0) {
      console.log('⚠️ No recent activity found');
      
      return NextResponse.json({
        message: 'No recent activity found',
        githubData,
        analysis: null,
        posts: []
      });
    }

    // 🤖 Step 2: AI analysis and post generation
    console.log('🤖 Running AI analysis...');
    
    const result = await aiAgent.analyzeAndGenerate(githubData, platforms);

    console.log('✅ === AI Analysis Complete ===');
    console.log(`📝 Generated ${result.posts?.length || 0} post sets`);

    return NextResponse.json({
      success: true,
      githubData,
      analysis: result.analysis,
      posts: result.posts
    });

  } catch (error: any) {
    console.error('❌ AI analysis failed:', error);
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Regenerating post...');
    
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { activity, platform } = body;

    if (!activity || !platform) {
      return NextResponse.json(
        { error: 'Missing activity or platform' },
        { status: 400 }
      );
    }

    console.log(`🔄 Regenerating post for ${platform}:`, activity.title);

    // Regenerate post for specific activity and platform
    const newPost = await aiAgent.generatePost(activity, platform);

    console.log('✅ Post regenerated successfully');

    return NextResponse.json({
      success: true,
      platform,
      post: newPost
    });

  } catch (error: any) {
    console.error('❌ Post regeneration failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to regenerate post',
        message: error.message 
      },
      { status: 500 }
    );
  }
}