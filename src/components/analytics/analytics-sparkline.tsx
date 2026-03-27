"use client";

import type { DailyActivityRow } from "@/lib/platform-analytics";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

type Props = {
  rows: DailyActivityRow[];
  dataKey: "publicPings" | "dashboardPings" | "prints" | "pdfDownloads";
  color: string;
};

export function AnalyticsSparkline({ rows, dataKey, color }: Props) {
  const data = rows.map((r) => ({
    date: r.date.slice(5),
    v: r[dataKey],
  }));
  return (
    <div className="h-10 w-full pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(v) => {
              const n = typeof v === "number" ? v : Number(v);
              return [Number.isFinite(n) ? n : 0, dataKey];
            }}
            labelFormatter={(_, p) => {
              const row = p?.[0]?.payload as { date?: string } | undefined;
              return row?.date ?? "";
            }}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
