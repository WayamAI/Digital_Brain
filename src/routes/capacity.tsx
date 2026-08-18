import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { DataTable, ExportBtn, Filters, Kpi, Meter, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { capacityRecs, capacityTrend } from "@/data/db";

export const Route = createFileRoute("/capacity")({
  head: () => ({
    meta: [
      { title: "Capacity Planning — Digital Brain" },
      {
        name: "description",
        content:
          "CPU, memory, storage and cloud spend trends per platform with forecast breach dates and scaling recommendations.",
      },
      { property: "og:title", content: "Capacity Planning — Digital Brain" },
      {
        property: "og:description",
        content: "Forecast capacity breaches weeks ahead across SAP, Snowflake, AWS and Azure.",
      },
    ],
  }),
  component: Capacity,
});

function Capacity() {
  const [f, setF] = useState<Record<string, string>>({});
  const platform = f["platform"] ?? "All";
  const rows = capacityRecs.filter(
    (r) => platform === "All" || r.r.toLowerCase().includes(platform.toLowerCase()),
  );

  return (
    <AppShell
      intro="Forecasts run nightly against 90 days of utilisation plus the promotional calendar, so scaling happens before the surge rather than during it."
      actions={<ExportBtn label="Export capacity plan" />}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Platforms tracked" value="5" sub="SAP · Snowflake · Salesforce · AWS · Azure" tone="info" />
        <Kpi label="Resources near threshold" value="3" sub="≥ 75% utilisation" tone="warn" />
        <Kpi label="Earliest forecast breach" value="4 weeks" sub="SAP HANA memory — Order Mgmt" tone="crit" />
        <Kpi label="Cloud spend run rate" value="$2.40M" sub="per month, all platforms" tone="info" trend="↑ 1.6%" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Panel title="Utilisation trend — last 90 days" desc="Weighted across major platforms">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={capacityTrend} margin={{ left: -14, right: 8, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="w" {...axisProps} />
                <YAxis domain={[40, 100]} unit="%" {...axisProps} />
                <Tooltip {...tooltipStyle} formatter={(v: number | string) => [`${Number(v).toFixed(1)}%`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="cpu" name="CPU" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mem" name="Memory" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="storage" name="Storage" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Cloud spend trend" desc="US$ millions per month, all platforms">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={capacityTrend} margin={{ left: -14, right: 8, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="w" {...axisProps} />
                <YAxis domain={[1.8, 2.6]} {...axisProps} />
                <Tooltip {...tooltipStyle} formatter={(v: number | string) => [`$${Number(v).toFixed(2)}M`, "Spend"]} />
                <Area type="monotone" dataKey="spend" stroke="var(--color-chart-1)" fill="var(--color-info-soft)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4" title="Capacity recommendations" pad={false}>
        <div className="px-4 pt-3">
          <Filters
            groups={[{ key: "platform", label: "Platform", options: ["AWS", "Azure", "Snowflake", "SAP", "Salesforce"] }]}
            state={f}
            onChange={(k, v) => setF((s) => ({ ...s, [k]: v }))}
            right={<span className="text-[11px] text-muted-foreground">{rows.length} resources</span>}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.r}
          cols={[
            { key: "r", header: "Resource", cell: (r) => <span className="font-medium">{r.r}</span> },
            {
              key: "util",
              header: "Current utilisation",
              cell: (r) => <Meter value={r.util} tone={r.util >= 80 ? "crit" : r.util >= 70 ? "warn" : "ok"} />,
            },
            { key: "growth", header: "Growth trend (90d)" },
            {
              key: "breach",
              header: "Forecast breach",
              cell: (r) => (r.breach === "—" ? <span className="text-muted-foreground">—</span> : <Pill tone={r.breach.startsWith("4") ? "crit" : "warn"}>{r.breach}</Pill>),
            },
            { key: "rec", header: "Recommendation", cell: (r) => <span className="text-muted-foreground">{r.rec}</span> },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
