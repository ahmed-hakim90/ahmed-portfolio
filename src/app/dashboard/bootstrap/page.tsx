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
          setError("Could not check bootstrap status");
          return;
        }
        setNeedsBootstrap(!!data.needsBootstrap);
      } catch {
        setNeedsBootstrap(false);
        setError("Could not check bootstrap status");
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
      setError(typeof data.error === "string" ? data.error : "Bootstrap failed");
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
      setError("Passwords do not match");
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
          setError("Email already in use — sign in with the correct password or use Google.");
        }
      } else {
        setError("Could not create Firebase account. Check email/password.");
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
      setError("Google sign-in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!needsBootstrap) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Already set up</CardTitle>
            <CardDescription>
              An owner account already exists. Sign in at the dashboard login page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/login">Go to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            First-time owner setup
          </CardTitle>
          <CardDescription>
            Create your Firebase account (email or Google), then authorize with the
            bootstrap secret or deploy credentials from your environment (
            <code className="text-xs">ADMIN_BOOTSTRAP_SECRET</code> or{" "}
            <code className="text-xs">ADMIN_BOOTSTRAP_USERNAME</code> /{" "}
            <code className="text-xs">ADMIN_BOOTSTRAP_PASSWORD</code>).
          </CardDescription>
        </CardHeader>
        <form onSubmit={onCreateOwnerEmail}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="bs"
                className="text-sm font-medium leading-none"
              >
                Bootstrap secret (if set in env)
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
                  Deploy username (legacy)
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
                  Deploy password (legacy)
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
              If <code className="text-xs">ADMIN_BOOTSTRAP_SECRET</code> is set (16+
              chars), only the secret field is used. Otherwise use deploy username +
              password matching your env.
            </p>
            <div className="space-y-2">
              <label htmlFor="em" className="text-sm font-medium leading-none">
                Email
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
                Password
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
                Confirm password
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
              {loading ? "Working…" : "Create owner (email)"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
              onClick={() => void onGoogle()}
            >
              Continue with Google
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard/login">Back to login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
