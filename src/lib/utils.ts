import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Arabic view count label. */
export function formatViewCountAr(n: number): string {
  if (n < 0) return "—";
  return `${n.toLocaleString("ar-EG")} مشاهدة`;
}

/** Arabic label for blog reading time (Arabic-Indic numerals). */
export function formatReadingTimeAr(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  const ar = m.toLocaleString("ar-EG");
  if (m === 1) return `${ar} دقيقة للقراءة`;
  if (m === 2) return `${ar} دقيقتان للقراءة`;
  if (m >= 3 && m <= 10) return `${ar} دقائق للقراءة`;
  return `${ar} دقيقة للقراءة`;
}

export function formatDate(date: string) {
  let currentDate = new Date().getTime();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date).getTime();
  let timeDifference = Math.abs(currentDate - targetDate);
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  let fullDate = new Date(date).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysAgo < 1) {
    return "Today";
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365);
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}
