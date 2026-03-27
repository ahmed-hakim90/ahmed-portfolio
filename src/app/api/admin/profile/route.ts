import { getAdminSession } from "@/lib/admin-request";
import {
  getAdminUserById,
  markOnboardingComplete,
  updateAdminUserOnboardingStep,
  updateAdminUserSlug,
} from "@/lib/admin-users";
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
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const markDone = body.onboardingCompleted === true;
  const slugStr = typeof body.slug === "string" ? body.slug : "";
  const hasSlugUpdate = slugStr.trim().length > 0;
  const onboardingStepRaw = body.onboardingStep;
  const hasOnboardingStepUpdate =
    typeof onboardingStepRaw === "number" &&
    Number.isInteger(onboardingStepRaw);

  if (!markDone && !hasSlugUpdate && !hasOnboardingStepUpdate) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  if (markDone) {
    const ok = await markOnboardingComplete(session.sub);
    if (!ok) {
      return NextResponse.json(
        { error: "Could not update onboarding status" },
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
  return NextResponse.json({
    ok: true,
    ...(hasSlugUpdate && user
      ? { slug: user.slug }
      : {}),
    onboardingCompleted: user?.onboardingCompleted ?? true,
    ...(user ? { onboardingStep: user.onboardingStep } : {}),
  });
}
