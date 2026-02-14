import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/lib/auth";

export async function MarketingNav() {
  const session = await auth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/Blazzic_Logo.png"
              alt="Blazzic"
              width={150}
              height={44}
              priority
              className="object-contain dark:invert"
            />
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link href="/product" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Product
            </Link>
            <Link href="/features" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {session ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium border border-[hsl(var(--border))] bg-background/60 backdrop-blur-md hover:bg-[hsl(var(--secondary))] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.25)] transition-all duration-200"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button className="h-9 px-4">Sign in with GitHub</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
