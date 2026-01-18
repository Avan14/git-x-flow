// GitHub Service - Enhanced data fetching and processing
// This extends your existing lib/github.ts

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
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  createdAt: string;
  private: boolean;
}

export interface ActivitySummary {
  user: {
    username: string;
    name: string;
    bio: string | null;
    followers: number;
    publicRepos: number;
  };
  timeframe: string;
  activity: {
    commits: GitHubCommit[];
    pullRequests: GitHubPR[];
    newRepositories: GitHubRepo[];
  };
  stats: {
    totalCommits: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    newRepos: number;
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
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  // Get recent commits (last N days)
  async getRecentCommits(username: string, days: number = 7): Promise<GitHubCommit[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      
      const response = await fetch(
        `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${since.toISOString()}&sort=author-date&order=desc&per_page=30`,
        {
          headers: {
            ...this.headers,
            'Accept': 'application/vnd.github.cloak-preview+json'
          }
        }
      );

      if (!response.ok) {
        console.warn('Failed to fetch commits');
        return [];
      }

      const data = await response.json();

      return data.items.map((commit: any) => ({
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

  // Get recent pull requests
  async getRecentPRs(username: string, days: number = 7): Promise<GitHubPR[]> {
    try {
      const response = await fetch(
        `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=20`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.warn('Failed to fetch PRs');
        return [];
      }

      const data = await response.json();
      const allPRs = data.items;

      const recentPRs = allPRs.filter((pr: any) => {
        const prDate = new Date(pr.updated_at);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        return prDate >= daysAgo;
      });

      return recentPRs.map((pr: any) => ({
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

  // Get new repositories (last N days)
  async getNewRepos(days: number = 30): Promise<GitHubRepo[]> {
    try {
      const response = await fetch(
        'https://api.github.com/user/repos?sort=created&per_page=10',
        { headers: this.headers }
      );

      if (!response.ok) {
        console.warn('Failed to fetch repos');
        return [];
      }

      const repos = await response.json();
      const since = new Date();
      since.setDate(since.getDate() - days);

      return repos
        .filter((repo: any) => new Date(repo.created_at) >= since)
        .map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          createdAt: repo.created_at,
          private: repo.private
        }));
    } catch (error) {
      console.warn('Failed to fetch repos:', error);
      return [];
    }
  }

  // Get complete activity summary for AI analysis
  async getActivitySummary(days: number = 7): Promise<ActivitySummary> {
    console.log('🐙 Fetching GitHub activity summary...');

    const profile = await this.getUserProfile();
    const username = profile.login;

    console.log(`🐙 Analyzing activity for @${username}`);

    const [commits, prs, repos] = await Promise.all([
      this.getRecentCommits(username, days),
      this.getRecentPRs(username, days),
      this.getNewRepos(30)
    ]);

    const summary: ActivitySummary = {
      user: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        publicRepos: profile.public_repos
      },
      timeframe: `Last ${days} days`,
      activity: {
        commits,
        pullRequests: prs,
        newRepositories: repos
      },
      stats: {
        totalCommits: commits.length,
        totalPRs: prs.length,
        mergedPRs: prs.filter(pr => pr.merged).length,
        openPRs: prs.filter(pr => pr.state === 'open').length,
        newRepos: repos.length,
        totalAdditions: commits.reduce((sum, c) => sum + c.stats.additions, 0),
        totalDeletions: commits.reduce((sum, c) => sum + c.stats.deletions, 0)
      }
    };

    console.log('✅ Activity summary compiled', {
      commits: summary.stats.totalCommits,
      prs: summary.stats.totalPRs,
      repos: summary.stats.newRepos
    });

    return summary;
  }
}