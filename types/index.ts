// TypeScript type definitions for gitXflow

// ============================================
// Achievement Types
// ============================================

export type AchievementType =
    | "first_contribution"
    | "pr_merged"
    | "issue_resolved"
    | "popular_repo"
    | "maintainer";

export interface Achievement {
    id: string;
    userId: string;
    type: AchievementType;
    title: string;
    description: string | null;
    repoName: string;
    repoOwner: string;
    repoUrl: string;
    repoStars: number;
    prNumber: number | null;
    issueNumber: number | null;
    score: number;
    impactData: ImpactData | null;
    occurredAt: Date;
    createdAt: Date;
}

export interface ImpactData {
    linesAdded?: number;
    linesRemoved?: number;
    filesChanged?: number;
    reviewsReceived?: number;
    commentsCount?: number;
}

// ============================================
// Content Types
// ============================================

export type ContentFormat = "resume_bullet" | "linkedin_post" | "twitter_thread";

export interface GeneratedContent {
    id: string;
    achievementId: string;
    userId: string;
    format: ContentFormat;
    content: string;
    wordCount: number | null;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Social Post Types
// ============================================

export type Platform = "twitter" | "linkedin";
export type PostStatus = "pending" | "processing" | "published" | "failed";

export interface ScheduledPost {
    id: string;
    userId: string;
    contentId: string;
    platform: Platform;
    scheduledFor: Date;
    status: PostStatus;
    platformPostId: string | null;
    platformUrl: string | null;
    errorMessage: string | null;
    attempts: number;
    createdAt: Date;
    processedAt: Date | null;
    publishedAt: Date | null;
}

// ============================================
// Portfolio Types
// ============================================

export interface Portfolio {
    id: string;
    userId: string;
    username: string;
    bio: string | null;
    headline: string | null;
    isPublic: boolean;
    showScore: boolean;
    showTwitter: boolean;
    showLinkedIn: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// GitHub API Types
// ============================================

export interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        login: string;
        avatar_url: string;
    };
    repo: {
        name: string;
        url: string;
    };
    payload: GitHubEventPayload;
    created_at: string;
}

export interface GitHubEventPayload {
    action?: string;
    pull_request?: GitHubPullRequest;
    issue?: GitHubIssue;
    ref?: string;
    ref_type?: string;
    commits?: GitHubCommit[];
}

export interface GitHubPullRequest {
    number: number;
    title: string;
    body: string | null;
    state: string;
    merged: boolean;
    merged_at: string | null;
    additions: number;
    deletions: number;
    changed_files: number;
    html_url: string;
    user: {
        login: string;
    };
}

export interface GitHubIssue {
    number: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
    user: {
        login: string;
    };
}

export interface GitHubCommit {
    sha: string;
    message: string;
}

export interface GitHubRepo {
    name: string;
    full_name: string;
    owner: {
        login: string;
    };
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
}



// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// Session Types (NextAuth)
// ============================================

export interface SessionUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    username: string | null;
}
