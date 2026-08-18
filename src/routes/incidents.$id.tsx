import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Radio } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AgentPipeline, TierBanner } from "@/components/agent-pipeline";
import { Btn, KeyVals, Meter, Panel, Pill } from "@/components/kit";
import { incidentDetail, incidents } from "@/data/db";
import { scenarios } from "@/data/scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents/$id")({
  loader: ({ params }) => {
    const incident = incidents.find((i) => i.id === params.id);
    const scenario = scenarios[params.id];
    if (!incident || !scenario) throw notFound();
    return { incident, scenario };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Incident not found — Digital Brain" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { incident } = loaderData;
    const title = `${incident.id} · ${incident.service} — Digital Brain`;
    return {
      meta: [
        { title },
        { name: "description", content: incident.desc },
        { property: "og:title", content: title },
        { property: "og:description", content: incident.desc },
      ],
    };
  },
  component: IncidentDetail,
});

function IncidentDetail() {
  const { incident, scenario } = Route.useLoaderData();
  const detail = incidentDetail[incident.id];

  return (
    <AppShell title={incident.id}>
      {/* ---- header ---- */}
      <div className="card-surface flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill>{incident.sev}</Pill>
              <Pill
                tone={
                  scenario.tier === "Tier 1" ? "ok" : scenario.tier === "Tier 2" ? "warn" : "human"
                }
              >
                {scenario.tier}
              </Pill>
              <Pill tone="muted">{incident.bu}</Pill>
              <Pill tone="muted">{incident.region}</Pill>
              <Pill>{incident.status}</Pill>
            </div>
            <h2 className="mt-2 text-[17px] font-semibold tracking-tight">{incident.service}</h2>
            <p className="mt-1.5 max-w-[78ch] text-[13px] leading-relaxed text-muted-foreground">
              {incident.desc}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link to="/incidents">
              <Btn variant="ghost" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Incident queue
              </Btn>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Radio className="h-3.5 w-3.5" /> detected {incident.detected}
            </span>
          </div>
        </div>

        <dl className="grid gap-x-4 gap-y-3 border-t border-border pt-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {Object.entries(incident.meta).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                {k}
              </dt>
              <dd className="mt-0.5 text-[12.5px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- tier framing ---- */}
      <div className="mt-3">
        <TierBanner tier={scenario.tier} />
      </div>

      {/* ---- the flow ---- */}
      <AgentPipeline incident={incident} scenario={scenario} />

      {/* ---- standing ticket record ---- */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_1fr]">
        <Panel
          title="Correlated signals on the ticket"
          desc="Captured by the Observe stage before any agent was dispatched"
        >
          {detail ? (
            <ol className="relative space-y-2.5 border-l border-border pl-4">
              {detail.signals.map((s) => (
                <li key={s.t + s.text} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                  <div className="num text-[11px] text-muted-foreground">
                    {s.t} · {s.kind}
                  </div>
                  <div className="text-[12.5px]">{s.text}</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Closed without escalation. The signal bundle is archived against the closure record
              and replayable for 30 days — dispatch the pipeline above to watch how the agents
              worked it.
            </p>
          )}
        </Panel>

        <div className="space-y-3">
          <Panel title="Diagnosis of record">
            <KeyVals
              items={[
                ["Probable root cause", incident.cause],
                [
                  "Agent confidence",
                  <Meter
                    key="c"
                    value={incident.confidence}
                    tone={
                      incident.confidence >= 85 ? "ok" : incident.confidence >= 60 ? "warn" : "crit"
                    }
                  />,
                ],
                ["Runbook status", incident.runbook],
                ["Owner of record", incident.owner],
                ["Autonomy tier", <Pill key="t">{scenario.tier}</Pill>],
              ]}
            />
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              Anything below 60% confidence is escalated to a named human owner automatically,
              whatever tier the action would otherwise sit in.
            </p>
          </Panel>

          {detail && (
            <Panel title="Executed runbook steps" desc="State at the time this page loaded">
              <ul className="space-y-1.5">
                {detail.steps.map((s) => (
                  <li key={s.step} className="flex items-center gap-2 text-[12.5px]">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        s.state === "done"
                          ? "bg-ok"
                          : s.state === "running"
                            ? "bg-warn"
                            : "bg-border",
                      )}
                    />
                    <span className={cn(s.state === "pending" && "text-muted-foreground")}>
                      {s.step}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}
