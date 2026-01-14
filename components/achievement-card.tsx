"use client";

import Link from "next/link";
import { Star, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatRelativeDate, truncate } from "@/lib/utils";
import type { AchievementType } from "@/types";

interface AchievementCardProps {
  achievement: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    repoName: string;
    repoOwner: string;
    repoUrl: string;
    repoStars: number;
    score: number;
    occurredAt: Date;
  };
  hasContent: boolean;
}

const typeLabels: Record<AchievementType, string> = {
  first_contribution: "First Contribution",
  pr_merged: "PR Merged",
  issue_resolved: "Issue Resolved",
  popular_repo: "Popular Repo",
  maintainer: "Maintainer",
};

const typeColors: Record<AchievementType, string> = {
  first_contribution: "text-emerald-400 bg-emerald-500/10",
  pr_merged: "text-purple-400 bg-purple-500/10",
  issue_resolved: "text-sky-400 bg-sky-500/10",
  popular_repo: "text-amber-400 bg-amber-500/10",
  maintainer: "text-pink-400 bg-pink-500/10",
};

export function AchievementCard({ achievement, hasContent }: AchievementCardProps) {
  const type = achievement.type as AchievementType;
  const colorClass = typeColors[type] || "text-gray-400 bg-gray-500/10";

  return (
    <Card glow className="group transition-all hover:border-[hsl(var(--primary)/0.5)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Repo badge */}
            <div className="flex items-center gap-2 mb-2">
              <a
                href={achievement.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <span className="font-medium">
                  {achievement.repoOwner}/{achievement.repoName}
                </span>
                <ExternalLink className="h-3 w-3" />
              </a>
              {achievement.repoStars > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  {formatNumber(achievement.repoStars)}
                </span>
              )}
            </div>

            {/* Type badge */}
            <Badge
              variant={type as AchievementType}
              className="mb-2"
            >
              {typeLabels[type] || type}
            </Badge>

            {/* Title */}
            <h3 className="font-semibold mb-1 line-clamp-1">{achievement.title}</h3>

            {/* Description */}
            {achievement.description && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
                {truncate(achievement.description, 120)}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {formatRelativeDate(new Date(achievement.occurredAt))}
              </span>

              <Link href={`/dashboard/achievement/${achievement.id}`}>
                <Button variant="ghost" size="sm" className="h-8">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {hasContent ? "View Content" : "Generate"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Score badge */}
          <div className="flex-shrink-0">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${colorClass}`}>
              {achievement.score}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
