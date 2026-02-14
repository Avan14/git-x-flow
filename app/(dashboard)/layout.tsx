import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { headers } from "next/headers";
import {
  GitBranch,
  LayoutDashboard,
  Clock,
  Settings,
  LogOut,
  User,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { SyncButton } from "@/components/ui/sync-button";
import Image from "next/image";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
 
  if (!session?.user) {
    redirect("/signin");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("x-url") || "";



  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/dashboard/posts", icon: Clock },
    { name: "Settings", href: "/dashboard/settings", icon: Settings }
  ];


  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="flex h-16 items-center px-6 border-b border-[hsl(var(--border))]"
          >
            <Image
              src="/Blazzic_Logo.png"
              alt="Blazzic"
              width={140}
              height={40}
              priority
              className="object-contain dark:invert"
            />
          </Link>



          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {

              const isActive = pathname === item.href;
              return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 ${isActive ? "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]" : ""} rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })
          }
          </nav>

          {/* User section */}
          <div className="border-t border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-3 mb-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                  <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  @{session.user.username || "unknown"}
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-lg px-6 lg:px-10">
          <h1 className="text-lg font-semibold"></h1>
          <div className="flex items-center gap-3">
            <SyncButton />
            <ModeToggle />
          </div>
        </header>


        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
