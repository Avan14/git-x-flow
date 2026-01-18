import { auth , getGitHubAccessToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GitCommit, GitPullRequest, Folder, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please connect your GitHub account first.</p>
            <Button asChild className="mt-4">
              <a href="/api/auth/signin">Sign In with GitHub</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // Fetch profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers,
      cache: "no-store",
    });
    const profile = await profileRes.json();
    const username = profile.login;

    // Fetch repos
    const reposRes = await fetch(
      "https://api.github.com/user/repos?sort=created&per_page=10",
      {
        headers,
        cache: "no-store",
      }
    );
    const allRepos = await reposRes.json();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newRepos = allRepos.filter(
      (repo: any) => new Date(repo.created_at) >= thirtyDaysAgo
    );

    // Fetch commits
    const commitsRes = await fetch(
      `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=20`,
      {
        headers: {
          ...headers,
          Accept: "application/vnd.github.cloak-preview+json",
        },
        cache: "no-store",
      }
    );

    const commitsData = await commitsRes.json();
    const commits = commitsData.items || [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCommits = commits.filter(
      (commit: any) =>
        new Date(commit.commit.author.date) >= sevenDaysAgo
    );

    // Fetch PRs
    const prsRes = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=20`,
      {
        headers,
        cache: "no-store",
      }
    );

    const prsData = await prsRes.json();
    const recentPRs = (prsData.items || []).filter(
      (pr: any) => new Date(pr.updated_at) >= sevenDaysAgo
    );

    const totalCommits = recentCommits.length;
    const totalPRs = recentPRs.length;
    const mergedPRs = recentPRs.filter(
      (pr: any) => pr.pull_request?.merged_at
    ).length;

    return (
      <div className="space-y-8">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="w-16 h-16 rounded-full border-2"
              />
              <div>
                <CardTitle className="text-2xl">
                  {profile.name || profile.login}
                </CardTitle>
                <CardDescription>@{profile.login}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Commits" value={totalCommits} icon={<GitCommit />} />
          <StatCard
            title="Pull Requests"
            value={totalPRs}
            sub={`${mergedPRs} merged`}
            icon={<GitPullRequest />}
          />
          <StatCard
            title="New Repos"
            value={newRepos.length}
            icon={<Folder />}
          />
          <StatCard
            title="Code Activity"
            value={recentCommits.length}
            icon={<Code />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild>
              <a href="/dashboard/ai-posts">🤖 Generate AI Posts</a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://github.com/${profile.login}`}
                target="_blank"
              >
                View GitHub Profile
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error: any) {
    console.error(error);
    redirect("/signin");
  }
}

function StatCard({ title, value, sub, icon}: {
  title: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
