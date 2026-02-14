import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Blazzic - AI-Powered Career Automation for Open Source Developers",
  description:
    "Transform your GitHub contributions into professional content. Generate resume bullets, LinkedIn posts, and Twitter threads automatically.",
  keywords: [
    "open source",
    "developer portfolio",
    "github",
    "resume",
    "linkedin",
    "twitter",
    "AI",
    "career automation",
  ],
  authors: [{ name: "Blazzic" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://Blazzic.dev",
    siteName: "Blazzic",
    title: "Blazzic - AI-Powered Career Automation",
    description:
      "Transform your GitHub contributions into professional content automatically.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blazzic - AI-Powered Career Automation",
    description:
      "Transform your GitHub contributions into professional content automatically.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[hsl(var(--background))] font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}