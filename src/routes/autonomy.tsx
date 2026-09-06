import { createFileRoute } from "@tanstack/react-router";
import { AppIcon } from "@/components/app-icon";
import { AppShell } from "@/components/app-shell";
import { DataTable, ExportBtn, Kpi, Meter, Panel, Pill } from "@/components/kit";
import { alwaysTier3, autonomyPolicies, ledger } from "@/data/db";

export const Route = createFileRoute("/autonomy")({
  head: () => ({
    meta: [
      { title: "Autonomy Model & Guardrails — Digital Brain" },
      {
        name: "description",
        content:
          "Tiered autonomy policy, confidence thresholds, blast radius limits and the immutable accountability ledger.",
      },
      { property: "og:title", content: "Autonomy Model & Guardrails — Digital Brain" },
      {
        property: "og:description",
        content:
          "Every autonomous action is attributable to a named human owner or a pre approved policy.",
      },
    ],
  }),
  component: AutonomyPage,
});

function AutonomyPage() {
  return (
    <AppShell>
      <div className="card-surface mb-4 flex flex-wrap items-center gap-3 px-4 py-3">
        <AppIcon name="compliance" size="xl" className="text-success" />
        <div>
          <div className="text-sm font-semibold">Accountability transferred to agents: 0%</div>
          <p className="text-2xs text-tertiary">
            Agents execute; humans remain accountable. Nothing runs without an owner of record.
          </p>
        </div>
        <div className="ml-auto">
          <ExportBtn label="Export audit ledger" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Tier 1 — agent only" value="68%" sub="of resolved volume" tone="ok" />
        <Kpi
          label="Tier 2 — agent + approval"
          value="27%"
          sub="median approval 4 min"
          tone="warn"
        />
        <Kpi label="Tier 3 — human led" value="5%" sub="~25% of team hours" tone="human" />
        <Kpi
          label="Guardrail blocks (30d)"
          value="19"
          sub="actions stopped pre execution"
          tone="info"
        />
      </div>

      <Panel
        className="mt-4"
        title="Autonomy policy matrix"
        desc="Confidence threshold and blast radius limit required before an agent may act"
        pad={false}
      >
        <DataTable
          rows={autonomyPolicies}
          rowKey={(p) => p.action}
          cols={[
            { key: "action", header: "Action", value: (r) => r.action },
            {
              key: "tier",
              header: "Tier",
              value: (r) => r.tier,
              cell: (r) => (
                <Pill tone={r.tier === "Tier 1" ? "ok" : r.tier === "Tier 2" ? "warn" : "human"}>
                  {r.tier}
                </Pill>
              ),
            },
            {
              key: "threshold",
              header: "Confidence threshold",
              value: (r) => r.threshold,
              cell: (r) => (
                <Meter value={r.threshold} tone={r.threshold === 100 ? "crit" : "info"} />
              ),
            },
            { key: "blast", header: "Blast radius limit", value: (r) => r.blast },
          ]}
        />
      </Panel>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Always Tier 3" desc="Never delegated, regardless of confidence">
          <ul className="space-y-2">
            {alwaysTier3.map((t) => (
              <li
                key={t}
                className="flex items-start gap-2 rounded-lg border border-default px-2.5 py-2 text-xs"
              >
                <AppIcon name="lock" size="sm" className="mt-0.5 shrink-0 text-error" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Accountability ledger"
          desc="Immutable record of every agent action today"
          right={<Pill tone="info">{ledger.length} entries</Pill>}
          pad={false}
        >
          <DataTable
            rows={ledger}
            rowKey={(l) => l.t}
            cols={[
              { key: "t", header: "Time", value: (r) => r.t },
              { key: "action", header: "Action", value: (r) => r.action },
              { key: "agent", header: "Agent", value: (r) => r.agent },
              {
                key: "tier",
                header: "Tier",
                value: (r) => r.tier,
                cell: (r) => <Pill tone={r.tier === "Tier 1" ? "ok" : "warn"}>{r.tier}</Pill>,
              },
              { key: "owner", header: "Owner of record", value: (r) => r.owner },
              {
                key: "outcome",
                header: "Outcome",
                value: (r) => r.outcome,
                cell: (r) => (
                  <Pill tone={r.outcome === "In progress" ? "info" : "ok"}>{r.outcome}</Pill>
                ),
              },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
