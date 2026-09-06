import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Kpi, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { agentPerf, agents } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Agent Fleet — Digital Brain" },
      {
        name: "description",
        content:
          "Status, autonomy tier, guardrails and action volume for the 15 agents running PepsiCo IT operations.",
      },
      { property: "og:title", content: "Agent Fleet — Digital Brain" },
      {
        property: "og:description",
        content: "Fleet health, weekly success rate and per agent guardrail configuration.",
      },
    ],
  }),
  component: AgentFleet,
});

const STAGES = ["Observe", "Understand", "Decide", "Act", "Learn", "Report"] as const;

function AgentFleet() {
  const total = agents.reduce((a, x) => a + x.actions, 0);

  return (
    <AppShell>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Agents deployed" value={String(agents.length)} sub="across 6 loop stages" />
        <Kpi label="Fleet health" value="14 / 15" sub="1 degraded — Compliance" tone="warn" />
        <Kpi label="Actions (24h)" value={total.toLocaleString()} sub="all tiers" tone="info" />
        <Kpi label="Success rate" value="97%" sub="7-week trend" tone="ok" trend="+6pt" />
      </div>

      <Panel
        className="mt-4"
        title="Fleet performance"
        desc="Weekly action volume and success rate"
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={agentPerf} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="d" {...axisProps} />
              <YAxis yAxisId="l" {...axisProps} />
              <YAxis yAxisId="r" orientation="right" domain={[85, 100]} unit="%" {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
              <Bar
                yAxisId="l"
                dataKey="actions"
                name="Actions"
                fill="var(--color-chart-2)"
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="success"
                name="Success %"
                stroke="var(--color-ok)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {STAGES.map((stage) => (
          <Panel
            key={stage}
            title={stage}
            desc={`${agents.filter((a) => a.stage === stage).length} agents`}
          >
            <ul className="space-y-2">
              {agents
                .filter((a) => a.stage === stage)
                .map((a) => (
                  <li key={a.slug}>
                    <Link
                      to="/agents/$slug"
                      params={{ slug: a.slug }}
                      className="block rounded-lg border border-default p-2.5 hover:bg-action"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            a.status === "Healthy" ? "bg-success" : "bg-warning",
                          )}
                        />
                        <span className="truncate text-xs font-medium">{a.name}</span>
                        <Pill className="ml-auto shrink-0">{a.tier}</Pill>
                      </div>
                      <p className="mt-1 line-clamp-2 text-2xs leading-snug text-tertiary">
                        {a.what}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-2xs text-tertiary">
                        <span className="num">{a.actions.toLocaleString()} actions</span>
                        <span>learned {a.learned}</span>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
