"use client";

import { useEffect, type ReactNode } from "react";

/** A4 height at 96dpi; used with @page margin to estimate printable area. */
const A4_HEIGHT_PX = 1122;
/** 15mm top + bottom margin (matches @page margin in cv-print-document). */
const MARGIN_PX = 57;

/**
 * Runs in the browser before print to force page breaks when a block would
 * straddle a page. Does not run for server-side PDF (e.g. Puppeteer); use
 * print CSS + matching viewport/margins there.
 */
export function CvPrintLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    function checkBreaks() {
      document.querySelectorAll("[data-force-break]").forEach((el) => {
        (el as HTMLElement).style.breakBefore = "";
        el.removeAttribute("data-force-break");
      });

      const article = document.querySelector(".cv-article");
      if (!article) return;

      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const pageHeight = A4_HEIGHT_PX - MARGIN_PX * 2;

      const sections = article.querySelectorAll(
        ".cv-job-item, .cv-edu-item, .cv-project-item, .cv-section, .cv-skills-block",
      );

      sections.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const elTop =
          htmlEl.getBoundingClientRect().top + window.scrollY - articleTop;
        const positionInPage = elTop - Math.floor(elTop / pageHeight) * pageHeight;
        const spaceLeft = pageHeight - positionInPage;

        if (
          htmlEl.offsetHeight > spaceLeft &&
          positionInPage > 60
        ) {
          htmlEl.style.breakBefore = "page";
          htmlEl.setAttribute("data-force-break", "true");
        }
      });
    }

    if (document.fonts) {
      void document.fonts.ready.then(checkBreaks);
    } else {
      setTimeout(checkBreaks, 500);
    }

    window.addEventListener("resize", checkBreaks);
    return () => window.removeEventListener("resize", checkBreaks);
  }, []);

  return <>{children}</>;
}
