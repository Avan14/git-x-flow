import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  GitCommit,
  GitPullRequest,
  Folder,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
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
import { createGitHubService } from "@/lib/github-service";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const accessToken = session.user.accessToken as string;

  if (!accessToken) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please connect your GitHub account first.</p>
            <Link href="/api/auth/signin">
              <Button className="mt-4">Sign In with GitHub</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    // Use the GitHub service to fetch all data
    const githubService = createGitHubService(accessToken);
    const data = await githubService.fetchDashboardData();

    const {
      profile,
      repos: allRepos,
      commits: allCommits,
      pullRequests: allPRs,
      issuesWithComments,
      stats,
    } = data;

    const username = profile.login;

    // Separate PRs by state
    const mergedPRs = allPRs.filter((pr) => pr.pull_request?.merged_at);
    const openPRs = allPRs.filter((pr) => pr.state === "open");
    const closedPRs = allPRs.filter(
      (pr) => pr.state === "closed" && !pr.pull_request?.merged_at,
    );

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
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Complete Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Repositories"
            value={stats.totalRepos}
            icon={<Folder className="h-4 w-4" />}
          />
          <StatCard
            title="All Commits"
            value={stats.totalCommits}
            icon={<GitCommit className="h-4 w-4" />}
          />
          <StatCard
            title="Pull Requests"
            value={stats.totalPRs}
            sub={`${stats.mergedPRs} merged, ${stats.openPRs} open`}
            icon={<GitPullRequest className="h-4 w-4" />}
          />
          <StatCard
            title="Comments Made"
            value={stats.totalComments}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="repos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="repos">
              <Folder className="h-4 w-4 mr-2" />
              All Repos ({stats.totalRepos})
            </TabsTrigger>
            <TabsTrigger value="commits">
              <GitCommit className="h-4 w-4 mr-2" />
              Commits ({stats.totalCommits})
            </TabsTrigger>
            <TabsTrigger value="prs">
              <GitPullRequest className="h-4 w-4 mr-2" />
              PRs ({stats.totalPRs})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({stats.totalComments})
            </TabsTrigger>
          </TabsList>

          {/* ALL REPOSITORIES */}
          <TabsContent value="repos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Your Repositories</CardTitle>
                <CardDescription>
                  Complete list of {stats.totalRepos} repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allRepos.map((repo) => (
                    <Card
                      key={repo.id}
                      className="hover:border-primary transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm flex-1">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              className="hover:text-primary transition-colors hover:underline"
                            >
                              {repo.name}
                            </a>
                          </CardTitle>
                          {repo.private && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              Private
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs line-clamp-2 mt-2">
                          {repo.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                          <span className="text-xs">
                            Updated:{" "}
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALL COMMITS */}
          <TabsContent value="commits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Your Commits</CardTitle>
                <CardDescription>
                  Showing {stats.totalCommits} commits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allCommits.slice(0, 50).map((commit) => (
                    <Card key={commit.sha} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <a
                            href={commit.html_url}
                            target="_blank"
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {commit.commit.message.split("\n")[0]}
                          </a>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              📁{" "}
                              <a
                                href={commit.repository.html_url}
                                target="_blank"
                                className="hover:text-primary hover:underline"
                              >
                                {commit.repository.full_name}
                              </a>
                            </span>
                            <span>🔗 {commit.sha.substring(0, 7)}</span>
                            <span>
                              📅{" "}
                              {new Date(
                                commit.commit.author.date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {stats.totalCommits > 50 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Showing first 50 of {stats.totalCommits} commits
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALL PULL REQUESTS */}
          <TabsContent value="prs" className="space-y-4">
            {/* Merged PRs */}
            {mergedPRs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Merged Pull Requests ({mergedPRs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mergedPRs.map((pr) => (
                      <Card
                        key={pr.id}
                        className="p-4 border-l-4 border-l-green-600"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <a
                              href={pr.html_url}
                              target="_blank"
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {pr.title}
                            </a>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                📁{" "}
                                {pr.repository_url
                                  .split("/")
                                  .slice(-2)
                                  .join("/")}
                              </span>
                              <span>#{pr.number}</span>
                              <span>
                                ✅ Merged{" "}
                                {pr.pull_request?.merged_at
                                  ? new Date(
                                      pr.pull_request.merged_at,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                              <span>💬 {pr.comments} comments</span>
                            </div>
                            {pr.labels.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {pr.labels.slice(0, 3).map((label) => (
                                  <Badge
                                    key={label.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Open PRs */}
            {openPRs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Open Pull Requests ({openPRs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {openPRs.map((pr) => (
                      <Card
                        key={pr.id}
                        className="p-4 border-l-4 border-l-blue-600"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <a
                              href={pr.html_url}
                              target="_blank"
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {pr.title}
                            </a>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                📁{" "}
                                {pr.repository_url
                                  .split("/")
                                  .slice(-2)
                                  .join("/")}
                              </span>
                              <span>#{pr.number}</span>
                              <span>
                                📅 Created{" "}
                                {new Date(pr.created_at).toLocaleDateString()}
                              </span>
                              <span>💬 {pr.comments} comments</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Closed PRs */}
            {closedPRs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Closed Pull Requests ({closedPRs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {closedPRs.map((pr) => (
                      <Card
                        key={pr.id}
                        className="p-4 border-l-4 border-l-red-600"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <a
                              href={pr.html_url}
                              target="_blank"
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {pr.title}
                            </a>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                📁{" "}
                                {pr.repository_url
                                  .split("/")
                                  .slice(-2)
                                  .join("/")}
                              </span>
                              <span>#{pr.number}</span>
                              <span>
                                🔴 Closed{" "}
                                {new Date(pr.closed_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ALL COMMENTS */}
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Your Comments</CardTitle>
                <CardDescription>
                  Issues and PRs where you've commented ({stats.totalComments}{" "}
                  total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issuesWithComments.slice(0, 50).map((issue) => (
                    <Card key={issue.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {issue.pull_request ? (
                              <Badge className="bg-purple-600">PR</Badge>
                            ) : (
                              <Badge variant="secondary">Issue</Badge>
                            )}
                            <a
                              href={issue.html_url}
                              target="_blank"
                              className="font-medium hover:text-primary hover:underline flex-1"
                            >
                              {issue.title}
                            </a>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              📁{" "}
                              {issue.repository_url
                                .split("/")
                                .slice(-2)
                                .join("/")}
                            </span>
                            <span>#{issue.number}</span>
                            <span>💬 {issue.comments} comments</span>
                            <span>
                              📅 Updated{" "}
                              {new Date(issue.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {stats.totalComments > 50 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Showing first 50 of {stats.totalComments} items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Link href="/dashboard/ai-posts">
              <Button>🤖 Generate AI Posts</Button>
            </Link>
            <Link href="/dashboard/achievements">
              <Button>🏆 View Achievements</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button>⚙️ Settings</Button>
            </Link>
          
            <form action="/api/github_sync" method="POST">
              <Button type="submit" variant="outline">
                🔄 Sync GitHub Data
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error.message}</p>
            <Link href="/api/auth/signout">
              <Button>Sign Out</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
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
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
