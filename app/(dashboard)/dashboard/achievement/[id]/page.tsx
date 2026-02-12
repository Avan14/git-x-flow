import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, ExternalLink, Calendar, TrendingUp, Code, FileText } from "lucide-react";

import { auth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { AchievementContentClient } from "./client";
import { UserAchievements } from "@/lib/user-achievements.server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticleBackground } from "@/components/ui/particle-background";

export default async function AchievementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const session = await auth();

  // Proper auth guard
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch achievement scoped to logged-in user
  const achievement = await UserAchievements(id, session.user.id);

  if (!achievement) {
    notFound();
  }

  // Map existing generated content
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

  const typeIcons: Record<string, any> = {
    first_contribution: TrendingUp,
    pr_merged: Code,
    issue_resolved: FileText,
    popular_repo: Star,
    maintainer: Star,
  };

  const TypeIcon = typeIcons[achievement.type] || Code;

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
        {/* Back button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="bg-background/40 backdrop-blur-xl border-border/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <TypeIcon className="h-8 w-8 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="text-sm">
                    {typeLabels[achievement.type] || achievement.type}
                  </Badge>

                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary text-lg">
                      {achievement.score}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">
                  {achievement.title}
                </h1>

                {achievement.description && (
                  <p className="text-muted-foreground mb-6 text-lg">
                    {achievement.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <a
                    href={achievement.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-foreground transition-colors font-medium"
                  >
                    <Code className="h-4 w-4" />
                    {achievement.repoOwner}/{achievement.repoName}
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {achievement.repoStars > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{formatNumber(achievement.repoStars)} stars</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {new Date(achievement.occurredAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        {achievement.impactData && (
          <Card className="bg-background/40 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Impact Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    +{(achievement.impactData as { linesAdded?: number })
                      .linesAdded || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Lines added
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-rose-500/10">
                  <div className="text-3xl font-bold text-rose-400 mb-1">
                    -{(achievement.impactData as { linesRemoved?: number })
                      .linesRemoved || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Lines removed
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {(achievement.impactData as { filesChanged?: number })
                      .filesChanged || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Files changed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Content Section */}
        <Card className="bg-background/40 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/achievement/${achievement.id}/content`}>
              <Button size="lg" className="w-full gap-2 border-2">
                <FileText className="h-5 w-5" />
                Manage Content
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}