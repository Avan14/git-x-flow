import Link from "next/link";
import {
  GitBranch, Zap, FileText, Sparkles, ArrowRight,
  BookOpen, Code, Rocket, Settings, Key, Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { ParticleBackground } from "@/components/ui/particle-background";

const GUIDES = [
  {
    icon: <Rocket className="h-6 w-6 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    title: "Getting Started",
    description: "Connect your GitHub account, set up your profile, and generate your first content in under 2 minutes.",
    steps: [
      "Sign in with your GitHub account",
      "Allow read-only access to public activity",
      "Wait for AI to analyze your contributions",
      "Generate content for any achievement",
    ],
  },
  {
    icon: <Zap className="h-6 w-6 text-purple-400" />,
    gradient: "from-purple-500/20 to-purple-500/5",
    title: "Generating AI Posts",
    description: "Learn how to create polished content from your GitHub achievements using our AI engine.",
    steps: [
      "Navigate to AI Posts in your dashboard",
      "Select an achievement to write about",
      "Choose format: Resume, LinkedIn, or Twitter",
      "Edit, schedule, or post directly",
    ],
  },
  {
    icon: <Globe className="h-6 w-6 text-pink-400" />,
    gradient: "from-pink-500/20 to-pink-500/5",
    title: "Portfolio Setup",
    description: "Create a public portfolio page that showcases your open source achievements and contributions.",
    steps: [
      "Go to Settings > Profile > Portfolio",
      "Choose your portfolio username",
      "Toggle visibility to public",
      "Share your portfolio URL anywhere",
    ],
  },
  {
    icon: <Settings className="h-6 w-6 text-amber-400" />,
    gradient: "from-amber-500/20 to-amber-500/5",
    title: "Social Integrations",
    description: "Connect your Twitter and LinkedIn accounts for direct posting and scheduling.",
    steps: [
      "Go to Settings > Integrations",
      "Click Connect on Twitter or LinkedIn",
      "Authorize Blazzic to post on your behalf",
      "Start posting or scheduling from the dashboard",
    ],
  },
];

const API_ENDPOINTS = [
  { method: "GET", path: "/api/achievements", description: "List all your achievements" },
  { method: "POST", path: "/api/content/generate", description: "Generate AI content from an achievement" },
  { method: "GET", path: "/api/user/subscription", description: "Check your current plan and usage" },
  { method: "POST", path: "/api/github/sync", description: "Trigger a manual GitHub sync" },
  { method: "GET", path: "/api/export/markdown", description: "Export all achievements as Markdown" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <BookOpen className="mr-2 h-3.5 w-3.5" />
            Documentation
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Learn How to Use{" "}
            <span className="gradient-text">Blazzic</span>
          </h1>
          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Guides, references, and everything you need to get the most out of Blazzic.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Rocket className="h-5 w-5" />, label: "Quick Start", href: "#guides" },
            { icon: <Code className="h-5 w-5" />, label: "API Reference", href: "#api" },
            { icon: <Key className="h-5 w-5" />, label: "Authentication", href: "#guides" },
            { icon: <FileText className="h-5 w-5" />, label: "Content Formats", href: "#guides" },
          ].map((link, i) => (
            <a key={i} href={link.href} className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl hover:border-[hsl(var(--primary))]/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                {link.icon}
              </div>
              <span className="font-medium text-sm">{link.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section id="guides" className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Step-by-Step Guides
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Follow these guides to set up and make the most of Blazzic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 stagger-children">
            {GUIDES.map((guide, i) => (
              <Card key={i} glow className="bg-background/40 backdrop-blur-xl border-border/50">
                <CardContent className="pt-8 pb-6">
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${guide.gradient} flex items-center justify-center mb-4`}>
                    {guide.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                    {guide.description}
                  </p>
                  <ol className="space-y-2">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-medium">
                          {j + 1}
                        </span>
                        <span className="text-[hsl(var(--muted-foreground))]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="py-24 px-4 bg-linear-to-b from-transparent via-[hsl(var(--card)/0.5)] to-transparent">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-sky-500/10 border-blue-500/20">
              <Code className="mr-2 h-3.5 w-3.5" />
              API Reference
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Available Endpoints
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Core API endpoints available in Blazzic.
            </p>
          </div>
          <div className="space-y-3 stagger-children">
            {API_ENDPOINTS.map((endpoint, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl">
                <Badge variant={endpoint.method === "GET" ? "secondary" : "default"} className="font-mono text-xs w-16 justify-center">
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                <span className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:block">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="p-12 rounded-3xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Need Help?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Reach out to us on GitHub or Twitter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signin">
                <Button size="xl" className="group border-2">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="xl">
                  <GitBranch className="mr-2 h-5 w-5" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
