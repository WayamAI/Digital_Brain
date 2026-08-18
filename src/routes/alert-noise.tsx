import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { DataTable, ExportBtn, Filters, Kpi, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { alertVolume, clusters, suppressionRules } from "@/data/db";

export const Route = createFileRoute("/alert-noise")({
  head: () => ({
    meta: [
      { title: "Alert Noise Reduction — Digital Brain" },
      {
        name: "description",
        content:
          "Suppression rules, correlated alert clusters and 7-day raw versus surfaced alert volume for PepsiCo Global IT monitoring.",
      },
      { property: "og:title", content: "Alert Noise Reduction — Digital Brain" },
      {
        property: "og:description",
        content: "92.5% of 4,182 daily raw alerts suppressed before reaching a human operator.",
      },
    ],
  }),
  component: AlertNoise,
});

function AlertNoise() {
  const [f, setF] = useState<Record<string, string>>({});
  const rules = suppressionRules.filter(
    (r) => !f["status"] || f["status"] === "All" || r.status === f["status"],
  );

  return (
    <AppShell
      intro="The Alert Noise Reduction Agent folds duplicates, flapping hosts and known benign patterns into clusters so operators see events, not alerts."
      actions={<ExportBtn label="Export suppression report" />}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Raw alerts (24h)" value="4,182" sub="all sources" tone="info" />
        <Kpi label="Suppressed as duplicate / noise" value="3,870" sub="92.5% of raw" tone="ok" trend="↑ 0.8%" />
        <Kpi label="Surfaced to humans" value="63" sub="63 events, 5 clusters actioned" tone="warn" />
        <Kpi label="False positive rate (30d)" value="3.1%" sub="target < 5%" tone="ok" trend="↓ 0.4%" />
      </div>

      <Panel className="mt-4" title="Alert volume — raw vs. surfaced" desc="Last 7 days">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={alertVolume} margin={{ left: -10, right: 8, top: 6 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="d" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="raw"
                name="Raw alerts"
                stroke="var(--color-chart-2)"
                fill="var(--color-info-soft)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="surfaced"
                name="Surfaced to humans"
                stroke="var(--color-ok)"
                fill="var(--color-ok-soft)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Panel title="Suppression rules active" pad={false}>
          <div className="px-4 pt-3">
            <Filters
              groups={[{ key: "status", label: "Status", options: ["Active", "Paused"] }]}
              state={f}
              onChange={(k, v) => setF((s) => ({ ...s, [k]: v }))}
            />
          </div>
          <DataTable
            rows={rules}
            dense
            cols={[
              { key: "name", header: "Rule" },
              { key: "pattern", header: "Pattern matched", cell: (r) => <code className="text-[11.5px] text-muted-foreground">{r.pattern}</code> },
              { key: "suppressed", header: "Suppressed (24h)", align: "right", cell: (r) => r.suppressed.toLocaleString() },
              { key: "tuned", header: "Last tuned" },
              { key: "status", header: "Status", cell: (r) => <Pill>{r.status}</Pill> },
            ]}
          />
        </Panel>

        <Panel title="Correlated clusters (live)" pad={false}>
          <DataTable
            rows={clusters}
            dense
            cols={[
              { key: "cluster", header: "Cluster" },
              { key: "root", header: "Root alert" },
              { key: "folded", header: "Folded in", align: "right" },
              { key: "service", header: "Affected service" },
              {
                key: "score",
                header: "Priority",
                align: "right",
                cell: (r) => <Pill tone={r.score > 90 ? "crit" : r.score > 70 ? "warn" : "ok"}>{r.score}</Pill>,
              },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
