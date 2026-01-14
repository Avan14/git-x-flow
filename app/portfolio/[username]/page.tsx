import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  GitBranch,
  Star,
  Calendar,
  Trophy,
  GitPullRequest,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatRelativeDate } from "@/lib/utils";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch user and portfolio
  const portfolio = await prisma.portfolio.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          achievements: {
            orderBy: { occurredAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!portfolio || !portfolio.isPublic) {
    notFound();
  }

  const { user } = portfolio;
  const achievements = user.achievements;

  // Calculate stats
  const totalScore = achievements.reduce((sum: number, a: any) => sum + a.score, 0);
  const totalAchievements = achievements.length;
  const prsMerged = achievements.filter((a: any) => a.type === "pr_merged").length;

  const typeLabels: Record<string, string> = {
    first_contribution: "First Contribution",
    pr_merged: "PR Merged",
    issue_resolved: "Issue Resolved",
    popular_repo: "Popular Repo",
    maintainer: "Maintainer",
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center gap-6">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || username}
                className="h-24 w-24 rounded-full border-4 border-[hsl(var(--border))]"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                {(user.name || username)[0].toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-1">{user.name || username}</h1>
              {portfolio.headline && (
                <p className="text-lg text-[hsl(var(--muted-foreground))] mb-2">
                  {portfolio.headline}
                </p>
              )}
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                @{username}
              </p>
            </div>
          </div>

          {portfolio.bio && (
            <p className="mt-6 text-[hsl(var(--muted-foreground))] max-w-2xl">
              {portfolio.bio}
            </p>
          )}

          {/* Stats */}
          {portfolio.showScore && (
            <div className="flex gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalScore}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Impact Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalAchievements}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Achievements
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{prsMerged}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  PRs Merged
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Timeline */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-xl font-semibold mb-8">Achievement Timeline</h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[hsl(var(--border))]" />

          <div className="space-y-8">
            {achievements.map((achievement: any, index: number) => (
              <div key={achievement.id} className="relative pl-16">
                {/* Timeline dot */}
                <div className="absolute left-4 top-2 h-5 w-5 rounded-full border-4 border-[hsl(var(--background))] bg-[hsl(var(--primary))]" />

                <Card className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <a
                            href={achievement.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] inline-flex items-center gap-1"
                          >
                            {achievement.repoOwner}/{achievement.repoName}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {achievement.repoStars > 0 && (
                            <span className="text-xs text-[hsl(var(--muted-foreground))] inline-flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              {formatNumber(achievement.repoStars)}
                            </span>
                          )}
                        </div>

                        <Badge
                          variant={achievement.type as "first_contribution" | "pr_merged" | "issue_resolved" | "popular_repo" | "maintainer"}
                          className="mb-2"
                        >
                          {typeLabels[achievement.type] || achievement.type}
                        </Badge>

                        <h3 className="font-medium">{achievement.title}</h3>

                        {achievement.description && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                            {achievement.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                          <Calendar className="h-3 w-3" />
                          {new Date(achievement.occurredAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      {portfolio.showScore && (
                        <div className="h-12 w-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center font-bold text-lg text-[hsl(var(--primary))]">
                          {achievement.score}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <GitBranch className="h-4 w-4" />
          Powered by gitXflow
        </div>
      </footer>
    </div>
  );
}
