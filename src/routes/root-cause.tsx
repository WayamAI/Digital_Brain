import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileDown, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, Meter, Panel, Pill, axisProps, tooltipStyle, useRunAction } from "@/components/kit";
import { incidentDetail, incidents } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/root-cause")({
  head: () => ({
    meta: [
      { title: "Root Cause Investigation — Digital Brain" },
      {
        name: "description",
        content:
          "Correlated event timeline, log, metric and trace evidence with an agent conclusion and one click post incident report generation.",
      },
      { property: "og:title", content: "Root Cause Investigation — Digital Brain" },
      {
        property: "og:description",
        content: "Investigate incidents with correlated deployments, changes, alerts and traces.",
      },
    ],
  }),
  component: RootCause,
});

const latency = [
  { t: "13:50", ms: 460 },
  { t: "13:55", ms: 470 },
  { t: "14:00", ms: 482 },
  { t: "14:05", ms: 3120 },
  { t: "14:07", ms: 11400 },
  { t: "14:10", ms: 9800 },
  { t: "14:15", ms: 6400 },
  { t: "14:20", ms: 2100 },
];

const traceRows = [
  ["POST /api/order.create", 11400, 100],
  ["auth.validate", 42, 4],
  ["pricing.resolve", 118, 10],
  ["db.acquireConnection", 10940, 96],
  ["db.insertOrder", 210, 12],
  ["mq.publish OrderCreated", 76, 7],
];

function RootCause() {
  const [id, setId] = useState("INC-48213");
  const { running, run } = useRunAction(2400);
  const inc = incidents.find((i) => i.id === id)!;
  const detail = incidentDetail[id];

  return (
    <AppShell
      intro="The Root Cause Investigation Agent lines up deployments, config changes, alerts and tickets on one timeline, then ranks causal hypotheses with evidence."
      actions={
        <>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px]"
          >
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} · {i.service}
              </option>
            ))}
          </select>
          <Btn variant="outline" onClick={() => run("Re analysis complete — conclusion unchanged")}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Re analyze
          </Btn>
        </>
      }
    >
      <Panel
        title={`Event timeline — ${inc.id} investigation window`}
        desc="13:40–14:25 UTC · deployments, config changes, alerts and tickets"
      >
        <div className="relative mt-2 h-[86px] rounded-md border border-border bg-muted/40">
          <div className="absolute inset-x-4 top-1/2 h-px bg-border" />
          {(detail?.signals ?? []).map((s, i) => (
            <div
              key={s.t + s.text}
              className="absolute -translate-x-1/2"
              style={{ left: `${8 + i * 21}%`, top: i % 2 ? "56%" : "8%" }}
            >
              <div className="w-[150px] rounded-md border border-border bg-card px-2 py-1.5 shadow-sm">
                <div className="text-[10px] text-muted-foreground">
                  {s.t} · {s.kind}
                </div>
                <div className="line-clamp-2 text-[11px] leading-tight">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_1fr]">
        <Panel title="Logs excerpt" desc="sap-om-api · error stream">
          <pre className="max-h-[200px] overflow-auto rounded-md bg-ink px-3 py-2.5 text-[11px] leading-relaxed text-ink-foreground">
{`14:06:02  ERROR HikariPool-1 - Connection is not available,
          request timed out after 30000ms (x2411)
14:06:04  WARN  pool stats: total=180 active=180 idle=0 waiting=612
14:06:09  ERROR OrderCreateHandler - could not acquire connection
14:06:11  INFO  retry scheduled (attempt 2/3) order=OM-9931742
14:06:44  ERROR circuit breaker absent on read path (v4.19.2)`}
          </pre>
        </Panel>

        <Panel title="Metric spike" desc="p95 order create latency (ms)">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latency} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v} ms`, "p95"]} />
                <Line type="monotone" dataKey="ms" stroke="var(--color-crit)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Trace waterfall" desc="Slowest sampled request">
          <ul className="space-y-1.5">
            {traceRows.map(([n, ms, pct]) => (
              <li key={String(n)} className="text-[11.5px]">
                <div className="flex justify-between">
                  <span>{n}</span>
                  <span className="num text-muted-foreground">{Number(ms).toLocaleString()} ms</span>
                </div>
                <div className="mt-0.5 h-1.5 rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", Number(pct) > 80 ? "bg-crit" : "bg-accent")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Agent conclusion" right={<Pill tone={inc.confidence >= 85 ? "ok" : "warn"}>{inc.confidence}% confidence</Pill>}>
          <h3 className="text-[14px] font-semibold">{inc.cause}</h3>
          <div className="mt-2">
            <Meter value={inc.confidence} tone={inc.confidence >= 85 ? "ok" : "warn"} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {(detail?.reasoning ?? [
              "Signature matched an existing runbook and resolved without escalation.",
              "No change events in the window; cause attributed to scheduled platform behaviour.",
            ]).map((r) => (
              <li key={r} className="rounded-md bg-muted px-3 py-2 text-[12.5px] leading-snug">
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => run("Post incident report generated — PIR-48213.pdf")}>
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              Generate Post Incident Report
            </Btn>
            <Btn variant="outline" onClick={() => run("Linked to PRB-1042")}>
              Link to problem record
            </Btn>
          </div>
        </Panel>

        <Panel title="Recent changes in window" desc="Correlated from ServiceNow + pipelines">
          <ul className="space-y-2 text-[12.5px]">
            {[
              ["CHG-3388", "Deploy sap-om-api v4.19.2", "14:02 UTC", "diff · 3 files, +61 −12"],
              ["CFG-2201", "HANA statement cache raised to 12k", "11:20 UTC", "diff · 1 parameter"],
              ["CHG-3386", "Cert rotation api-gw-latam", "13:40 UTC", "diff · 2 certs"],
            ].map(([id2, d, t, diff]) => (
              <li key={id2} className="rounded-md border border-border px-3 py-2">
                <div className="flex gap-2">
                  <span className="font-medium">{id2}</span>
                  <span className="text-muted-foreground">{d}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{t}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-accent">{diff}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
