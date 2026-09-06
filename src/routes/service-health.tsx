import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  DataTable,
  ExportBtn,
  Meter,
  Panel,
  Pill,
  axisProps,
  tooltipStyle,
} from "@/components/kit";
import { BUS, healthTrend, services } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/service-health")({
  head: () => ({
    meta: [
      { title: "Service Health Monitor — Digital Brain" },
      {
        name: "description",
        content:
          "Health scores, 30-day trend and degradation predictions for every monitored service across PepsiCo business units.",
      },
      { property: "og:title", content: "Service Health Monitor — Digital Brain" },
      {
        property: "og:description",
        content: "Per service health scoring with predictive degradation windows and owners.",
      },
    ],
  }),
  component: ServiceHealth,
});

const dot = (h: number) => (h >= 90 ? "bg-success" : h >= 75 ? "bg-warning" : "bg-error");

function ServiceHealth() {
  const [sel, setSel] = useState(services[0]!.name);
  const svc = services.find((s) => s.name === sel)!;
  const trend =
    svc.health < 70
      ? healthTrend
      : healthTrend.map((h) => ({
          ...h,
          score: Math.min(99, (h.score ?? 90) + (svc.health - 61)),
        }));

  return (
    <AppShell
      intro="The Service Health Agent scores every service continuously from availability, latency, error budget burn and change activity — then forecasts where it lands next."
      actions={<ExportBtn label="Export health summary" />}
    >
      <div className="grid gap-3 xl:grid-cols-[300px_1fr]">
        <Panel title="Monitored services" desc="Grouped by business unit" pad={false}>
          <div className="max-h-[520px] overflow-y-auto py-1">
            {BUS.map((bu) => (
              <div key={bu} className="px-2 py-1">
                <div className="px-2 py-1 text-3xs font-semibold uppercase tracking-wide text-tertiary">
                  {bu}
                </div>
                {services
                  .filter((s) => s.bu === bu)
                  .map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSel(s.name)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-action",
                        sel === s.name && "bg-info-bg font-medium",
                      )}
                    >
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", dot(s.health))} />
                      <span className="truncate">{s.name}</span>
                      <span className="num ml-auto text-2xs text-tertiary">{s.health}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel
            title={svc.name}
            desc={`${svc.bu} · ${svc.tier} · owner ${svc.owner}`}
            right={
              <Pill tone={svc.health >= 90 ? "ok" : svc.health >= 75 ? "warn" : "crit"}>
                Health {svc.health}
              </Pill>
            }
          >
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: -12, right: 8, top: 6 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="d" {...axisProps} interval={4} />
                  <YAxis domain={[50, 100]} {...axisProps} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, "Health score"]} />
                  <ReferenceLine y={80} stroke="var(--color-warn)" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="Degradation prediction" right={<Pill tone="warn">62% probability</Pill>}>
              <p className="text-sm leading-relaxed">
                62% probability of a latency breach in the next 4 hours based on the current trend,
                the open connection-pool defect and the NA afternoon order surge.
              </p>
              <div className="mt-3 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning-content">
                Recommended preventive action: complete the v4.19.1 rollback verification, then
                pre-warm two additional application nodes before 16:00 UTC.
              </div>
              <div className="mt-3">
                <Meter value={62} tone="warn" />
              </div>
            </Panel>

            <Panel title="Executive health summary" desc="Auto generated 14:12 UTC">
              <p className="text-sm leading-relaxed">
                {svc.name} is currently at {svc.health}/100, {svc.trend} over seven days.{" "}
                {svc.health < 75
                  ? "The service is the primary driver of today's open critical incident; order capture continues but at degraded latency, with an estimated $310K/hour of order to cash throughput exposed if it degrades further. Permanent fix PRB-1042 is in progress with engineering."
                  : "No customer visible impact in the last 24 hours; error budget consumption is within plan and no elevated risk changes are scheduled this week."}
              </p>
            </Panel>
          </div>
        </div>
      </div>

      <Panel
        className="mt-3"
        title="Service health summary"
        desc="All monitored services"
        pad={false}
      >
        <DataTable
          rows={services}
          onRow={(r) => setSel(r.name)}
          rowKey={(r) => r.name}
          activeKey={sel}
          cols={[
            { key: "name", header: "Service" },
            { key: "bu", header: "Business unit" },
            {
              key: "health",
              header: "Current health",
              cell: (r) => (
                <Meter
                  value={r.health}
                  tone={r.health >= 90 ? "ok" : r.health >= 75 ? "warn" : "crit"}
                />
              ),
            },
            { key: "trend", header: "7-day trend" },
            { key: "risk", header: "Predicted risk (24h)", cell: (r) => <Pill>{r.risk}</Pill> },
            { key: "tier", header: "Criticality" },
            { key: "owner", header: "Owner" },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
