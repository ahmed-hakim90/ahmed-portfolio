"use client";

import { AuthShell, authFieldClass } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { dashboardLoginServerErrorAr } from "@/lib/admin-login-errors";
import { exchangeIdTokenForAdminSession } from "@/lib/admin-session-client";
import {
  firebaseAuthErrorMessageAr,
  getFirebaseAuthErrorCode,
  resolveFirebaseClientAuthError,
} from "@/lib/firebase-auth-errors";
import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard/site";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/bootstrap");
        const data = (await res.json()) as { needsBootstrap?: boolean };
        if (res.ok) setNeedsBootstrap(!!data.needsBootstrap);
        else setNeedsBootstrap(false);
      } catch {
        setNeedsBootstrap(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let idToken: string;
    try {
      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      idToken = await cred.user.getIdToken();
    } catch (err: unknown) {
      setError(resolveFirebaseClientAuthError(err));
      setLoading(false);
      return;
    }
    const session = await exchangeIdTokenForAdminSession(idToken);
    if (!session.ok) {
      setError(dashboardLoginServerErrorAr(session.error));
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
    setLoading(false);
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    let idToken: string;
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      idToken = await cred.user.getIdToken();
    } catch (err: unknown) {
      const code = getFirebaseAuthErrorCode(err);
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setError(null);
      } else {
        setError(
          code
            ? firebaseAuthErrorMessageAr(code)
            : resolveFirebaseClientAuthError(err),
        );
      }
      setLoading(false);
      return;
    }
    const session = await exchangeIdTokenForAdminSession(idToken);
    if (!session.ok) {
      setError(dashboardLoginServerErrorAr(session.error));
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
    setLoading(false);
  }

  return (
    <AuthShell>
      {needsBootstrap ? (
        <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] p-4 text-center shadow-sm dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-foreground">
            لم يُنشأ صاحب المنصة بعد
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ابدأ من صفحة الإعداد لربط حساب Firebase بأول مستند{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              owner
            </span>{" "}
            في قاعدة البيانات.
          </p>
          <Button asChild className="mt-4 w-full" variant="secondary" size="lg">
            <Link href="/dashboard/bootstrap">إنشاء صاحب المنصة</Link>
          </Button>
        </div>
      ) : null}

      <Card className="border-border/80 bg-white shadow-lg shadow-black/5 dark:bg-card dark:shadow-black/20">
        <CardHeader className="space-y-2 px-6 pb-2 pt-8 text-center sm:px-8 sm:pt-10">
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            تسجيل الدخول
          </CardTitle>
          {/* <CardDescription className="text-base leading-relaxed">
            ادخل إلى لوحة التحكم باستخدام البريد الإلكتروني أو حساب Google
            (Firebase).
          </CardDescription> */}
        </CardHeader>

        <form onSubmit={onSubmit} className="space-y-0">
          <CardContent className="space-y-5 px-6 pb-2 pt-4 sm:px-8">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-center text-sm font-medium leading-none text-foreground"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authFieldClass}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-center text-sm font-medium leading-none text-foreground"
              >
                كلمة المرور
              </label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full gap-2 text-base"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  جاري الدخول…
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2 border-border/80 text-base"
              size="lg"
              disabled={loading}
              onClick={() => void onGoogle()}
            >
              <GoogleIcon className="shrink-0" />
              المتابعة مع Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-border/60 bg-white px-6 py-5 sm:px-8 dark:bg-card/50">
            <p className="text-center text-sm text-muted-foreground">
              حساب للعملاء ؟{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                إنشاء حساب
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  );
}
