import Link from "next/link";
import Image from "next/image";
import { GitBranch, Twitter, Linkedin } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[hsl(var(--border))]/50 bg-background/60 backdrop-blur-xl">
      <div className="px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <Image
              src="/Blazzic_Logo.png"
              alt="Blazzic"
              width={190}
              height={56}
              className="dark:invert object-contain"
            />
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
              Automatically transform your GitHub contributions into resume-ready
              achievements and professional content.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                <GitBranch className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
              <li><Link href="/product" className="hover:text-foreground transition-colors">How it works</Link></li>
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="https://twitter.com" className="hover:text-foreground transition-colors">Twitter</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[hsl(var(--border))]/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          <p>&copy; {new Date().getFullYear()} Blazzic. All rights reserved.</p>
          <p>Built for developers who ship.</p>
        </div>
      </div>
    </footer>
  );
}
