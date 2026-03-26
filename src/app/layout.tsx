import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getEffectiveSiteJson, getMergedSiteData } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getMergedSiteData();
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = (envBase || data.url).trim();
  let metadataBase: URL;
  try {
    metadataBase = new URL(base.endsWith("/") ? base : `${base}/`);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }
  return {
    metadataBase,
    title: {
      default: "Portfolio",
      template: "%s",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "",
      yandex: "",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background px-6 font-sans antialiased",
          "print:px-8 print:py-4",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
