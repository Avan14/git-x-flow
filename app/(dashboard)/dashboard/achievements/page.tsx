import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Star, 
  GitPullRequest, 
  Target, 
  Rocket, 
  Code, 
  Calendar,
  ExternalLink,
  CheckCircle,
  Circle
} from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";

export default async function AchievementsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const achievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
    include: { content: true },
    orderBy: { occurredAt: "desc" },
  });

  const typeConfig: Record<string, { icon: any; color: string; label: string; bgColor: string }> = {
    first_contribution: {
      icon: Rocket,
      color: "text-emerald-500",
      label: "First Contribution",
      bgColor: "bg-emerald-500/10"
    },
    pr_merged: {
      icon: GitPullRequest,
      color: "text-purple-500",
      label: "PR Merged",
      bgColor: "bg-purple-500/10"
    },
    issue_resolved: {
      icon: Target,
      color: "text-blue-500",
      label: "Issue Resolved",
      bgColor: "bg-blue-500/10"
    },
    popular_repo: {
      icon: Star,
      color: "text-amber-500",
      label: "Popular Repo",
      bgColor: "bg-amber-500/10"
    },
    maintainer: {
      icon: Code,
      color: "text-pink-500",
      label: "Maintainer",
      bgColor: "bg-pink-500/10"
    },
  };

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">All Achievements</h1>
            <p className="text-muted-foreground mt-2">
              {achievements.length} total achievements unlocked
            </p>
          </div>
          
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {achievements.filter(a => a.content.length > 0).length} with content
          </Badge>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <Card className="bg-background/40 backdrop-blur-xl border-border/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Rocket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No achievements yet</h3>
            <p className="text-muted-foreground mb-4">
              Sync your GitHub data to start discovering your achievements
            </p>
            <form action="/api/github/sync" method="POST">
              <Button type="submit" size="lg" className="gap-2">
                🔄 Sync GitHub Data
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const config = typeConfig[achievement.type] || {
                icon: Code,
                color: "text-gray-500",
                label: achievement.type,
                bgColor: "bg-gray-500/10"
              };
              const Icon = config.icon;
              const hasContent = achievement.content.length > 0;

              return (
                <Card
                  key={achievement.id}
                  className="group overflow-hidden transition-all hover:shadow-lg bg-background/40 backdrop-blur-xl border-border/50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      {/* Left side - Icon and content */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-lg font-semibold">
                              {achievement.title}
                            </h2>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            {achievement.score > 7 && (
                              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                🔥 High Impact
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <a
                              href={achievement.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                              {achievement.repoOwner}/{achievement.repoName}
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            {achievement.repoStars > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                {achievement.repoStars.toLocaleString()} stars
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(achievement.occurredAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Content Status */}
                          <div className="flex items-center gap-2">
                            {hasContent ? (
                              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {achievement.content.length} content generated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Circle className="h-3 w-3" />
                                No content yet
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/dashboard/achievement/${achievement.id}`}>
                          <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                            View Details
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>

                        {!hasContent && (
                          <Link href={`/dashboard/achievement/${achievement.id}/content`}>
                            <Button size="sm" className="gap-2 whitespace-nowrap border-2">
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
        )}
      </div>
    </div>
  );
}