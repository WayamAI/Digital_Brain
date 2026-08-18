import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Btn, KeyVals, Kpi, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { agentPerf, agents, ledger } from "@/data/db";

export const Route = createFileRoute("/agents/$slug")({
  loader: ({ params }) => {
    const agent = agents.find((a) => a.slug === params.slug);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Agent not found — Digital Brain" }, { name: "robots", content: "noindex" }],
      };
    }
    const { agent } = loaderData;
    return {
      meta: [
        { title: `${agent.name} — Digital Brain` },
        { name: "description", content: agent.what },
        { property: "og:title", content: `${agent.name} — Digital Brain` },
        { property: "og:description", content: agent.what },
      ],
    };
  },
  component: AgentDetail,
});

function AgentDetail() {
  const { agent } = Route.useLoaderData();
  const recent = ledger.filter((l) => agent.name.startsWith(l.agent)).slice(0, 5);

  return (
    <AppShell>
      <div className="card-surface mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link to="/agents">
          <Btn variant="ghost" size="sm">
            ← Agent fleet
          </Btn>
        </Link>
        <h1 className="text-[15px] font-semibold tracking-tight">{agent.name}</h1>
        <Pill tone={agent.status === "Healthy" ? "ok" : "warn"}>{agent.status}</Pill>
        <Pill tone="info">{agent.stage}</Pill>
        <Pill>{agent.tier}</Pill>
        <span className="ml-auto text-[11px] text-muted-foreground">Last learned {agent.learned}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Actions (24h)" value={agent.actions.toLocaleString()} sub="executed or proposed" />
        <Kpi label="Autonomy tier" value={agent.tier} sub={agent.tier === "Tier 1" ? "agent only" : "approval required"} tone="info" />
        <Kpi label="Success rate" value="97%" sub="7-week rolling" tone="ok" />
        <Kpi label="Guardrails active" value={String(agent.guardrails.length)} sub="hard constraints" tone="warn" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="What this agent does" desc="Scope, inputs and outputs">
          <p className="text-[13px] leading-relaxed">{agent.what}</p>
          <div className="mt-4">
            <KeyVals
              items={[
                ["Loop stage", agent.stage],
                ["Autonomy tier", agent.tier],
                ["Owner of record", "R. Alvarez — IT Ops Manager"],
                ["Escalation path", "L2 on call → Ops Manager → CIO"],
                ["Model refresh", agent.learned],
              ]}
            />
          </div>
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Guardrails
            </div>
            <ul className="space-y-1.5">
              {agent.guardrails.map((g) => (
                <li key={g} className="rounded-md border border-border px-2.5 py-1.5 text-[12px]">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Weekly action volume" desc="Last 7 weeks">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerf} margin={{ left: -18, right: 8, top: 4 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="d" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Bar dataKey="actions" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Recent ledger entries" desc="Attributable actions with a named owner">
            {recent.length ? (
              <ul className="space-y-2">
                {recent.map((l) => (
                  <li key={l.t} className="rounded-md border border-border p-2.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="num text-muted-foreground">{l.t}</span>
                      <Pill className="ml-auto">{l.tier}</Pill>
                    </div>
                    <div className="mt-1 text-[12.5px]">{l.action}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {l.owner} · {l.outcome}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                No ledger entries in the last 24 hours for this agent.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
