import Link from "next/link";
import {
  GitBranch, Zap, FileText, Sparkles, ArrowRight,
  Clock, BarChart3, Globe, Twitter, Linkedin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { ParticleBackground } from "@/components/ui/particle-background";

const STEPS = [
  {
    num: 1,
    icon: <GitBranch className="h-6 w-6 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    title: "Connect GitHub",
    description: "One-click OAuth to securely connect your GitHub account. We only read your public activity — no access to your code or private repos.",
    details: ["Secure OAuth 2.0 flow", "Read-only public activity", "Instant connection"],
  },
  {
    num: 2,
    icon: <Zap className="h-6 w-6 text-purple-400" />,
    gradient: "from-purple-500/20 to-purple-500/5",
    title: "Discover Achievements",
    description: "Our AI scans up to 90 days of your GitHub history. It identifies merged PRs, resolved issues, first contributions, and contributions to popular repositories.",
    details: ["90-day history scan", "12+ achievement types", "Impact-based scoring"],
  },
  {
    num: 3,
    icon: <FileText className="h-6 w-6 text-pink-400" />,
    gradient: "from-pink-500/20 to-pink-500/5",
    title: "Generate & Share",
    description: "Get polished content for your resume, LinkedIn, and Twitter. Post directly, schedule for later, or export to use anywhere.",
    details: ["3 output formats", "Direct posting", "Post scheduling"],
  },
];

const USE_CASES = [
  {
    icon: <BarChart3 className="h-6 w-6 text-green-400" />,
    title: "Job Seekers",
    description: "Turn your open source contributions into quantified resume bullets that hiring managers love.",
  },
  {
    icon: <Twitter className="h-6 w-6 text-sky-400" />,
    title: "DevRel & Advocates",
    description: "Automate your content pipeline. Share your contributions without spending hours writing posts.",
  },
  {
    icon: <Globe className="h-6 w-6 text-pink-400" />,
    title: "Open Source Maintainers",
    description: "Showcase your project's growth and your impact as a maintainer with auto-generated content.",
  },
  {
    icon: <Linkedin className="h-6 w-6 text-blue-400" />,
    title: "Career Builders",
    description: "Build a consistent personal brand on LinkedIn and Twitter with zero effort.",
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            How Blazzic Works
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            From <span className="gradient-text">Code to Content</span> in Minutes
          </h1>
          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Connect once, generate forever. Blazzic automates the entire flow from GitHub activity to polished professional content.
          </p>
        </div>
      </section>

      {/* How It Works - Detailed */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl space-y-8 stagger-children">
          {STEPS.map((step) => (
            <Card key={step.num} glow className="bg-background/40 backdrop-blur-xl border-border/50 overflow-hidden">
              <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-lg font-bold">
                    {step.num}
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${step.gradient} flex items-center justify-center`}>
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] mb-4">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[hsl(var(--border))]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold gradient-text">90 days</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Activity analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">12+</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Achievement types</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">3 formats</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Resume, LinkedIn, Twitter</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">&lt;60s</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">To generate content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-sky-500/10 border-blue-500/20">
              <Clock className="mr-2 h-3.5 w-3.5" />
              Who It&apos;s For
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Developers Who Ship
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Whether you&apos;re job hunting, building a brand, or maintaining open source — Blazzic fits your workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 stagger-children">
            {USE_CASES.map((uc, i) => (
              <Card key={i} glow className="bg-background/40 backdrop-blur-xl border-border/50">
                <CardContent className="pt-8 pb-6">
                  <div className="h-12 w-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                    {uc.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{uc.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">{uc.description}</p>
                </CardContent>
              </Card>
            ))}
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
                Start Free — Connect GitHub
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
