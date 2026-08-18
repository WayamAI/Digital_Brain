import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Info, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, Kpi, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { agents, kpis, loopStages, needsYou, resolved24h, slaRisks, workSplit } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Control Tower — Digital Brain IT Operations" },
      {
        name: "description",
        content:
          "Live agentic IT operations control tower: incidents, autonomy tiers, alert noise, SLA risk and agent fleet health across PepsiCo Global IT.",
      },
      { property: "og:title", content: "Control Tower — Digital Brain IT Operations" },
      {
        property: "og:description",
        content:
          "Real time view of incidents, approvals, MTTR and the Detect to Learn agent loop for PepsiCo Global IT.",
      },
    ],
  }),
  component: ControlTower,
});

function ControlTower() {
  const [approved, setApproved] = useState(0);
  const openApprovals = Math.max(0, 2 - approved);

  const cards = kpis.map((k) =>
    k.label.startsWith("Awaiting")
      ? {
          ...k,
          value: String(openApprovals),
          sub: openApprovals ? "oldest waiting 4 min" : "queue clear",
          tone: openApprovals ? ("warn" as const) : ("ok" as const),
        }
      : k,
  );

  return (
    <AppShell>
      <div className="card-surface mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Pill tone="ok">All systems nominal</Pill>
        <span className="text-[12px] text-muted-foreground">
          PepsiCo Global IT Operations · Follow the sun L2 · APAC shift active
        </span>
        <span className="text-[12px] text-muted-foreground">
          Estate: 214 services · 12,400 cloud resources · 4 business units
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/incidents">
            <Btn variant="outline" size="sm">
              Open Incident Queue
            </Btn>
          </Link>
          <Link to="/approvals">
            <Btn variant="outline" size="sm">
              Review Approval Queue
            </Btn>
          </Link>
          <Link to="/executive-briefing">
            <Btn variant="outline" size="sm">
              View Executive Briefing
            </Btn>
          </Link>
          <Link to="/incidents/$id" params={{ id: "INC-48213" }}>
            <Btn size="sm">
              <Zap className="h-3.5 w-3.5" />
              Dispatch agents on INC-48213
            </Btn>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Incidents resolved — last 24 hours"
          desc="Two hour buckets, split by autonomy tier"
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolved24h} margin={{ left: -18, right: 6, top: 4 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tier1" name="Tier 1 — agent only" stackId="a" fill="var(--color-tier1)" />
                <Bar dataKey="tier2" name="Tier 2 — agent + approval" stackId="a" fill="var(--color-tier2)" />
                <Bar dataKey="tier3" name="Tier 3 — human led" stackId="a" fill="var(--color-tier3)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Where the work goes" desc="Share of resolved volume by autonomy tier">
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workSplit} layout="vertical" margin={{ left: 4, right: 24 }}>
                <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" domain={[0, 80]} {...axisProps} unit="%" />
                <YAxis type="category" dataKey="tier" width={130} {...axisProps} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} formatter={(v) => [`${v}%`, "Volume"]} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                  {workSplit.map((w, i) => (
                    <Cell key={w.tier} fill={`var(--color-tier${i + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            Tier 3 is 5% of volume but ~25% of team hours — the work worth protecting.
          </p>
        </Panel>
      </div>

      <Panel
        className="mt-4"
        title="The Loop — live pipeline"
        desc="Every stage consumes the output of the stage before it"
        right={<Pill tone="info">Cycle time 27 min</Pill>}
      >
        <div className="flex flex-wrap items-stretch gap-2">
          {loopStages.map((s, i) => (
            <div key={s.stage} className="flex flex-1 items-center gap-2">
              <div className="min-w-[130px] flex-1 rounded-md border border-border bg-muted/50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.stage}
                </div>
                <div className="num mt-1 text-xl font-bold tabular-nums">
                  <span className="inline-block animate-pulse">{s.count.toLocaleString()}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{s.note}</div>
              </div>
              {i < loopStages.length - 1 && (
                <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground xl:block" />
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Panel title="Needs you" desc="Human attention queue, oldest first">
          <ul className="space-y-2.5">
            {needsYou.map((n) => (
              <li key={n.item} className="rounded-md border border-border p-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{n.item}</div>
                    <div className="text-[11px] text-muted-foreground">{n.agent}</div>
                  </div>
                  <span className="ml-auto shrink-0 text-[11px] text-warn-ink">{n.age}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{n.why}</p>
                {n.incident ? (
                  <Link to="/incidents/$id" params={{ id: n.incident }}>
                    <Btn variant="outline" size="sm" className="mt-2">
                      <Zap className="h-3 w-3" />
                      Dispatch agents
                    </Btn>
                  </Link>
                ) : (
                  <Link to={n.to}>
                    <Btn variant="outline" size="sm" className="mt-2">
                      Review
                    </Btn>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Top 5 SLA breach risks" desc="Ranked by minutes to breach">
          <ul className="space-y-2.5">
            {slaRisks.map((s) => (
              <li key={s.service} className="rounded-md border border-border p-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{s.service}</div>
                    <div className="text-[11px] text-muted-foreground">{s.impact}</div>
                  </div>
                  <Pill className="ml-auto shrink-0">{s.sev}</Pill>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        s.minutes < 60 ? "bg-crit" : s.minutes < 150 ? "bg-warn" : "bg-ok",
                      )}
                      style={{ width: `${100 - Math.min(95, (s.minutes / 240) * 100)}%` }}
                    />
                  </div>
                  <span className="num text-[11px] text-muted-foreground">{s.minutes} min</span>
                  <Link to="/root-cause">
                    <Btn variant="ghost" size="sm">
                      Investigate
                    </Btn>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Agent fleet health"
          desc="15 agents grouped by pipeline stage"
          right={<Pill tone="ok">14 healthy · 1 degraded</Pill>}
        >
          <div className="space-y-3">
            {(["Observe", "Understand", "Decide", "Act", "Learn", "Report"] as const).map((stage) => (
              <div key={stage}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {stage}
                </div>
                <div className="space-y-1">
                  {agents
                    .filter((a) => a.stage === stage)
                    .map((a) => (
                      <Link
                        key={a.slug}
                        to="/agents/$slug"
                        params={{ slug: a.slug }}
                        className="flex items-center gap-2 rounded px-1.5 py-1 text-[12px] hover:bg-muted"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            a.status === "Healthy" ? "bg-ok" : "bg-warn",
                          )}
                        />
                        <span className="truncate">{a.name}</span>
                        <span className="num ml-auto text-[11px] text-muted-foreground">
                          {a.actions.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="card-surface mt-4 flex flex-wrap items-center gap-3 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-ok" />
        <div>
          <div className="text-[13px] font-semibold">Accountability transferred to agents: 0%</div>
          <p className="text-[11.5px] text-muted-foreground">
            Every autonomous action is attributable to a named human owner or a pre approved policy.
            Nothing executes without an owner of record in the audit ledger.
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> 7 actions logged today
        </span>
        <Link to="/autonomy">
          <Btn variant="outline" size="sm">
            Open accountability ledger
          </Btn>
        </Link>
        <Btn size="sm" onClick={() => setApproved((a) => a + 1)} className="hidden">
          sync
        </Btn>
      </div>
    </AppShell>
  );
}
