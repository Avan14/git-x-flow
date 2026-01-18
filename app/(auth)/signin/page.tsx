import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GitBranch, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubSignInButton } from "../../../components/githubSignin-button";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GitBranch className="h-7 w-7 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Welcome to gitXflow</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Sign in to start showcasing your open source work
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Connect your GitHub account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <GithubSignInButton />

          <div className="mt-6 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              We only access your public GitHub activity.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Read-only access
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure OAuth
          </div>
        </div>
      </div>
    </div>
  );
}
