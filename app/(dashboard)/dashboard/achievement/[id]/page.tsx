import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft, Star, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { AchievementContentClient } from "./client";
import { auth } from "@/lib/auth";
import { UserAchievements } from "@/lib/user-achievements.server";

export default async function AchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  // Fetch achievement with existing content
  const achievement = await UserAchievements(id, session.user.id);;

  if (!achievement) {
    notFound();
  }

  // Transform existing content into a map
  const existingContent: Record<string, string> = {};
  for (const c of achievement.content) {
    existingContent[c.format] = c.content;
  }

  const typeLabels: Record<string, string> = {
    first_contribution: "First Contribution",
    pr_merged: "PR Merged",
    issue_resolved: "Issue Resolved",
    popular_repo: "Popular Repo",
    maintainer: "Maintainer",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Achievement Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={achievement.type as "first_contribution" | "pr_merged" | "issue_resolved" | "popular_repo" | "maintainer"}>
              {typeLabels[achievement.type] || achievement.type}
            </Badge>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center font-bold text-[hsl(var(--primary))]">
              {achievement.score}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">{achievement.title}</h1>

          {achievement.description && (
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              {achievement.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <a
              href={achievement.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {achievement.repoOwner}/{achievement.repoName}
              <ExternalLink className="h-3 w-3" />
            </a>

            {achievement.repoStars > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {formatNumber(achievement.repoStars)} stars
              </span>
            )}

            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(achievement.occurredAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      {achievement.impactData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impact Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  +{(achievement.impactData as { linesAdded?: number }).linesAdded || 0}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Lines added
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-rose-400">
                  -{(achievement.impactData as { linesRemoved?: number }).linesRemoved || 0}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Lines removed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {(achievement.impactData as { filesChanged?: number }).filesChanged || 0}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Files changed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Generation */}
      <AchievementContentClient
        achievementId={achievement.id}
        achievementTitle={achievement.title}
        existingContent={existingContent}
      />
    </div>
  );
}
