"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Star,
  Target,
  Rocket,
  GitPullRequest,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  repoName: string;
  repoUrl: string;
  occurredAt: Date;
  score: number;
  hasGeneratedContent: boolean;
}

interface ActivityStreamProps {
  achievements: Achievement[];
  userId: string;
}

const typeConfig: Record<
  string,
  { icon: any; color: string; label: string; emoji: string }
> = {
  pr_merged: {
    icon: GitPullRequest,
    color: "text-purple-500",
    label: "PR Merged",
    emoji: "✅",
  },
  popular_repo: {
    icon: Star,
    color: "text-amber-500",
    label: "Repo Trending",
    emoji: "⭐",
  },
  issue_resolved: {
    icon: Target,
    color: "text-blue-500",
    label: "Issue Resolved",
    emoji: "🎯",
  },
  first_contribution: {
    icon: Rocket,
    color: "text-green-500",
    label: "First Contribution",
    emoji: "🚀",
  },
  commit: {
    icon: CheckCircle,
    color: "text-emerald-500",
    label: "Commit",
    emoji: "💻",
  },
};

export function ActivityStream({ achievements, userId }: ActivityStreamProps) {
  if (achievements.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Achievements</h2>
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No achievements yet</h3>
          <p className="mb-4 text-muted-foreground">
            Your recent GitHub activity will appear here. Sync your data to get
            started!
          </p>
          <form action="/api/github/sync" method="POST">
            <Button type="submit" className="gap-2">
              🔄 Sync GitHub Data
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Recent Achievements
          <span className="ml-2 text-lg text-muted-foreground">
            (Last 30 Days)
          </span>
        </h2>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement, index) => {
          const config =
            typeConfig[achievement.type] ||
            typeConfig.commit;
          const Icon = config.icon;

          return (
            <Card
              key={achievement.id}
              className="group overflow-hidden transition-all hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Achievement Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted ${config.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {config.emoji} {achievement.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>
                    </div>

                    {/* Achievement Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <a
                        href={achievement.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        📁 {achievement.repoName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span>
                        📅{" "}
                        {formatRelativeDate(new Date(achievement.occurredAt))}
                      </span>
                      {achievement.score > 7 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        >
                          🔥 High Impact
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {achievement.hasGeneratedContent ? (
                      <Link href="/dashboard/posts">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 whitespace-nowrap"
                        >
                          ✓ View Post
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/ai-posts?achievement=${achievement.id}`}>
                        <Button
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate Content
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length >= 10 && (
        <div className="text-center pt-4">
          <Link href="/dashboard/achievements">
            <Button variant="outline" className="gap-2">
              View All Achievements
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
