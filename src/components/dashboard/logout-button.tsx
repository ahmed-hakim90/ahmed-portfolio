"use client";

import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch {
      /* ignore if Firebase client is not configured */
    }
    router.replace("/dashboard/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={logout}
      className={cn("w-full justify-start gap-2", className)}
    >
      تسجيل الخروج
    </Button>
  );
}
