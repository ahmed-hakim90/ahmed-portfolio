import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SiteTopBar() {
  return (
    <div
      className="print:hidden fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      data-testid="site-top-bar"
    >
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between gap-3 px-6 sm:px-6">
        <p className="text-xs text-muted-foreground sm:text-sm">
          تريد صفحة مثل هذه؟
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
            <Link href="/signup">إنشاء حساب</Link>
          </Button>
          <Button asChild size="sm" className="shrink-0 gap-1 text-xs sm:text-sm">
            <Link href="/dashboard/login">تسجيل دخول</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
