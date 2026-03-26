"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exchangeIdTokenForAdminSession } from "@/lib/admin-session-client";
import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardBootstrapPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [bootstrapUsername, setBootstrapUsername] = useState("");
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/bootstrap");
        const data = (await res.json()) as { needsBootstrap?: boolean };
        if (!res.ok) {
          setNeedsBootstrap(false);
          setError("تعذر التحقق من حالة الإعداد");
          return;
        }
        setNeedsBootstrap(!!data.needsBootstrap);
      } catch {
        setNeedsBootstrap(false);
        setError("تعذر التحقق من حالة الإعداد");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function runBootstrapAfterFirebaseUser(idToken: string) {
    const res = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        bootstrapSecret: bootstrapSecret.trim() || undefined,
        bootstrapUsername: bootstrapUsername.trim() || undefined,
        bootstrapPassword: bootstrapPassword || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        typeof data.error === "string" ? data.error : "فشل إعداد صاحب المنصة",
      );
      return;
    }
    const session = await exchangeIdTokenForAdminSession(idToken);
    if (!session.ok) {
      setError(session.error);
      return;
    }
    router.replace("/dashboard/site");
    router.refresh();
  }

  async function onCreateOwnerEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const idToken = await cred.user.getIdToken();
      await runBootstrapAfterFirebaseUser(idToken);
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code === "auth/email-already-in-use") {
        try {
          const auth = getFirebaseAuth();
          const cred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password,
          );
          const idToken = await cred.user.getIdToken();
          await runBootstrapAfterFirebaseUser(idToken);
        } catch {
          setError(
            "البريد مستخدم مسبقاً — سجّل الدخول بكلمة المرور الصحيحة أو استخدم Google.",
          );
        }
      } else {
        setError("تعذر إنشاء حساب Firebase. تحقق من البريد وكلمة المرور.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      await runBootstrapAfterFirebaseUser(idToken);
    } catch {
      setError("تم إلغاء Google أو فشل الاتصال.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main
        className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10"
        dir="rtl"
      >
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      </main>
    );
  }

  if (!needsBootstrap) {
    return (
      <main
        className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10"
        dir="rtl"
      >
        <Card>
          <CardHeader>
            <CardTitle>المنصة جاهزة</CardTitle>
            <CardDescription>
              يوجد بالفعل صاحب منصة. سجّل الدخول من صفحة لوحة التحكم.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/login">الذهاب لتسجيل الدخول</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10"
      dir="rtl"
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            إنشاء صاحب المنصة
          </CardTitle>
          <CardDescription>
            أنشئ حساب Firebase (بريد أو Google)، ثم أدخل سر الإعداد أو بيانات النشر
            من البيئة (
            <code className="text-xs">ADMIN_BOOTSTRAP_SECRET</code> أو{" "}
            <code className="text-xs">ADMIN_BOOTSTRAP_USERNAME</code> /{" "}
            <code className="text-xs">ADMIN_BOOTSTRAP_PASSWORD</code>
            ). بعد النجاح يُربط حسابك بدور{" "}
            <span className="font-mono text-xs">owner</span> ويُصدر JWT للوحة
            التحكم.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onCreateOwnerEmail}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="bs"
                className="text-sm font-medium leading-none"
              >
                سر الإعداد (إن وُجد في البيئة)
              </label>
              <input
                id="bs"
                type="password"
                autoComplete="off"
                value={bootstrapSecret}
                onChange={(e) => setBootstrapSecret(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="ADMIN_BOOTSTRAP_SECRET"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="bu"
                  className="text-sm font-medium leading-none"
                >
                  اسم مستخدم النشر (قديم)
                </label>
                <input
                  id="bu"
                  type="text"
                  autoComplete="off"
                  value={bootstrapUsername}
                  onChange={(e) => setBootstrapUsername(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="bp"
                  className="text-sm font-medium leading-none"
                >
                  كلمة مرور النشر (قديم)
                </label>
                <input
                  id="bp"
                  type="password"
                  autoComplete="off"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              إذا وُجد <code className="text-xs">ADMIN_BOOTSTRAP_SECRET</code> (16
              حرفاً فأكثر) يُستخدم حقل السر فقط. وإلا استخدم اسم المستخدم وكلمة مرور
              النشر كما في البيئة.
            </p>
            <div className="space-y-2">
              <label htmlFor="em" className="text-sm font-medium leading-none">
                البريد الإلكتروني
              </label>
              <input
                id="em"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pw" className="text-sm font-medium leading-none">
                كلمة المرور
              </label>
              <input
                id="pw"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pw2" className="text-sm font-medium leading-none">
                تأكيد كلمة المرور
              </label>
              <input
                id="pw2"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
                minLength={8}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري العمل…" : "إنشاء صاحب المنصة (بريد)"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
              onClick={() => void onGoogle()}
            >
              المتابعة مع Google
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard/login">العودة لتسجيل الدخول</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
