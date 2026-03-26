import { AuthShell } from "@/components/auth/auth-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "إنشاء حساب عميل على المنصة",
};

function SignupFallback() {
  return (
    <AuthShell contentMaxWidthClass="max-w-xl">
      <Card className="border-border/80 bg-white shadow-lg dark:bg-card">
        <CardHeader className="space-y-3 px-6 pb-0 pt-8 text-center sm:px-8 sm:pt-10">
          <div className="mx-auto h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto w-full max-w-sm space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="mx-auto h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-4 pt-6 sm:px-8">
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
