import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  DataTable,
  ExportBtn,
  Kpi,
  Meter,
  Panel,
  Pill,
  axisProps,
  tooltipStyle,
} from "@/components/kit";
import { vendorTrend, vendors } from "@/data/db";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Performance — Digital Brain" },
      {
        name: "description",
        content:
          "SLA compliance, response times and risk scores for PepsiCo IT vendors and managed service partners.",
      },
      { property: "og:title", content: "Vendor Performance — Digital Brain" },
      {
        property: "og:description",
        content: "Vendor SLA scorecards, 12-month compliance trend and QBR ready evidence.",
      },
    ],
  }),
  component: VendorsPage,
});

function VendorsPage() {
  const breaching = vendors.filter((v) => v.sla < 95);
  const avg = (vendors.reduce((a, v) => a + v.sla, 0) / vendors.length).toFixed(1);

  return (
    <AppShell>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Vendors tracked" value={String(vendors.length)} sub="under active contract" />
        <Kpi label="Avg SLA compliance" value={`${avg}%`} sub="last 30 days" tone="ok" trend="+0.4" />
        <Kpi
          label="Vendors below target"
          value={String(breaching.length)}
          sub="target 95% SLA"
          tone="warn"
        />
        <Kpi label="Incidents attributed" value="240" sub="rolling 90 days" tone="info" />
      </div>

      <Panel
        className="mt-4"
        title="SLA compliance trend"
        desc="Monthly attainment for the four highest volume partners"
        right={<Pill tone="warn">Infosys declining 6 months</Pill>}
      >
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vendorTrend} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" {...axisProps} />
              <YAxis domain={[86, 100]} unit="%" {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Accenture" stroke="var(--color-chart-1)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Infosys" stroke="var(--color-chart-2)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="AWS" stroke="var(--color-chart-3)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="SAP" stroke="var(--color-chart-4)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        className="mt-4"
        title="Vendor scorecards"
        desc="Ranked by composite risk adjusted performance score"
        right={<ExportBtn label="Export QBR pack" />}
        pad={false}
      >
        <DataTable
          rows={vendors}
          rowKey={(v) => v.v}
          cols={[
            { key: "v", header: "Vendor", value: (r) => r.v },
            { key: "s", header: "Service line", value: (r) => r.s },
            {
              key: "sla",
              header: "SLA compliance",
              value: (r) => r.sla,
              cell: (r) => (
                <span className={r.sla < 95 ? "text-crit" : "text-ok"}>{r.sla}%</span>
              ),
            },
            { key: "resp", header: "Avg response", value: (r) => r.resp },
            { key: "inc", header: "Incidents (90d)", value: (r) => r.inc, align: "right" },
            {
              key: "score",
              header: "Score",
              value: (r) => r.score,
              cell: (r) => <Meter value={r.score} tone={r.score >= 90 ? "ok" : r.score >= 80 ? "warn" : "crit"} />,
            },
            {
              key: "trend",
              header: "Trend",
              value: (r) => r.trend,
              cell: (r) => (
                <Pill tone={r.trend === "↑" ? "ok" : r.trend === "↓" ? "crit" : "muted"}>
                  {r.trend === "↑" ? "Improving" : r.trend === "↓" ? "Declining" : "Flat"}
                </Pill>
              ),
            },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
