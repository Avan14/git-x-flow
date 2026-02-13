"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Award, GitPullRequest, Target, Star, Eye, User } from "lucide-react";
import Link from "next/link";

interface StatsInsightsProps {
  monthlyStats: {
    totalAchievements: number;
    prsMerged: number;
    issues: number;
    starsGained: number;
  };
  topRepos: Array<{ name: string; count: number }>;
  portfolioStats?: { views: number; completeness: number; username: string } | null;
}

export function StatsInsights({
  monthlyStats,
  topRepos,
  portfolioStats,
}: StatsInsightsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary"
        >
          <h3 className="font-semibold">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {isExpanded && (
          <div className="animate-slide-down pb-4">{children}</div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-background/40 backdrop-blur-xl border-border/50">
      <CardContent className="p-6">
        <Section id="monthly" title="📊 This Month's Activity">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {monthlyStats.totalAchievements}
                </div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <GitPullRequest className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {monthlyStats.prsMerged}
                </div>
                <div className="text-xs text-muted-foreground">PRs Merged</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats.issues}</div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  +{monthlyStats.starsGained}
                </div>
                <div className="text-xs text-muted-foreground">Stars</div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="repos" title="🏆 Top Repositories">
          {topRepos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No repository data available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topRepos.map((repo, index) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{repo.name}</span>
                  </div>
                  <Badge variant="outline">
                    {repo.count} achievement{repo.count !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Section>

        {portfolioStats && (
          <Section id="portfolio" title="💼 Portfolio Stats">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Views this month</span>
                </div>
                <span className="font-semibold">{portfolioStats.views}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profile completeness</span>
                  </div>
                  <span className="font-semibold">
                    {portfolioStats.completeness}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${portfolioStats.completeness}%` }}
                  />
                </div>
              </div>

              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full" size="sm">
                  Edit Portfolio →
                </Button>
              </Link>
            </div>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}
