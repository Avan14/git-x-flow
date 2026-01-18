// GitHub Service - Enhanced data fetching with FULL PAGINATION
// This extends your existing lib/github.ts

import { fetchAllPages } from './github';

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  repository: string;
  url: string;
  stats: {
    additions: number;
    deletions: number;
  };
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  merged: boolean;
  repository: string;
  url: string;
  createdAt: string;
  mergedAt?: string;
  comments: number;
  labels: string[];
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  createdAt: string;
  private: boolean;
}

export interface GitHubComment {
  id: number;
  body: string;
  issueTitle: string;
  issueNumber: number;
  repository: string;
  url: string;
  createdAt: string;
  isPR: boolean;
}

export interface ActivitySummary {
  user: {
    username: string;
    name: string;
    bio: string | null;
    followers: number;
    publicRepos: number;
    avatar_url: string;
  };
  timeframe: string;
  activity: {
    commits: GitHubCommit[];
    pullRequests: GitHubPR[];
    newRepositories: GitHubRepo[];
    allRepositories: GitHubRepo[];
    comments: GitHubComment[];
  };
  stats: {
    totalCommits: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    newRepos: number;
    totalRepos: number;
    totalComments: number;
    totalAdditions: number;
    totalDeletions: number;
  };
}

export class GitHubService {
  private accessToken: string;
  private headers: Record<string, string>;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  // Get user profile
  async getUserProfile() {
    const response = await fetch('https://api.github.com/user', {
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  // 🚀 Get ALL repositories (with pagination)
  async getAllRepositories(): Promise<GitHubRepo[]> {
    console.log('📚 Fetching ALL repositories with pagination...');
    
    const repos = await fetchAllPages<any>(
      'https://api.github.com/user/repos?sort=updated&affiliation=owner,collaborator,organization_member',
      this.accessToken,
      20 // Up to 20 pages (2000 repos)
    );

    return repos.map((repo: any) => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      createdAt: repo.created_at,
      private: repo.private
    }));
  }

  // 🚀 Get ALL commits (using Search API)
  async getAllCommits(username: string, days?: number): Promise<GitHubCommit[]> {
    try {
      console.log(`📝 Fetching ALL commits for ${username}...`);
      
      let query = `author:${username}`;
      
      // Add date filter if specified
      if (days) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        query += `+committer-date:>=${since.toISOString()}`;
      }
      
      const response = await fetch(
        `https://api.github.com/search/commits?q=${query}&sort=author-date&order=desc&per_page=100`,
        {
          headers: {
            ...this.headers,
            'Accept': 'application/vnd.github.cloak-preview+json'
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.warn('Failed to fetch commits:', response.status);
        return [];
      }

      const data = await response.json();
      console.log(`✅ Total commits: ${data.items?.length || 0}`);

      return (data.items || []).map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        date: commit.commit.author.date,
        repository: commit.repository.full_name,
        url: commit.html_url,
        stats: {
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0
        }
      }));
    } catch (error) {
      console.warn('Failed to fetch commits:', error);
      return [];
    }
  }

  // 🚀 Get ALL pull requests (using Search API)
  async getAllPullRequests(username: string, days?: number): Promise<GitHubPR[]> {
    try {
      console.log(`🔀 Fetching ALL pull requests for ${username}...`);
      
      const response = await fetch(
        `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=100`,
        { 
          headers: this.headers,
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.warn('Failed to fetch PRs:', response.status);
        return [];
      }

      const data = await response.json();
      let allPRs = data.items || [];

      // Filter by date if specified
      if (days) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        
        allPRs = allPRs.filter((pr: any) => {
          const prDate = new Date(pr.updated_at);
          return prDate >= daysAgo;
        });
      }

      console.log(`✅ Total PRs: ${allPRs.length}`);

      return allPRs.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        merged: !!pr.pull_request?.merged_at,
        repository: pr.repository_url.split('/').slice(-2).join('/'),
        url: pr.html_url,
        createdAt: pr.created_at,
        mergedAt: pr.pull_request?.merged_at,
        comments: pr.comments,
        labels: pr.labels.map((l: any) => l.name)
      }));
    } catch (error) {
      console.warn('Failed to fetch PRs:', error);
      return [];
    }
  }

  // 🚀 Get ALL comments (using Search API)
  async getAllComments(username: string, days?: number): Promise<GitHubComment[]> {
    try {
      console.log(`💬 Fetching ALL comments for ${username}...`);
      
      const response = await fetch(
        `https://api.github.com/search/issues?q=commenter:${username}&sort=updated&order=desc&per_page=100`,
        { 
          headers: this.headers,
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.warn('Failed to fetch comments:', response.status);
        return [];
      }

      const data = await response.json();
      const issuesWithComments = data.items || [];

      console.log(`📊 Found ${issuesWithComments.length} issues/PRs where user commented`);

      // Fetch actual comments from each issue/PR
      const allComments: GitHubComment[] = [];

      for (const issue of issuesWithComments.slice(0, 50)) { // Limit to avoid rate limits
        try {
          const repoName = issue.repository_url.split('/').slice(-2).join('/');
          
          const commentsResponse = await fetch(
            `https://api.github.com/repos/${repoName}/issues/${issue.number}/comments`,
            { 
              headers: this.headers,
              cache: 'no-store',
            }
          );

          if (commentsResponse.ok) {
            const comments = await commentsResponse.json();
            
            // Filter to only user's comments
            const userComments = comments.filter((c: any) => c.user.login === username);

            for (const comment of userComments) {
              // Apply date filter if specified
              if (days) {
                const commentDate = new Date(comment.created_at);
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - days);
                
                if (commentDate < daysAgo) continue;
              }

              allComments.push({
                id: comment.id,
                body: comment.body,
                issueTitle: issue.title,
                issueNumber: issue.number,
                repository: repoName,
                url: comment.html_url,
                createdAt: comment.created_at,
                isPR: !!issue.pull_request
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch comments for issue #${issue.number}`);
        }
      }

      console.log(`✅ Total comments: ${allComments.length}`);
      return allComments;
    } catch (error) {
      console.warn('Failed to fetch comments:', error);
      return [];
    }
  }

  // Get new repositories (last N days)
  async getNewRepos(days: number = 30): Promise<GitHubRepo[]> {
    const allRepos = await this.getAllRepositories();
    
    const since = new Date();
    since.setDate(since.getDate() - days);

    return allRepos.filter(repo => new Date(repo.createdAt) >= since);
  }

  // 🚀 Get COMPLETE activity summary with ALL data
  async getActivitySummary(days: number = 7): Promise<ActivitySummary> {
    console.log('🐙 Fetching COMPLETE GitHub activity summary...');

    const profile = await this.getUserProfile();
    const username = profile.login;

    console.log(`🐙 Analyzing ALL activity for @${username}`);

    // Fetch ALL data in parallel
    const [allRepos, commits, prs, comments] = await Promise.all([
      this.getAllRepositories(),
      this.getAllCommits(username, days),
      this.getAllPullRequests(username, days),
      this.getAllComments(username, days)
    ]);

    const newRepos = this.filterNewRepos(allRepos, days);

    const summary: ActivitySummary = {
      user: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        publicRepos: profile.public_repos,
        avatar_url: profile.avatar_url
      },
      timeframe: `Last ${days} days`,
      activity: {
        commits,
        pullRequests: prs,
        newRepositories: newRepos,
        allRepositories: allRepos,
        comments
      },
      stats: {
        totalCommits: commits.length,
        totalPRs: prs.length,
        mergedPRs: prs.filter(pr => pr.merged).length,
        openPRs: prs.filter(pr => pr.state === 'open').length,
        newRepos: newRepos.length,
        totalRepos: allRepos.length,
        totalComments: comments.length,
        totalAdditions: commits.reduce((sum, c) => sum + c.stats.additions, 0),
        totalDeletions: commits.reduce((sum, c) => sum + c.stats.deletions, 0)
      }
    };

    console.log('✅ COMPLETE activity summary compiled:', {
      repos: summary.stats.totalRepos,
      commits: summary.stats.totalCommits,
      prs: summary.stats.totalPRs,
      comments: summary.stats.totalComments
    });

    return summary;
  }

  private filterNewRepos(repos: GitHubRepo[], days: number): GitHubRepo[] {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return repos.filter(repo => new Date(repo.createdAt) >= since);
  }
}