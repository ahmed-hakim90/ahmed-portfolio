import { getAdminSession } from "@/lib/admin-request";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProjectsDashboardClient } from "./projects-dashboard-client";

export const metadata: Metadata = {
  title: "المشاريع",
};

export default async function DashboardProjectsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login?next=/dashboard/projects");
  }
  return <ProjectsDashboardClient />;
}
