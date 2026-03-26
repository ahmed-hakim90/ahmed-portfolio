import { getAdminSession } from "@/lib/admin-request";
import { redirect } from "next/navigation";
import { UsersPageClient } from "./users-page-client";

export const dynamic = "force-dynamic";

export default async function DashboardUsersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login?next=/dashboard/users");
  }
  if (session.role !== "owner") {
    redirect("/dashboard/site");
  }

  return <UsersPageClient viewerId={session.sub} />;
}
