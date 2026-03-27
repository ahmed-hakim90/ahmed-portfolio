import { CvPrintLayout } from "@/components/dashboard/cv-print-layout";
import { CvPrintShell } from "@/components/dashboard/cv-print-shell";
import { getPortfolioHtmlAttrs } from "@/lib/portfolio-display";
import type { MergedSiteData } from "@/lib/site-data";
import Image from "next/image";

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

export function CvPrintDocument({ data: DATA }: { data: MergedSiteData }) {
  const { dir, lang } = getPortfolioHtmlAttrs(DATA.publicControls.ui);
  const topProjects = DATA.projects.slice(0, 4);
  const githubUrl = getSocialUrl(DATA.contact.social, ["GitHub", "github"]);
  const linkedinUrl = getSocialUrl(DATA.contact.social, [
    "LinkedIn",
    "linkedin",
  ]);
  const portfolioUrl = DATA.url;

  const sectionClass =
    "border-b border-black/20 pb-6 mb-6 last:mb-0 last:border-b-0 last:pb-0";

  return (
    <CvPrintShell>
      <CvPrintLayout>
        <article
          dir={dir}
          lang={lang}
          className="cv-article mx-auto mb-8 w-full max-w-[210mm] bg-background p-6 text-[10pt] leading-relaxed shadow-sm sm:p-10 print:mb-0 print:max-w-none print:p-0 print:shadow-none"
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

        <section className={`cv-section ${sectionClass}`}>
          <h2 className="cv-heading cv-section-heading mb-2 text-left text-lg font-semibold">
            Summary
          </h2>
          <p className="whitespace-pre-line text-left text-pretty text-black/85">
            {DATA.summary}
          </p>
        </section>

        <section className={`cv-section ${sectionClass}`}>
          <h2 className="cv-heading cv-section-heading mb-2 text-left text-lg font-semibold">
            Contact
          </h2>
          <div className="space-y-1 text-left text-[9pt]">
            <p>{DATA.contact.email}</p>
            <p>{DATA.contact.tel}</p>
            {githubUrl ? <p>{githubUrl}</p> : null}
            {linkedinUrl ? <p>{linkedinUrl}</p> : null}
            {portfolioUrl ? <p>{portfolioUrl}</p> : null}
          </div>
        </section>

        <section className={`cv-section ${sectionClass}`}>
          <h2 className="cv-heading cv-section-heading mb-3 text-left text-lg font-semibold">
            Work Experience
          </h2>
          <div className="space-y-4">
            {DATA.work.map((item) => (
              <div
                key={`${item.company}-${item.start}`}
                className="cv-job-item"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.company}</p>
                    <p className="italic text-black/80">{item.title}</p>
                  </div>
                  <p className="shrink-0 text-right text-[9pt] text-black/75">
                    {item.start} - {item.end || "Present"}
                  </p>
                </div>
                <p className="mt-1 text-left text-[9.5pt] text-black/85">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={`cv-section ${sectionClass}`}>
          <h2 className="cv-heading cv-section-heading mb-3 text-left text-lg font-semibold">
            Education
          </h2>
          <div className="space-y-3">
            {DATA.education.map((item) => (
              <div key={`${item.school}-${item.start}`} className="cv-edu-item">
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

        <section className={`cv-section ${sectionClass}`}>
          <div className="cv-skills-block">
            <h2 className="cv-heading cv-section-heading mb-3 text-left text-lg font-semibold">
              Skills
            </h2>
            <ul className="cv-skill-chips list-none p-0">
              {DATA.skills.map((skill) => (
                <li key={skill} className="cv-skill-chip-item">
                  <span className="cv-skill-chip inline-block rounded-full bg-black px-2.5 py-1 text-[8.5pt] font-medium leading-normal text-white">
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`cv-section ${sectionClass}`}>
          <h2 className="cv-heading cv-section-heading mb-3 text-left text-lg font-semibold">
            Key Projects
          </h2>
          <div className="space-y-3">
            {topProjects.map((project) => (
              <div key={project.title} className="cv-project-item">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-left font-semibold leading-snug">
                    {project.title}
                  </h3>
                  <p className="shrink-0 text-right text-[8.5pt] text-black/70">
                    {"dates" in project ? (project.dates ?? "") : ""}
                  </p>
                </div>
                <p className="cv-project-desc mt-1 text-left text-[8.8pt] text-black/80">
                  {project.description}
                </p>
                <ul className="cv-project-tags mt-1 list-none p-0">
                  {project.technologies.map((tech) => (
                    <li
                      key={`${project.title}-${tech}`}
                      className="cv-project-tag-item"
                    >
                      <span className="cv-project-tag inline-block rounded border border-black/20 px-1.5 py-0.5 text-[8pt] leading-normal">
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        </article>
      </CvPrintLayout>
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
        /* Print-safe chip lists: flex+gap is unreliable in print; inline-block + margins keeps row/column spacing */
        .cv-skill-chips,
        .cv-project-tags {
          display: block;
        }
        .cv-skill-chip-item,
        .cv-project-tag-item {
          display: inline-block;
          margin: 0 6px 10px 0;
          vertical-align: top;
          line-height: normal;
        }
        .cv-skill-chip,
        .cv-project-tag {
          break-inside: avoid;
          page-break-inside: avoid;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
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
          .cv-skill-chip-item,
          .cv-project-tag-item {
            margin: 0 5px 7px 0 !important;
          }
          article h2 {
            break-after: avoid;
            page-break-after: avoid;
          }
          .cv-job-item,
          .cv-edu-item,
          .cv-project-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .cv-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .cv-skills-block {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .cv-sidebar-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          article p {
            orphans: 3;
            widows: 3;
          }
          .cv-project-item .cv-project-desc {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </CvPrintShell>
  );
}
