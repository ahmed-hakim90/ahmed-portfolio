import { getAdminSession } from "@/lib/admin-request";
import { getAdminUserById } from "@/lib/admin-users";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login?next=/dashboard/onboarding");
  }
  const user = await getAdminUserById(session.sub);
  if (!user) {
    redirect("/dashboard/login");
  }
  if (user.onboardingCompleted) {
    redirect("/dashboard/site");
  }
  return (
    <OnboardingWizard
      initialStep={user.onboardingStep}
      prefillOnboardingInputs={user.onboardingEverCompletedOnce}
      initialSlug={user.slug}
    />
  );
}
