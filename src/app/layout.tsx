import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getEffectiveSiteJson, getMergedSiteData } from "@/lib/site-data";
import { localeFromCookie } from "@/lib/i18n-messages";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
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
  const locale = localeFromCookie(cookies().get("portfolio_locale")?.value);
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background px-6 font-sans antialiased",
          "print:px-8 print:py-4",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
