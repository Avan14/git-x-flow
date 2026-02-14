import Link from "next/link";
import { Check, X, Zap, Crown, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { ParticleBackground } from "@/components/ui/particle-background";

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for getting started with open source content.",
    features: [
      "5 AI posts per month",
      "GitHub sync",
      "Achievement tracking",
      "Public portfolio",
      "1 social platform",
    ],
    limits: [
      "No Twitter/LinkedIn posting",
      "Basic AI analysis",
      "Manual sync only",
    ],
  },
  pro: {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For developers serious about building their personal brand.",
    features: [
      "50 AI posts per month",
      "Auto GitHub sync",
      "Advanced AI analysis",
      "Multi-platform posting",
      "Twitter + LinkedIn",
      "Post scheduling",
      "Priority support",
      "Custom portfolio themes",
    ],
    limits: [],
  },
};

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your Pro subscription at any time. You'll keep access until the end of your billing period.",
  },
  {
    q: "What happens when I hit my post limit?",
    a: "On the Free plan, you'll need to wait until next month. Pro users get 50 posts per month, which resets on your billing date.",
  },
  {
    q: "Do you store my GitHub data?",
    a: "We only read your public activity via GitHub OAuth. We never store your code or private repository data.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade anytime from your settings page. Changes take effect immediately.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="border-2 bg-background/40 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {PLANS.free.description}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold">{PLANS.free.price}</span>
                <span className="text-muted-foreground text-lg">
                  {PLANS.free.period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {PLANS.free.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm flex-1">{feature}</span>
                  </div>
                ))}
                {PLANS.free.limits.map((limit, i) => (
                  <div key={i} className="flex items-start gap-3 opacity-60">
                    <div className="rounded-full bg-red-500/10 p-1 mt-0.5">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm flex-1">{limit}</span>
                  </div>
                ))}
              </div>
              <Link href="/signin">
                <Button variant="outline" className="w-full" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-500/5 to-transparent relative backdrop-blur-xl">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-lg">
              MOST POPULAR
            </div>
            <CardHeader className="pt-8">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {PLANS.pro.description}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold">{PLANS.pro.price}</span>
                <span className="text-muted-foreground text-lg">
                  {PLANS.pro.period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {PLANS.pro.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm flex-1">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/signin">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  size="lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Upgrade to Pro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-linear-to-b from-transparent via-[hsl(var(--card)/0.5)] to-transparent">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Everything you need to know about our pricing.
            </p>
          </div>
          <div className="space-y-4 stagger-children">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-[hsl(var(--border))]/50 bg-background/40 backdrop-blur-xl"
              >
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item.a}
                </p>
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
              Ready to Get Started?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
              Join developers who are turning their GitHub contributions into
              career opportunities.
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
