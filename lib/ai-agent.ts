// AI Agent Service using Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, POST_GENERATION_PROMPT } from './ai-prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CHARACTER_LIMITS: Record<string, number> = {
  twitter: 258, 
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206
};

export interface ShareableActivity {
  type: 'commit' | 'pr' | 'repo' | 'comment';
  title: string;
  score: number;
  reasoning: string;
  platforms: string[];
  highlights: string[];
}

export interface AnalysisResult {
  shareableActivities: ShareableActivity[];
}

export interface GeneratedPosts {
  [platform: string]: string;
}

export class AIAgent {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'models/gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });
  }

  // Analyze GitHub activity and decide what's shareable
  async analyzeActivity(githubData: any): Promise<AnalysisResult> {
    console.log('🤖 Analyzing GitHub activity with AI...');

    try {
      const result = await this.model.generateContent(ANALYSIS_PROMPT(githubData));
      const response = await result.response;
      const responseText = response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response as JSON');
      }

      const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);
      
      console.log(`✅ AI identified ${analysis.shareableActivities.length} shareable activities`);
      
      return analysis;
    } catch (error: any) {
      console.error('❌ AI analysis failed:', error.message);
      throw error;
    }
  }

  // Generate platform-specific post
  async generatePost(activity: ShareableActivity, platform: string): Promise<string> {
    console.log(`🤖 Generating ${platform} post...`);

    try {
      const result = await this.model.generateContent(POST_GENERATION_PROMPT(activity));
      const response = await result.response;
      let postText = response.text().trim();
      
      // Validate character limits
      const limit = CHARACTER_LIMITS[platform];
      if (postText.length > limit) {
        console.warn(`⚠️ Post exceeds ${platform} limit (${postText.length}/${limit})`);
        
        // Auto-truncate for Twitter
        if (platform === 'twitter') {
          postText = postText.substring(0, 277) + '...';
          console.log(`✂️ Truncated to 280 characters`);
        }
      }

      console.log(`✅ Generated ${platform} post (${postText.length} chars)`);
      
      return postText;
    } catch (error: any) {
      console.error(`❌ Failed to generate ${platform} post:`, error.message);
      throw error;
    }
  }

  // Generate posts for multiple platforms with rate limiting
  async generateMultiplePosts(activity: ShareableActivity, platforms: string[]): Promise<GeneratedPosts> {
    console.log(`🤖 Generating posts for ${platforms.length} platforms...`);

    const posts: GeneratedPosts = {};

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      
      try {
        posts[platform] = await this.generatePost(activity, platform);
        
        // Add 13 second delay to avoid Gemini rate limit (5 requests/minute)
        if (i < platforms.length - 1) {
          console.log('⏳ Waiting 13s to avoid rate limit...');
          await new Promise(resolve => setTimeout(resolve, 13000));
        }
      } catch (error: any) {
        console.error(`❌ Failed to generate ${platform} post:`, error.message);
        posts[platform] = '';
      }
    }

    return posts;
  }

  // Full workflow: analyze + generate (Twitter only)
  async analyzeAndGenerate(githubData: any, platforms: string[] = ['twitter']) {
    console.log('🤖 Starting AI workflow: analyze → generate (Twitter only)');

    try {
      // Step 1: Analyze activity
      const analysis = await this.analyzeActivity(githubData);

      if (!analysis.shareableActivities || analysis.shareableActivities.length === 0) {
        console.warn('⚠️ No shareable activities found');
        return {
          analysis,
          posts: []
        };
      }

      // Step 2: Generate posts for top activities (TWITTER ONLY)
      const postsWithActivities = [];

      for (let i = 0; i < Math.min(3, analysis.shareableActivities.length); i++) {
        const activity = analysis.shareableActivities[i];
        
        console.log(`🤖 Processing activity: ${activity.title} (score: ${activity.score})`);

        // FORCE TWITTER ONLY - ignore AI suggestions
        const platformPosts = await this.generateMultiplePosts(
          activity,
          ['twitter'] // Always only Twitter
        );

        postsWithActivities.push({
          activity,
          posts: platformPosts
        });
        
        // Add delay between activities
        if (i < 2) {
          console.log('⏳ Waiting 13s before next activity...');
          await new Promise(resolve => setTimeout(resolve, 13000));
        }
      }

      console.log(`✅ AI workflow complete: ${postsWithActivities.length} post sets generated (Twitter only)`);

      return {
        analysis,
        posts: postsWithActivities
      };
    } catch (error: any) {
      console.error('❌ AI workflow failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();