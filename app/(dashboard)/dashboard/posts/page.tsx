import { prisma } from "@/lib/db";
import { Clock, CheckCircle, XCircle, Loader2, Twitter, Linkedin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatRelativeDate } from "@/lib/utils";

export default async function PostsPage() {
  const session = {
    user: { id: "user-id-123", name: "Demo User", username: "demouser",image: null },
  }

  if (!session?.user?.id) {
    return null;
  }

  const posts = [{
  id: "post1",
  platform: "twitter",
  status: "published",
  createdAt: new Date(),
  content: {
    content: "This is a demo post generated from an achievement.",
    achievement: {
      repoName: "awesome-project",
    },
  },
  platformUrl: "https://twitter.com/demo/status/123",
  errorMessage: null,
}]


  const statusConfig: Record<
    string,
    { icon: typeof Clock; color: string; label: string }
  > = {
    pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
    processing: { icon: Loader2, color: "text-blue-400", label: "Processing" },
    published: { icon: CheckCircle, color: "text-emerald-400", label: "Published" },
    failed: { icon: XCircle, color: "text-rose-400", label: "Failed" },
  };

  const platformIcons: Record<string, typeof Twitter> = {
    twitter: Twitter,
    linkedin: Linkedin,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Scheduled Posts</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          View and manage your scheduled and published posts
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No posts yet"
          description="Generate content from your achievements and schedule posts to see them here."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => {
            const status = statusConfig[post.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const PlatformIcon = platformIcons[post.platform] || Twitter;

            return (
              <Card key={post.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                          <PlatformIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {post.platform}
                          </div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formatRelativeDate(new Date(post.createdAt))}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
                        {post.content.content.slice(0, 150)}...
                      </p>

                      {post.content.achievement && (
                        <Badge variant="secondary" className="text-xs">
                          {post.content.achievement.repoName}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={`${status.color} gap-1`}
                      >
                        <StatusIcon
                          className={`h-3 w-3 ${
                            post.status === "processing" ? "animate-spin" : ""
                          }`}
                        />
                        {status.label}
                      </Badge>

                      {post.platformUrl && (
                        <a
                          href={post.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-1"
                        >
                          View post
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {post.errorMessage && (
                        <p className="text-xs text-rose-400 max-w-50 text-right">
                          {post.errorMessage}
                        </p>
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
  );
}
