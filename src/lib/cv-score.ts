import type { SiteJson } from "@/data/site-defaults";

export type CvScoreItem = {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  hint?: string;
};

export type CvScoreResult = {
  /** 0–100 */
  total: number;
  breakdown: CvScoreItem[];
};

export function getCvScore(site: SiteJson): CvScoreResult {
  const hasName = site.name?.trim().length >= 2;
  const hasDescription = site.description?.trim().length > 0;
  const hasSummary = site.summary?.trim().length >= 30;
  const summaryPartial = !hasSummary && site.summary?.trim().length > 0;

  const hasEmail = !!(site.contact?.email?.trim());
  const hasTel = !!(site.contact?.tel?.trim());
  const socialEntries = Object.values(site.contact?.social ?? {});
  const hasSocial = socialEntries.some(
    (s) => s.enabled !== false && s.url?.trim(),
  );

  const validSkills = (site.skills ?? []).filter((s) => s.trim().length > 0);
  const validWork = (site.work ?? []).filter(
    (w) => w.company?.trim() || w.title?.trim(),
  );
  const validEducation = (site.education ?? []).filter(
    (e) => e.school?.trim() || e.degree?.trim(),
  );
  const validProjects = (site.projects ?? []).filter(
    (p) => p.title?.trim(),
  );

  const items: CvScoreItem[] = [
    // ─── الهوية (25 نقطة) ───────────────────────────────────────────
    {
      key: "name",
      label: "الاسم والمسمى الوظيفي",
      points: (hasName ? 12 : 0) + (hasDescription ? 13 : 0),
      maxPoints: 25,
      hint: !hasName
        ? "أضف اسمك الكامل"
        : !hasDescription
          ? "أضف مسماك الوظيفي أو تخصصك"
          : undefined,
    },
    // ─── النبذة الشخصية (10 نقطة) ──────────────────────────────────
    {
      key: "summary",
      label: "النبذة الشخصية",
      points: hasSummary ? 10 : summaryPartial ? 4 : 0,
      maxPoints: 10,
      hint: !site.summary?.trim()
        ? "أضف نبذة تعريفية (30 حرف على الأقل)"
        : !hasSummary
          ? "النبذة قصيرة جداً — أضف تفاصيل أكثر"
          : undefined,
    },
    // ─── التواصل (15 نقطة) ─────────────────────────────────────────
    {
      key: "contact",
      label: "بيانات التواصل",
      points: (hasEmail ? 8 : 0) + (hasTel ? 4 : 0) + (hasSocial ? 3 : 0),
      maxPoints: 15,
      hint: !hasEmail && !hasTel
        ? "أضف بريدك الإلكتروني أو رقم هاتفك"
        : !hasEmail
          ? "أضف بريدك الإلكتروني"
          : undefined,
    },
    // ─── المهارات (10 نقطة) ────────────────────────────────────────
    {
      key: "skills",
      label: "المهارات",
      points:
        validSkills.length >= 5 ? 10 : validSkills.length > 0 ? 5 : 0,
      maxPoints: 10,
      hint:
        validSkills.length === 0
          ? "أضف مهاراتك التقنية والمهنية"
          : validSkills.length < 5
            ? "أضف المزيد من المهارات (5 على الأقل)"
            : undefined,
    },
    // ─── الخبرة العملية (20 نقطة) ──────────────────────────────────
    {
      key: "work",
      label: "الخبرة العملية",
      points:
        validWork.length >= 2 ? 20 : validWork.length === 1 ? 12 : 0,
      maxPoints: 20,
      hint:
        validWork.length === 0
          ? "أضف خبرتك العملية"
          : validWork.length < 2
            ? "أضف خبرة عملية إضافية إن وجدت"
            : undefined,
    },
    // ─── التعليم (10 نقطة) ─────────────────────────────────────────
    {
      key: "education",
      label: "التعليم",
      points: validEducation.length >= 1 ? 10 : 0,
      maxPoints: 10,
      hint:
        validEducation.length === 0
          ? "أضف مؤهلك الدراسي أو دوراتك التدريبية"
          : undefined,
    },
    // ─── المشاريع (10 نقطة) ────────────────────────────────────────
    {
      key: "projects",
      label: "المشاريع",
      points:
        validProjects.length >= 2 ? 10 : validProjects.length === 1 ? 5 : 0,
      maxPoints: 10,
      hint:
        validProjects.length === 0
          ? "أضف مشاريعك أو أعمالك السابقة"
          : validProjects.length < 2
            ? "أضف مشروعاً إضافياً لتقوية ملفك"
            : undefined,
    },
  ];

  const totalPoints = items.reduce((s, i) => s + i.points, 0);
  const maxPoints = items.reduce((s, i) => s + i.maxPoints, 0);
  const total = Math.round((totalPoints / maxPoints) * 100);

  return { total, breakdown: items };
}
