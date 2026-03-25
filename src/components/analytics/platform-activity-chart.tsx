import type { DailyActivityRow } from "@/lib/platform-analytics";

type Props = { dailyActivity: DailyActivityRow[] };

export function PlatformActivityChart({ dailyActivity }: Props) {
  const rows = dailyActivity;
  const maxPing = Math.max(
    1,
    ...rows.map((r) => r.publicPings + r.dashboardPings),
  );
  const maxPrint = Math.max(1, ...rows.map((r) => r.prints));

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          نشاط الزيارات (آخر 14 يوماً UTC)
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          العمود: عام (رمادي) فوقه لوحة التحكم (أساسي). الارتفاع = مجموع النبضات
          اليومية.
        </p>
        <div
          className="mt-4 flex h-36 items-end gap-1 sm:gap-1.5 motion-reduce:transition-none"
          role="img"
          aria-label="مخطط نبضات الزيارة اليومية"
        >
          {rows.map((row) => {
            const total = row.publicPings + row.dashboardPings;
            const pct = Math.max(4, (total / maxPing) * 100);
            const title = `${row.date}: عام ${row.publicPings}، لوحة ${row.dashboardPings}`;
            return (
              <div
                key={row.date}
                className="flex min-w-0 flex-1 flex-col items-stretch justify-end"
              >
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-md border border-border/60 bg-muted/30 motion-reduce:transition-none"
                  style={{ height: `${pct}%` }}
                  title={title}
                >
                  <div
                    className="min-h-0 w-full bg-primary/80 motion-reduce:transition-none"
                    style={{
                      flexGrow: Math.max(0.01, row.dashboardPings),
                    }}
                  />
                  <div
                    className="min-h-0 w-full bg-muted-foreground/35 motion-reduce:transition-none"
                    style={{
                      flexGrow: Math.max(0.01, row.publicPings),
                    }}
                  />
                </div>
                <span className="mt-1 truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">
                  {row.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-muted-foreground/35" aria-hidden />
            زيارات عامة
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary/80" aria-hidden />
            لوحة التحكم
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">
          نقرات الطباعة (يومياً)
        </h3>
        <div
          className="mt-4 flex h-20 items-end gap-1 sm:gap-1.5"
          role="img"
          aria-label="مخطط نقرات الطباعة اليومية"
        >
          {rows.map((row) => {
            const pct = Math.max(3, (row.prints / maxPrint) * 100);
            return (
              <div
                key={`p-${row.date}`}
                className="flex min-w-0 flex-1 flex-col items-stretch justify-end"
              >
                <div
                  className="w-full rounded-sm bg-amber-600/75 motion-reduce:transition-none dark:bg-amber-500/70"
                  style={{ height: `${pct}%` }}
                  title={`${row.date}: ${row.prints} طباعة`}
                />
                <span className="mt-1 truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">
                  {row.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
