import {
  ADMIN_SESSION_COOKIE,
  signAdminSessionToken,
} from "@/lib/admin-auth";
import { getAdminSession } from "@/lib/admin-request";
import {
  getAdminUserById,
  markOnboardingComplete,
  reopenOnboarding,
  updateAdminUserOnboardingStep,
  updateAdminUserSlug,
} from "@/lib/admin-users";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getAdminUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    slug: user.slug,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    onboardingEverCompletedOnce: user.onboardingEverCompletedOnce,
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const markDone = body.onboardingCompleted === true;
  const reopenWizard = body.onboardingCompleted === false;
  const slugStr = typeof body.slug === "string" ? body.slug : "";
  const hasSlugUpdate = slugStr.trim().length > 0;
  const onboardingStepRaw = body.onboardingStep;
  const hasOnboardingStepUpdate =
    typeof onboardingStepRaw === "number" &&
    Number.isInteger(onboardingStepRaw);

  if (markDone && reopenWizard) {
    return NextResponse.json(
      { error: "Conflicting onboarding fields" },
      { status: 400 },
    );
  }

  if (!markDone && !reopenWizard && !hasSlugUpdate && !hasOnboardingStepUpdate) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  if (markDone) {
    const result = await markOnboardingComplete(session.sub);
    if (!result.ok) {
      const message =
        result.error === "incomplete_profile"
          ? "أكمل الملف أولاً: الاسم والسطر الرئيسي، وطريقة تواصل، وأضف مهارة أو خبرة عمل أو تعليماً أو مشروعاً واحداً على الأقل (التخطّي لا يُكمل الملف للنشر)."
          : "تعذّر تحديث حالة الإعداد";
      return NextResponse.json(
        result.error === "incomplete_profile"
          ? { error: message, code: "incomplete_profile" as const }
          : { error: message },
        { status: 400 },
      );
    }
  }

  if (reopenWizard) {
    const ok = await reopenOnboarding(session.sub);
    if (!ok) {
      return NextResponse.json(
        { error: "Could not reopen onboarding" },
        { status: 400 },
      );
    }
  }

  if (hasSlugUpdate) {
    const updated = await updateAdminUserSlug(session.sub, slugStr);
    if (!updated.ok) {
      return NextResponse.json({ error: updated.error }, { status: 400 });
    }
    revalidatePath(`/${updated.slug}`, "layout");
  }

  if (hasOnboardingStepUpdate) {
    const updated = await updateAdminUserOnboardingStep(
      session.sub,
      onboardingStepRaw,
    );
    if (!updated.ok) {
      return NextResponse.json({ error: updated.error }, { status: 400 });
    }
  }

  const user = await getAdminUserById(session.sub);

  // Re-issue JWT so middleware picks up the updated onboardingCompleted status.
  if ((markDone || reopenWizard) && user) {
    try {
      const newJwt = await signAdminSessionToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      });
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, newJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch {
      // Non-fatal: JWT re-issue failed, middleware will rely on old token
    }
  }

  return NextResponse.json({
    ok: true,
    ...(hasSlugUpdate && user
      ? { slug: user.slug }
      : {}),
    ...(user
      ? {
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          onboardingEverCompletedOnce: user.onboardingEverCompletedOnce,
        }
      : {}),
  });
}
