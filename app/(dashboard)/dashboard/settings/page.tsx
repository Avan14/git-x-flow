
import { prisma } from "@/lib/db";
import { User, Globe, Lock, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function SettingsPage() {
const session = {
    user: { id: "user-id-123", name: "Demo User", username: "demouser",image: null },
  }

  if (!session?.user?.id) {
    return null;
  }

  // Fetch user with portfolio
  const user = {
    id: "user-id-123",
    portfolio: {
      username: "demouser",
      isPublic: true,
    },
    accounts: [
      { provider: "github" },
    ],
    
  }

  const portfolio = user?.portfolio;
  const githubAccount = user?.accounts.find((a: any) => a.provider === "github");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Manage your account and portfolio settings
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                <User className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              </div>
            )}
            <div>
              <p className="font-medium">{session.user.name || "User"}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {session.user.email}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                @{session.user.username || "unknown"}
              </p>
            </div>
          </div>

          {githubAccount && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">GitHub Connected</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Portfolio
          </CardTitle>
          <CardDescription>
            Share your achievements with a public portfolio page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolio ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Portfolio URL</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    /portfolio/{portfolio.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={portfolio.isPublic ? "success" : "secondary"}>
                    {portfolio.isPublic ? (
                      <Globe className="mr-1 h-3 w-3" />
                    ) : (
                      <Lock className="mr-1 h-3 w-3" />
                    )}
                    {portfolio.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
              <Link href={`/portfolio/${portfolio.username}`} target="_blank">
                <Button variant="outline" className="w-full">
                  View Portfolio
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                You haven&apos;t created a portfolio yet.
              </p>
              <Button>Create Portfolio</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your achievements and generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/api/export/markdown" download>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export as Markdown
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
