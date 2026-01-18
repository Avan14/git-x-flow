import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GitBranch,
  Zap,
  FileText,
  Twitter,
  Linkedin,
  ArrowRight,
  Star,
  GitPullRequest,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";

export default async function LandingPage() {
  
  const session = await auth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">gitXflow</span>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              {session ? (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <Link href="/signin">
                  <Button>
                    Sign in with GitHub
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI-Powered Career Automation
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Turn Your{" "}
            <span className="gradient-text">GitHub Contributions</span>
            <br />
            Into Career Content
          </h1>

          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
            Stop letting your open source work disappear. gitXflow automatically
            detects your achievements and generates polished content for your
            resume, LinkedIn, and Twitter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signin">
              <Button size="xl" className="group">
                Start Free — Connect GitHub
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">
            No credit card required • Works with any GitHub account
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-[hsl(var(--border))]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold gradient-text">90 days</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Activity analyzed
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">12+</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Achievement types
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">3 formats</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Resume • LinkedIn • Twitter
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">&lt;60s</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                To generate content
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              From Code to Content in Minutes
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Connect once, generate forever. Let AI do the heavy lifting while
              you focus on building.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Step 1 */}
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-sm font-bold">
                1
              </div>
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-4">
                  <GitBranch className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect GitHub</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  One-click OAuth to securely connect your GitHub account. We
                  only read your public activity.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-sm font-bold">
                2
              </div>
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Discover Achievements
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  AI analyzes your activity to find meaningful contributions,
                  first-time PRs, and impactful work.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-sm font-bold">
                3
              </div>
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate & Share</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  Get polished content for your resume, LinkedIn, and Twitter.
                  Post directly or export.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievement Types */}
      <section className="py-24 px-4 bg-linear-to-b from-transparent via-[hsl(var(--card)/0.5)] to-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Smart Detection
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              We Find What Matters
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Our AI recognizes different types of contributions and scores them
              based on impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-medium">First Contribution</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Your first PR to a new repo
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GitPullRequest className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">PR Merged</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Successfully merged pull requests
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="font-medium">Popular Repo</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Contributed to 1K+ star repos
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <div className="font-medium">Issue Resolved</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Fixed bugs & closed issues
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <div className="font-medium">Maintainer</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Reviewed & merged others&apos; PRs
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="font-medium">And More...</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Documentation, releases, etc.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Multiple Formats
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Content Ready for Every Platform
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Generate content tailored for different platforms with one click.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Bullets</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Action-oriented, quantified achievements ready for your resume.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  • Implemented real-time sync feature for React-based task
                  manager, reducing load times by 40%
                </p>
              </div>
            </Card>

            <Card className="text-center p-8">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
                <Linkedin className="h-7 w-7 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LinkedIn Posts</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Professional, engaging posts with hashtags and emojis.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  🎉 Excited to share my first contribution to @vercel/next.js!
                  Fixed a routing bug affecting...
                </p>
              </div>
            </Card>

            <Card className="text-center p-8">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-[hsl(var(--foreground)/0.1)] flex items-center justify-center mb-4">
                <Twitter className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Twitter Threads</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Casual, story-driven threads that drive engagement.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  🧵 Just got my first PR merged into a 10K+ star repo. Here&apos;s
                  the story...
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="p-12 rounded-3xl border border-[hsl(var(--border))] bg-linear-to-b from-[hsl(var(--card))] to-[hsl(var(--background))]">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Showcase Your Work?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
              Join developers who are turning their GitHub contributions into
              career opportunities.
            </p>
            <Link href="/signin">
              <Button size="xl" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[hsl(var(--border))]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">gitXflow</span>
            </div>

            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              © 2024 gitXflow. Built for open source developers.
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <GitBranch className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
