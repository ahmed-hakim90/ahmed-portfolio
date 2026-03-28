import {
  verifyAdminSessionToken,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/dashboard/login") ||
    pathname.startsWith("/dashboard/bootstrap")
  ) {
    return NextResponse.next();
  }
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/dashboard/users") && session.role !== "owner") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/site";
    return NextResponse.redirect(url);
  }

  // Guard: clients who haven't completed onboarding must stay in the wizard.
  // Owners are exempt (they manage the platform and never go through onboarding).
  if (
    session.role === "client" &&
    session.onboardingCompleted === false &&
    !pathname.startsWith("/dashboard/onboarding")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/onboarding";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
