"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GithubSignInButton() {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
    >
      <Github className="mr-2 h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
