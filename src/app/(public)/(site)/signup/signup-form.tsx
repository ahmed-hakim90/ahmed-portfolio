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
import { buildPublicPortfolioUrl } from "@/lib/site-public-base";
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
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  UserCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SlugAvailDetail = "invalid" | "available" | "taken" | null;

function signupErrorAr(msg: string): string {
  const map: Record<string, string> = {
    "Invalid display name": "الاسم الظاهر مطلوب (حرفان على الأقل).",
    "Invalid phone number": "رقم الهاتف غير صالح (5 أرقام على الأقل).",
    "Invalid slug": "مسار الموقع غير صالح (3–48 حرفاً، إنجليزي وأرقام وشرطة).",
    "Slug is already taken": "هذا المسار محجوز. اختر اسماً آخر.",
    "Valid email is required": "البريد الإلكتروني مطلوب.",
    "This account is already registered": "هذا الحساب مسجّل مسبقاً.",
  };
  return map[msg] ?? msg;
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-border/80 bg-muted/20 p-4 shadow-sm sm:p-5"
      aria-labelledby={`signup-section-${step}`}
    >
      <div className="mb-4 flex flex-wrap items-start gap-3 text-right">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            id={`signup-section-${step}`}
            className="text-sm font-semibold leading-tight text-foreground sm:text-base"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-right text-sm font-medium leading-none text-foreground"
    >
      {children}
      {optional ? (
        <span className="me-1 font-normal text-muted-foreground">
          {" "}
          (اختياري)
        </span>
      ) : null}
    </label>
  );
}

/**
 * Prefills invite from URL: /signup?invite=SECRET or ?code=SECRET
 */
export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");
  const [slugCheck, setSlugCheck] = useState<{
    checking: boolean;
    normalized: string;
    detail: SlugAvailDetail;
  }>({ checking: false, normalized: "", detail: null });
  const slugCheckSeq = useRef(0);
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(() => {
    const len = password.length >= 8;
    const match =
      confirmPassword.length > 0 && password === confirmPassword;
    return { len, match };
  }, [password, confirmPassword]);

  const portfolioPreviewUrl = useMemo(() => {
    if (slugCheck.detail !== "available" || !slugCheck.normalized) {
      return "";
    }
    return buildPublicPortfolioUrl(slugCheck.normalized);
  }, [slugCheck.detail, slugCheck.normalized]);

  const profileReady =
    phone.trim().length >= 5 && slugCheck.detail === "available";

  useEffect(() => {
    const fromUrl =
      searchParams.get("invite")?.trim() ||
      searchParams.get("code")?.trim() ||
      "";
    if (fromUrl) {
      setInviteCode(fromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const raw = slug.trim();
    if (raw.length === 0) {
      slugCheckSeq.current += 1;
      setSlugCheck({ checking: false, normalized: "", detail: null });
      return;
    }
    const seq = ++slugCheckSeq.current;
    setSlugCheck((s) => ({ ...s, checking: true }));
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/public/slug-availability?slug=${encodeURIComponent(raw)}`,
            { cache: "no-store" },
          );
          const data = (await res.json().catch(() => ({}))) as {
            normalized?: string;
            detail?: string;
          };
          if (seq !== slugCheckSeq.current) return;
          const detail = data.detail;
          const normalized =
            typeof data.normalized === "string" ? data.normalized : "";
          if (
            detail === "invalid" ||
            detail === "available" ||
            detail === "taken"
          ) {
            setSlugCheck({
              checking: false,
              normalized,
              detail,
            });
          } else {
            setSlugCheck({ checking: false, normalized: "", detail: null });
          }
        } catch {
          if (seq !== slugCheckSeq.current) return;
          setSlugCheck({ checking: false, normalized: "", detail: null });
        }
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [slug]);

  async function registerWithToken(idToken: string) {
    const res = await fetch("/api/public/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        inviteCode,
        displayName: displayName.trim(),
        phone: phone.trim(),
        slug: slug.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const raw =
        typeof data.error === "string" ? data.error : "فشل إنشاء الحساب";
      setError(signupErrorAr(raw));
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

    if (displayName.trim().length < 2) {
      setError("أدخل الاسم الظاهر (حرفان على الأقل).");
      return;
    }
    if (phone.trim().length < 5) {
      setError("أدخل رقم هاتف صالحاً.");
      return;
    }
    if (slugCheck.detail !== "available") {
      setMessage(null);
      setError("تأكد أن مسار موقعك العام (slug) متاح قبل المتابعة.");
      return;
    }

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
    if (phone.trim().length < 5) {
      setError("أدخل رقم الهاتف أولاً (الخطوة 1).");
      return;
    }
    if (slugCheck.detail !== "available") {
      setError("اختر مساراً متاحاً لموقعك العام (الخطوة 1).");
      return;
    }
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

  const slugIcon = slugCheck.checking ? (
    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
  ) : slugCheck.detail === "available" ? (
    <CheckCircle2
      className="size-4 text-emerald-600 dark:text-emerald-400"
      aria-hidden
    />
  ) : slugCheck.detail === "taken" ? (
    <XCircle className="size-4 text-destructive" aria-hidden />
  ) : slugCheck.detail === "invalid" ? (
    <AlertCircle className="size-4 text-amber-600 dark:text-amber-500" aria-hidden />
  ) : null;

  return (
    <AuthShell contentMaxWidthClass="max-w-xl">
      <Card className="w-full border-border/80 bg-white shadow-lg shadow-black/5 dark:bg-card dark:shadow-black/20">
        <CardHeader className="space-y-3 px-5 pb-2 pt-8 text-center sm:px-8 sm:pt-10">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCircle2 className="size-7" strokeWidth={1.75} aria-hidden />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            إنشاء حساب
          </CardTitle>
          <CardDescription className="text-center text-sm leading-relaxed sm:text-base">
            ثلاث خطوات سريعة: بيانات ملفك العام، ثم اختر Google أو البريد لربط
            حساب الدخول.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-0"
          aria-busy={loading}
          noValidate
        >
          <CardContent className="space-y-5 px-5 pb-2 pt-2 sm:px-8">
            {/* Invite — optional, compact */}
            <div className="rounded-lg border border-dashed border-border bg-background/60 px-3 py-3 text-right sm:px-4">
              <FieldLabel htmlFor="inviteCode" optional>
                رمز الدعوة
              </FieldLabel>
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
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                مطلوب فقط إذا فعّل المالك وضع الدعوة. الرابط{" "}
                <span className="rounded bg-muted px-1 font-mono text-[0.65rem]">
                  /signup?invite=…
                </span>
              </p>
            </div>

            <Section
              step={1}
              title="تفاصيل الموقع الخاص بيك"
              description="يظهر الاسم والهاتف في بورتفوليوك؛ المسار يكون رابط صفحتك العامة."
            >
              <div className="space-y-2">
                <FieldLabel htmlFor="displayName" optional>
اسمك                 </FieldLabel>
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={authFieldClass}
                  placeholder="مثال: أحمد محمد"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  عند التسجيل بـ Google يمكن ترك الحقل فارغاً إن وُجد اسم على حساب
                  Google.
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={authFieldClass}
                  placeholder="+201234567890"
                  disabled={loading}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="publicSlug">مسار صفحتك (slug)</FieldLabel>
                <div className="relative" dir="ltr">
                  <span
                    className="pointer-events-none absolute start-3 top-1/2 z-[1] -translate-y-1/2 text-xs text-muted-foreground"
                    aria-hidden
                  >
                    /
                  </span>
                  <input
                    id="publicSlug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={cn(
                      authFieldClass,
                      "font-mono ps-7 pe-10",
                      slugCheck.detail === "available" &&
                        "border-emerald-500/50 focus-visible:ring-emerald-500/30",
                      (slugCheck.detail === "taken" ||
                        slugCheck.detail === "invalid") &&
                        "border-destructive/40",
                    )}
                    placeholder="my-name"
                    spellCheck={false}
                    disabled={loading}
                  />
                  <span className="absolute end-2 top-1/2 -translate-y-1/2">
                    {slugIcon}
                  </span>
                </div>
                <div
                  className="min-h-[1.25rem] text-xs text-muted-foreground"
                  dir="rtl"
                  aria-live="polite"
                >
                  {slugCheck.checking ? (
                    <span className="text-muted-foreground">
                      جاري التحقق من توفر المسار…
                    </span>
                  ) : slug.trim().length === 0 ? (
                    <span>أحرف إنجليزية صغيرة وأرقام وشرطة — من 3 إلى 48 حرفاً.</span>
                  ) : slugCheck.detail === "invalid" ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      الصيغة غير صالحة.
                    </span>
                  ) : slugCheck.detail === "taken" ? (
                    <span className="text-destructive">هذا المسار محجوز.</span>
                  ) : slugCheck.detail === "available" ? (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      المسار متاح.
                    </span>
                  ) : (
                    <span>تعذر التحقق. أعد المحاولة.</span>
                  )}
                </div>
                {portfolioPreviewUrl ? (
                  <div className="rounded-md border border-border/80 bg-background px-3 py-2 text-left">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      معاينة الرابط
                    </p>
                    <p className="truncate font-mono text-xs text-foreground sm:text-sm">
                      {portfolioPreviewUrl}
                    </p>
                  </div>
                ) : null}
              </div>

              {!profileReady && (phone.length > 0 || slug.length > 0) ? (
                <p className="text-xs text-muted-foreground">
                  أكمل الهاتف ومساراً متاحاً للمتابعة إلى الخطوة 2.
                </p>
              ) : null}
            </Section>

            <Section
              step={2}
              title="ربط حساب الدخول"
              description="أسرع طريق: Google. أو أنشئ حساباً بالبريد وكلمة مرور أدناه."
            >
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full gap-2 border-border/80 text-base"
                  size="lg"
                  disabled={
                    loading ||
                    slugCheck.checking ||
                    slugCheck.detail !== "available" ||
                    phone.trim().length < 5
                  }
                  onClick={() => void onGoogle()}
                >
                  <GoogleIcon className="shrink-0" />
                  المتابعة مع Google
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  يستخدم بريد Google واسم الحساب عند الحاجة.
                </p>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-muted/20 px-3 text-muted-foreground">
                    أو بالبريد وكلمة المرور
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
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

              <div className="space-y-2">
                <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
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

              <div className="space-y-2">
                <FieldLabel htmlFor="confirmPassword">تأكيد كلمة المرور</FieldLabel>
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
                disabled={
                  loading ||
                  slugCheck.checking ||
                  slugCheck.detail !== "available"
                }
              >
                {loading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin shrink-0"
                      aria-hidden
                    />
                    جاري الإنشاء…
                  </>
                ) : (
                  <>
                    <Lock className="size-4 opacity-80" aria-hidden />
                    إنشاء الحساب بالبريد
                  </>
                )}
              </Button>
            </Section>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-white px-5 py-5 sm:px-8 dark:bg-card/50">
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
