import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
