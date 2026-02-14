import Link from "next/link";
import {
  Zap, GitBranch, FileText, Star, GitPullRequest, Award,
  Sparkles, ArrowRight, Calendar, Globe, Shield, BarChart3,
  Twitter, Linkedin, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { ParticleBackground } from "@/components/ui/particle-background";

const FEATURES = [
  {
    icon: <GitBranch className="h-6 w-6 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    title: "GitHub Sync",
    description: "Automatically connect and sync your GitHub activity. We analyze your public contributions, PRs, issues, and reviews in real-time.",
  },
  {
    icon: <Zap className="h-6 w-6 text-purple-400" />,
    gradient: "from-purple-500/20 to-purple-500/5",
    title: "AI-Powered Analysis",
    description: "Our AI identifies meaningful achievements from your activity — merged PRs, resolved issues, first contributions to popular repos, and more.",
  },
  {
    icon: <FileText className="h-6 w-6 text-blue-400" />,
    gradient: "from-blue-500/20 to-blue-500/5",
    title: "Multi-Format Content",
    description: "Generate polished resume bullets, LinkedIn posts, and Twitter threads — all tailored for each platform's style and audience.",
  },
  {
    icon: <Twitter className="h-6 w-6 text-sky-400" />,
    gradient: "from-sky-500/20 to-sky-500/5",
    title: "Direct Posting",
    description: "Post directly to Twitter and LinkedIn from Blazzic. No copy-pasting needed — share your achievements with one click.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-amber-400" />,
    gradient: "from-amber-500/20 to-amber-500/5",
    title: "Post Scheduling",
    description: "Schedule your content for optimal engagement times. Queue up posts and let Blazzic publish them automatically.",
  },
  {
    icon: <Globe className="h-6 w-6 text-pink-400" />,
    gradient: "from-pink-500/20 to-pink-500/5",
    title: "Public Portfolio",
    description: "Get a beautiful, auto-generated portfolio page showcasing your open source achievements. Share it on your resume or LinkedIn.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-green-400" />,
    gradient: "from-green-500/20 to-green-500/5",
    title: "Achievement Scoring",
    description: "Every contribution is scored based on impact — repo popularity, PR complexity, and community engagement.",
  },
  {
    icon: <Shield className="h-6 w-6 text-violet-400" />,
    gradient: "from-violet-500/20 to-violet-500/5",
    title: "Privacy First",
    description: "We only read your public GitHub activity via OAuth. Your code, private repos, and sensitive data are never accessed or stored.",
  },
  {
    icon: <Clock className="h-6 w-6 text-rose-400" />,
    gradient: "from-rose-500/20 to-rose-500/5",
    title: "90-Day Analysis",
    description: "We analyze up to 90 days of your GitHub history to find all the achievements you might have missed showcasing.",
  },
];

const ACHIEVEMENT_TYPES = [
  { icon: <Star className="h-5 w-5 text-emerald-400" />, bg: "bg-emerald-500/10", name: "First Contribution", desc: "Your first PR to a new repo" },
  { icon: <GitPullRequest className="h-5 w-5 text-purple-400" />, bg: "bg-purple-500/10", name: "PR Merged", desc: "Successfully merged pull requests" },
  { icon: <Award className="h-5 w-5 text-amber-400" />, bg: "bg-amber-500/10", name: "Popular Repo", desc: "Contributed to 1K+ star repos" },
  { icon: <Zap className="h-5 w-5 text-sky-400" />, bg: "bg-sky-500/10", name: "Issue Resolved", desc: "Fixed bugs & closed issues" },
  { icon: <GitBranch className="h-5 w-5 text-pink-400" />, bg: "bg-pink-500/10", name: "Maintainer", desc: "Reviewed & merged others' PRs" },
  { icon: <FileText className="h-5 w-5 text-violet-400" />, bg: "bg-violet-500/10", name: "And More...", desc: "Documentation, releases, etc." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Packed with Power
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Showcase Your Work</span>
          </h1>
          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            From AI analysis to one-click posting — Blazzic handles the heavy lifting so you can focus on shipping code.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {FEATURES.map((feature, i) => (
            <Card key={i} glow className="bg-background/40 backdrop-blur-xl border-border/50">
              <CardContent className="pt-8 pb-6">
                <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Achievement Types */}
      <section className="py-24 px-4 bg-linear-to-b from-transparent via-[hsl(var(--card)/0.5)] to-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <Zap className="mr-2 h-3.5 w-3.5" />
              Smart Detection
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              We Find What Matters
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Our AI recognizes different types of contributions and scores them based on impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {ACHIEVEMENT_TYPES.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-sky-500/10 border-blue-500/20">
              <FileText className="mr-2 h-3.5 w-3.5" />
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
            <Card className="text-center p-8 bg-background/40 backdrop-blur-xl border-border/50">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Bullets</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Action-oriented, quantified achievements ready for your resume.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  &bull; Implemented real-time sync feature for React-based task manager, reducing load times by 40%
                </p>
              </div>
            </Card>

            <Card className="text-center p-8 bg-background/40 backdrop-blur-xl border-border/50">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
                <Linkedin className="h-7 w-7 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LinkedIn Posts</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Professional, engaging posts with hashtags and emojis.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  Excited to share my first contribution to @vercel/next.js! Fixed a routing bug affecting...
                </p>
              </div>
            </Card>

            <Card className="text-center p-8 bg-background/40 backdrop-blur-xl border-border/50">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-[hsl(var(--foreground)/0.1)] flex items-center justify-center mb-4">
                <Twitter className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Twitter Threads</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                Casual, story-driven threads that drive engagement.
              </p>
              <div className="text-left p-4 rounded-lg bg-[hsl(var(--muted))] text-sm">
                <p className="text-[hsl(var(--foreground))]">
                  Just got my first PR merged into a 10K+ star repo. Here&apos;s the story...
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="p-12 rounded-3xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Showcase Your Work?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
              Join developers who are turning their GitHub contributions into career opportunities.
            </p>
            <Link href="/signin">
              <Button size="xl" className="group border-2">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
