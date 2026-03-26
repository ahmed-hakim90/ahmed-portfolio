import { CvPrintShell } from "@/components/dashboard/cv-print-shell";
import { getAdminSession } from "@/lib/admin-request";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import { getPortfolioHtmlAttrs } from "@/lib/portfolio-display";
import { redirect } from "next/navigation";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Print",
};

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cv-body",
});

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cv-heading",
});

function getSocialUrl(
  social: Record<string, { url: string }>,
  keys: string[],
): string {
  for (const key of keys) {
    const entry = social[key];
    if (entry?.url) return entry.url;
  }
  return "";
}

export default async function CvPrintPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login?next=/dashboard/cv-print");
  }
  const DATA = await getMergedSiteDataForUser(session.sub);
  const { dir, lang } = getPortfolioHtmlAttrs(DATA.publicControls.ui);
  const topProjects = DATA.projects.slice(0, 4);
  const githubUrl = getSocialUrl(DATA.contact.social, ["GitHub", "github"]);
  const linkedinUrl = getSocialUrl(DATA.contact.social, ["LinkedIn", "linkedin"]);
  const portfolioUrl = DATA.url;

  return (
    <div className={`${bodyFont.variable} ${headingFont.variable}`}>
      <CvPrintShell>
      <article
        dir={dir}
        lang={lang}
        className="mx-auto mb-8 w-full max-w-[210mm] bg-background p-6 text-[10pt] leading-relaxed shadow-sm sm:p-10 print:mb-0 print:max-w-none print:p-0 print:shadow-none"
      >
        <header className="mb-6 flex items-start justify-between gap-6 border-b border-black/20 pb-4">
          <div className="min-w-0">
            <h1 className="cv-heading text-4xl font-semibold tracking-tight">
              {DATA.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-black/80">
              {DATA.description}
            </p>
          </div>
          <div className="cv-print-avatar shrink-0">
            <Image
              src={DATA.avatarUrl}
              alt={DATA.name}
              width={92}
              height={92}
              className="rounded-full border border-black/20 object-cover"
              priority
            />
          </div>
        </header>

        <div className="mb-6 grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-8">
            <h2 className="cv-heading mb-2 text-lg font-semibold">Summary</h2>
            <p className="whitespace-pre-line text-black/85">{DATA.summary}</p>
          </section>
          <aside className="col-span-12 border-t border-black/15 pt-4 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h2 className="cv-heading mb-2 text-base font-semibold">Contact</h2>
            <div className="space-y-1 text-[9pt]">
              <p>{DATA.contact.email}</p>
              <p>{DATA.contact.tel}</p>
              {githubUrl ? <p>{githubUrl}</p> : null}
              {linkedinUrl ? <p>{linkedinUrl}</p> : null}
              {portfolioUrl ? <p>{portfolioUrl}</p> : null}
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <main className="col-span-12 space-y-4 lg:col-span-8">
            <section>
              <h2 className="cv-heading mb-2 text-lg font-semibold">
                Work Experience
              </h2>
              <div className="space-y-4">
                {DATA.work.map((item) => (
                  <div key={`${item.company}-${item.start}`} className="break-inside-avoid-page">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.company}</p>
                        <p className="italic text-black/80">{item.title}</p>
                      </div>
                      <p className="shrink-0 text-right text-[9pt] text-black/75">
                        {item.start} - {item.end || "Present"}
                      </p>
                    </div>
                    <p className="mt-1 text-[9.5pt] text-black/85">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="break-inside-avoid-page">
              <h2 className="cv-heading mb-2 text-lg font-semibold">Education</h2>
              <div className="space-y-3">
                {DATA.education.map((item) => (
                  <div key={`${item.school}-${item.start}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.school}</p>
                        <p className="italic text-black/80">{item.degree}</p>
                      </div>
                      <p className="shrink-0 text-right text-[9pt] text-black/75">
                        {item.start} - {item.end}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="break-inside-avoid-page">
              <h2 className="cv-heading mb-2 text-lg font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-black px-2.5 py-1 text-[8.5pt] font-medium text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </main>

          <aside className="col-span-12 border-t border-black/15 pt-4 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h2 className="cv-heading mb-2 text-base font-semibold">Key Projects</h2>
            <div className="space-y-3">
              {topProjects.map((project) => (
                <div key={project.title} className="break-inside-avoid-page">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{project.title}</h3>
                    <p className="shrink-0 text-right text-[8.5pt] text-black/70">
                      {"dates" in project ? (project.dates ?? "") : ""}
                    </p>
                  </div>
                  <p className="mt-1 text-[8.8pt] text-black/80">{project.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={`${project.title}-${tech}`}
                        className="rounded border border-black/20 px-1.5 py-0.5 text-[8pt]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </article>
      <style>{`
        .cv-heading {
          font-family: var(--font-cv-heading), serif;
        }
        .cv-print-page {
          font-family: var(--font-cv-body), sans-serif;
        }
        .cv-print-preset-compact article {
          font-size: 9pt;
          line-height: 1.3;
        }
        .cv-print-preset-compact .cv-heading {
          font-size: 0.95em;
        }
        .cv-print-preset-highContrast article {
          color: #000 !important;
        }
        .cv-print-preset-highContrast .cv-heading,
        .cv-print-preset-highContrast .font-semibold {
          color: #000 !important;
        }
        .cv-print-page[data-cv-include-photo="false"] .cv-print-avatar {
          display: none !important;
        }
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          html,
          body {
            background: #fff !important;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            background-image: none !important;
          }
          .cv-print-page {
            margin: 0 !important;
            padding: 0 !important;
            color: #000 !important;
            font-size: 9.5pt;
            line-height: 1.35;
          }
          .cv-print-preset-compact .cv-print-page,
          .cv-print-preset-compact article {
            font-size: 8.8pt !important;
            line-height: 1.28 !important;
          }
          .cv-print-preset-highContrast article,
          .cv-print-preset-highContrast article * {
            color: #000 !important;
            border-color: #000 !important;
          }
        }
      `}</style>
      </CvPrintShell>
    </div>
  );
}
