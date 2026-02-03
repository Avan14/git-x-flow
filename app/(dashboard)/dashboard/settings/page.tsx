import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  User, Globe, Lock, Download, CreditCard, Zap, 
  Check, X, Twitter, Linkedin, Github, Crown,
  BarChart3, Calendar, Award, Shield, Bell, Palette,
  Activity, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { prismaClient } from "@/lib/db";
import { ParticleBackground } from "@/components/ui/particle-background";
const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    period: "",
    posts: 5,
    features: [
      "5 AI posts per month",
      "GitHub sync",
      "Achievement tracking",
      "Public portfolio",
      "1 social platform"
    ],
    limits: [
      "No Twitter/LinkedIn posting",
      "Basic AI analysis",
      "Manual sync only"
    ]
  },
  pro: {
    name: "Pro",
    price: "$9",
    period: "/month",
    posts: 50,
    features: [
      "50 AI posts per month",
      "Auto GitHub sync",
      "Advanced AI analysis",
      "Multi-platform posting",
      "Twitter + LinkedIn",
      "Post scheduling",
      "Priority support",
      "Custom portfolio themes"
    ],
    limits: []
  }
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch user data from database
  const userData = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    include: {
      portfolio: true,
      subscription: true,
      accounts: {
        select: {
          provider: true,
        },
      },
      _count: {
        select: {
          achievements: true,
          content: true,
          scheduledPosts: {
            where: {
              status: 'pending',
            },
          },
        },
      },
    },
  });

  if (!userData) {
    redirect("/signin");
  }

  // Get current month's usage
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const usageRecord = await prismaClient.usageRecord.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  // Prepare user data
  const user = {
    id: userData.id,
    email: userData.email || session.user.email,
    name: userData.name || session.user.name,
    image: userData.image || session.user.image,
    username: userData.username || session.user.username,
    createdAt: userData.createdAt,
    portfolio: userData.portfolio,
    accounts: userData.accounts,
    _count: userData._count,
  };

  // Get current plan and limits
  const currentPlan = userData.subscription?.plan || 'free';
  const plan = PLANS[currentPlan as keyof typeof PLANS];
  
  // Calculate usage percentage
  const postsThisMonth = usageRecord?.postsGenerated || 0;
  const usagePercent = (postsThisMonth / plan.posts) * 100;

  // Get GitHub account
  const githubAccount = user.accounts.find((a: any) => a.provider === "github");

  // Calculate account age in days
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <ParticleBackground/>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Account & Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your account, billing, and preferences
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-background/40 backdrop-blur-xl border-border/50">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Current Plan
                    </CardTitle>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{plan.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.price}{plan.period}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Achievements
                    </CardTitle>
                    <Award className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{user._count.achievements}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlocked
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Content
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{user._count.content}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Member For
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{accountAge}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage & Billing */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Usage Card */}
              <Card className="border-2 hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50  from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Monthly Usage</CardTitle>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {plan.price}{plan.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-medium">AI Posts</span>
                      </div>
                      <span className="text-sm font-medium">
                        {postsThisMonth} / {plan.posts}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {plan.posts - postsThisMonth} posts remaining this month
                    </p>
                  </div>

                  {currentPlan === "free" && (
                    <div className="pt-4 border-t">
                      <Button className="w-full" size="lg">
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:border-primary/50 transition-colors bg-background/40 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Activity className="mr-2 h-4 w-4" />
                      View Dashboard
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/ai-posts">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Zap className="mr-2 h-4 w-4" />
                      Generate AI Posts
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                  {user.portfolio && (
                    <Link href={`/portfolio/${user.portfolio.username}`}>
                      <Button variant="outline" className="w-full justify-start" size="lg">
                        <Globe className="mr-2 h-4 w-4" />
                        View Portfolio
                        <ExternalLink className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href="/api/export/markdown">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your public profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-6">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-24 w-24 rounded-full border-4 border-primary/20"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center border-4 border-primary/20">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-2xl font-bold">{user.name || "User"}</p>
                        <p className="text-muted-foreground">@{user.username || "unknown"}</p>
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">User ID:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {user.id.substring(0, 16)}...
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Joined:</span>
                          <span className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.portfolio ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Public URL</p>
                        <code className="text-xs bg-muted px-3 py-2 rounded block">
                          /portfolio/{user.portfolio.username}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.portfolio.isPublic ? "default" : "secondary"} className="flex-1 justify-center">
                          {user.portfolio.isPublic ? (
                            <>
                              <Globe className="mr-1 h-3 w-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="mr-1 h-3 w-3" />
                              Private
                            </>
                          )}
                        </Badge>
                      </div>
                      <Link href={`/portfolio/${user.portfolio.username}`} target="_blank">
                        <Button variant="outline" className="w-full">
                          View Portfolio
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        No portfolio created yet
                      </p>
                      <Button variant="outline" className="w-full">
                        Create Portfolio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BILLING TAB */}
          <TabsContent value="billing" className="space-y-6">
            {/* Plans Comparison */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <Card className={currentPlan === "free" ? "border-2 border-primary" : "border-2"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
                    {currentPlan === "free" && (
                      <Badge className="bg-primary">Current Plan</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{PLANS.free.price}</span>
                    <span className="text-muted-foreground text-lg">/forever</span>
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
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className={currentPlan === "pro" ? "border-2 border-primary" : "border-2 border-yellow-500 bg-gradient-to-br from-yellow-500/5 to-transparent relative"}>
                {currentPlan !== "pro" && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-lg">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <CardHeader className={currentPlan !== "pro" ? "pt-8" : ""}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
                    </div>
                    {currentPlan === "pro" && (
                      <Badge className="bg-primary">Current Plan</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{PLANS.pro.price}</span>
                    <span className="text-muted-foreground text-lg">{PLANS.pro.period}</span>
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
                  {currentPlan !== "pro" && (
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" size="lg">
                      <Zap className="mr-2 h-5 w-5" />
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Secure payment processing powered by Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Credit Card</span>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer">
                    <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.226-1.414.048-2.386-.859-3.68z"/>
                    </svg>
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer">
                    <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                    </svg>
                    <span className="text-sm font-medium">Stripe</span>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-6">
                  💳 Payment integration coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your social media and development platform connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* GitHub */}
                <div className="flex items-center gap-4 p-4 border-2 rounded-lg hover:border-primary transition-colors">
                  <div className="rounded-full bg-black p-3">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      {githubAccount 
                        ? `Connected ${new Date(githubAccount.createdAt).toLocaleDateString()}` 
                        : "Not connected"}
                    </p>
                  </div>
                  {githubAccount ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Button size="sm">Connect</Button>
                  )}
                </div>

                {/* Twitter */}
                <div className={`flex items-center gap-4 p-4 border-2 rounded-lg ${currentPlan === 'free' ? 'opacity-60' : 'hover:border-primary transition-colors'}`}>
                  <div className="rounded-full bg-blue-400 p-3">
                    <Twitter className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Twitter</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan === 'free' ? 'Available in Pro plan' : 'Not connected'}
                    </p>
                  </div>
                  {currentPlan === 'free' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3 text-yellow-500" />
                      Pro Only
                    </Badge>
                  ) : (
                    <Button size="sm">Connect</Button>
                  )}
                </div>

                {/* LinkedIn */}
                <div className={`flex items-center gap-4 p-4 border-2 rounded-lg ${currentPlan === 'free' ? 'opacity-60' : 'hover:border-primary transition-colors'}`}>
                  <div className="rounded-full bg-blue-600 p-3">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">LinkedIn</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan === 'free' ? 'Available in Pro plan' : 'Not connected'}
                    </p>
                  </div>
                  {currentPlan === 'free' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3 text-yellow-500" />
                      Pro Only
                    </Badge>
                  ) : (
                    <Button size="sm">Connect</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Badge>On</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Achievement Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified of new achievements</p>
                    </div>
                    <Badge>On</Badge>
                  </div>
                  <div className={`flex items-center justify-between p-3 border rounded-lg ${currentPlan === 'free' ? 'opacity-60' : ''}`}>
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-xs text-muted-foreground">Summary of your activity</p>
                    </div>
                    <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                      {currentPlan === 'free' ? 'Pro Only' : 'On'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-600/50">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="text-sm font-medium text-red-900 dark:text-red-400 mb-3">
                      Delete Account
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-500 mb-4">
                      This will permanently delete your account, all achievements, generated content, and cannot be undone.
                    </p>
                    <Button variant="destructive" className="w-full" disabled>
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}