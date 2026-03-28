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
import { cn } from "@/lib/utils";
import {
  firebaseAuthErrorMessageAr,
  getFirebaseAuthErrorCode,
} from "@/lib/firebase-auth-errors";
import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Check, Lock, Loader2, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * Prefills invite from URL: /signup?invite=SECRET or ?code=SECRET
 */
export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(() => {
    const len = password.length >= 8;
    const match = confirmPassword.length > 0 && password === confirmPassword;
    return { len, match };
  }, [password, confirmPassword]);

  useEffect(() => {
    const fromUrl =
      searchParams.get("invite")?.trim() ||
      searchParams.get("code")?.trim() ||
      "";
    if (fromUrl) setInviteCode(fromUrl);
  }, [searchParams]);

  async function registerWithToken(idToken: string) {
    const res = await fetch("/api/public/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, inviteCode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Already registered → redirect to login instead of showing a dead-end error
      if (data.error === "This account is already registered") {
        setMessage("هذا الحساب مسجّل مسبقاً. جاري توجيهك لتسجيل الدخول…");
        setTimeout(() => router.replace("/dashboard/login"), 900);
        return;
      }
      const msgMap: Record<string, string> = {
        "Invalid or missing invite code": "رمز الدعوة غير صالح أو مفقود.",
        "Owner is not initialized yet. Complete setup at /dashboard/bootstrap.":
          "لم يكتمل إعداد المنصة بعد. تواصل مع المالك.",
      };
      const raw = typeof data.error === "string" ? data.error : "فشل إنشاء الحساب";
      setError(msgMap[raw] ?? raw);
      return;
    }
    setMessage("تم إنشاء الحساب. جاري التوجيه لتسجيل الدخول…");
    setTimeout(() => {
      router.replace("/dashboard/login");
    }, 900);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("أدخل البريد الإلكتروني.");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      let idToken: string;
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        idToken = await cred.user.getIdToken();
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        if (code === "auth/email-already-in-use") {
          const cred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password,
          );
          idToken = await cred.user.getIdToken();
        } else {
          setError(firebaseAuthErrorMessageAr(code));
          return;
        }
      }
      await registerWithToken(idToken);
    } catch (err: unknown) {
      const c = getFirebaseAuthErrorCode(err);
      setError(
        c
          ? firebaseAuthErrorMessageAr(c)
          : "تعذر إنشاء الحساب أو تسجيل الدخول بهذا البريد.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      await registerWithToken(idToken);
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
            : "تم إلغاء تسجيل Google أو حدث خطأ.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell contentMaxWidthClass="max-w-md">
      <Card className="w-full border-border/80 bg-white shadow-lg shadow-black/5 dark:bg-card dark:shadow-black/20">
        <CardHeader className="space-y-3 px-6 pb-2 pt-8 text-center sm:px-8 sm:pt-10">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCircle2 className="size-7" strokeWidth={1.75} aria-hidden />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            إنشاء حساب
          </CardTitle>
          <CardDescription className="text-center text-sm leading-relaxed sm:text-base">
            أنشئ حساب دخولك الآن — ستُكمل تفاصيل موقعك في خطوة واحدة بعد الدخول.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-0"
          aria-busy={loading}
          noValidate
        >
          <CardContent className="space-y-4 px-6 pb-2 pt-4 sm:px-8">
            {/* رمز الدعوة */}
            <div className="rounded-lg border border-dashed border-border bg-background/60 px-3 py-3 text-right sm:px-4">
              <label
                htmlFor="inviteCode"
                className="block text-right text-sm font-medium leading-none text-foreground"
              >
                رمز الدعوة{" "}
                <span className="font-normal text-muted-foreground">(اختياري)</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                autoComplete="off"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className={cn(authFieldClass, "mt-2")}
                placeholder="يُملأ تلقائياً من رابط الدعوة"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                مطلوب فقط إذا فعّل المالك وضع الدعوة.
              </p>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full gap-2 border-border/80 text-base"
              size="lg"
              disabled={loading}
              onClick={() => void onGoogle()}
            >
              <GoogleIcon className="shrink-0" />
              المتابعة مع Google
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  أو بالبريد وكلمة المرور
                </span>
              </div>
            </div>

            {/* البريد */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-right text-sm font-medium leading-none text-foreground"
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
                disabled={loading}
              />
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-right text-sm font-medium leading-none text-foreground"
              >
                كلمة المرور
              </label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                disabled={loading}
                placeholder="8 أحرف على الأقل"
              />
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-right text-sm font-medium leading-none text-foreground"
              >
                تأكيد كلمة المرور
              </label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                disabled={loading}
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>

            {/* متطلبات كلمة المرور */}
            <ul
              className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground"
              aria-label="متطلبات كلمة المرور"
            >
              <li className="flex items-center gap-1.5">
                <span
                  className={
                    passwordRules.len
                      ? "text-emerald-600 dark:text-emerald-400"
                      : ""
                  }
                >
                  {passwordRules.len ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" />
                  )}
                </span>
                8 أحرف على الأقل
              </li>
              <li className="flex items-center gap-1.5">
                <span
                  className={
                    passwordRules.match
                      ? "text-emerald-600 dark:text-emerald-400"
                      : ""
                  }
                >
                  {passwordRules.match ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" />
                  )}
                </span>
                تطابق التأكيد
              </li>
            </ul>

            {error ? (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-right text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            {message ? (
              <div
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-right text-sm text-emerald-800 dark:text-emerald-300"
                role="status"
              >
                {message}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full gap-2 text-base"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  جاري الإنشاء…
                </>
              ) : (
                <>
                  <Lock className="size-4 opacity-80" aria-hidden />
                  إنشاء الحساب بالبريد
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-white px-6 py-5 sm:px-8 dark:bg-card/50">
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/dashboard/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  );
}
