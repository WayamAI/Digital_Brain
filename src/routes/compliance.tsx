import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  DataTable,
  ExportBtn,
  Kpi,
  Panel,
  Pill,
  axisProps,
  toneFor,
  tooltipStyle,
} from "@/components/kit";
import { complianceFindings, complianceTrend } from "@/data/db";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance Operations — Digital Brain" },
      {
        name: "description",
        content:
          "Continuous policy checks, configuration drift, security exceptions and audit evidence across PepsiCo IT systems.",
      },
      { property: "og:title", content: "Compliance Operations — Digital Brain" },
      {
        property: "og:description",
        content: "Open exceptions, remediation status and a 12-month compliance posture trend.",
      },
    ],
  }),
  component: CompliancePage,
});

function CompliancePage() {
  const open = complianceFindings.filter((f) => f.status !== "Resolved");

  return (
    <AppShell>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Compliance score" value="94" sub="policy checks passing" tone="ok" trend="+1" />
        <Kpi label="Open findings" value={String(open.length)} sub="across 8 systems" tone="warn" />
        <Kpi label="Critical exceptions" value="1" sub="named owner assigned" tone="crit" />
        <Kpi label="Evidence packages" value="316" sub="immutable, audit ready" tone="info" />
      </div>

      <Panel
        className="mt-4"
        title="Compliance posture — 12 months"
        desc="Weighted score across SOX, security and privacy control families"
      >
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complianceTrend} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" {...axisProps} />
              <YAxis domain={[80, 100]} {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        className="mt-4"
        title="Policy findings & exceptions"
        desc="Detected by the Compliance Operations Agent, ranked by severity"
        right={<ExportBtn label="Export evidence pack" />}
        pad={false}
      >
        <DataTable
          rows={complianceFindings}
          rowKey={(f) => f.sys + f.pol}
          cols={[
            { key: "sys", header: "System", value: (r) => r.sys },
            { key: "pol", header: "Policy", value: (r) => r.pol },
            { key: "find", header: "Finding", value: (r) => r.find },
            {
              key: "sev",
              header: "Severity",
              value: (r) => r.sev,
              cell: (r) => <Pill tone={toneFor(r.sev)}>{r.sev}</Pill>,
            },
            { key: "det", header: "Detected", value: (r) => r.det },
            {
              key: "status",
              header: "Status",
              value: (r) => r.status,
              cell: (r) => (
                <Pill tone={r.status === "Resolved" ? "ok" : r.status === "Remediating" ? "info" : "warn"}>
                  {r.status}
                </Pill>
              ),
            },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
