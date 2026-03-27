import { FolioLandingClient } from "@/components/landing/folio-landing-client";
import "@/components/landing/folio-landing.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description: "هذا الرابط لم يعد متاحاً على HAKIMO CV.",
};

export default function NotFound() {
  return (
    <>
      <FolioLandingClient />
      <div
        id="folio-landing-root"
        className="folioLanding print:hidden"
        dir="rtl"
        lang="ar"
      >
        <div className="folioCursor" id="folio-cursor" aria-hidden />
        <div className="folioCursorRing" id="folio-cursor-ring" aria-hidden />

        <nav className="folioNav" id="folio-nav">
          <Link href="/" className="folioLogo" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="folioLogoDot" />
            HAKIMO CV
          </Link>
          <div className="folioNavLinks">
            <a href="/#features">المميزات</a>
            <a href="/#how">كيف يعمل</a>
          </div>
          <div className="folioNavRight">
            <Link className="folioNbtn folioNbtnGhost" href="/dashboard/login">
              تسجيل دخول
            </Link>
            <Link className="folioNbtn folioNbtnSolid" href="/signup">
              ابدأ مجاناً
            </Link>
          </div>
        </nav>

        <section style={{ background: "var(--folio-w)" }} className="min-h-[60vh]">
          <div className="folioHero">
            <div className="folioHeroText max-w-[640px]">
              <div className="folioHeroPill">
                <i />
                ٤٠٤ — رابط غير متاح
              </div>
              <h1 className="folioHeroTitle">
                هذا الرابط
                <br />
                <em>لم يعد موجوداً</em>
              </h1>
              <p className="folioHeroBody">
                ربما تم تغيير المعرف أو حذف الصفحة. إن أردت إنشاء صفحة ويب خاصة بك، يمكنك
                البدء من الصفحة الرئيسية أو إنشاء حساب جديد.
              </p>
              <div className="folioHeroBtns">
                <Link className="folioHbtn folioHbtnPrimary" href="/">
                  العودة للرئيسية ←
                </Link>
                <Link className="folioHbtn folioHbtnOutline" href="/signup">
                  إنشاء صفحة جديدة
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
