import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Btn, KeyVals, Panel, Pill } from "@/components/kit";
import { depGraph, nodeInfo } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dependencies")({
  head: () => ({
    meta: [
      { title: "Dependency Impact Map — Digital Brain" },
      {
        name: "description",
        content:
          "Live service dependency graph with health colouring, revenue at risk per node and outage blast radius simulation.",
      },
      { property: "og:title", content: "Dependency Impact Map — Digital Brain" },
      {
        property: "og:description",
        content: "Understand upstream and downstream blast radius before you act.",
      },
    ],
  }),
  component: Dependencies,
});

const HEALTH_RING: Record<string, string> = {
  ok: "border-ok",
  warn: "border-warn",
  crit: "border-crit",
};

function Node({
  id,
  health,
  active,
  onClick,
  dim,
  center,
}: {
  id: string;
  health: string;
  active: boolean;
  onClick: () => void;
  dim: boolean;
  center?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-[168px] rounded-lg border-2 bg-card px-3 py-2 text-left text-[12px] shadow-sm transition-all hover:shadow-md",
        HEALTH_RING[health] ?? "border-border",
        active && "ring-2 ring-ring ring-offset-2",
        dim && "opacity-35",
        center && "w-[196px] bg-muted font-semibold",
      )}
    >
      <span className="block truncate">{id}</span>
      <span className="mt-0.5 block text-[10px] text-muted-foreground">
        {nodeInfo[id]?.tier} · {nodeInfo[id]?.status}
      </span>
    </button>
  );
}

function Dependencies() {
  const [sel, setSel] = useState(depGraph.center);
  const [sim, setSim] = useState<string | null>(null);
  const info = nodeInfo[sel]!;

  const blast = sim
    ? sim === depGraph.center
      ? depGraph.downstream.map((d) => d.id)
      : depGraph.upstream.some((u) => u.id === sim)
        ? [depGraph.center, ...depGraph.downstream.map((d) => d.id)]
        : []
    : [];

  const dim = (id: string) => !!sim && sim !== id && !blast.includes(id);

  return (
    <AppShell
      intro="Topology is discovered continuously from integrations — CMDB, cloud control planes and traffic traces — not maintained by hand."
      actions={
        <>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px]"
          >
            {Object.keys(nodeInfo).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <Btn
            variant={sim ? "danger" : "outline"}
            onClick={() => {
              if (sim) {
                setSim(null);
              } else {
                setSim(sel);
                toast.message("Outage simulated", { description: `Blast radius computed for ${sel}` });
              }
            }}
          >
            {sim ? "Clear simulation" : "Simulate outage"}
          </Btn>
        </>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <Panel
          title={`Dependency graph — ${depGraph.center}`}
          desc="Upstream dependencies on the left, downstream consumers on the right"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 overflow-x-auto py-2">
            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Upstream
              </div>
              {depGraph.upstream.map((u) => (
                <Node
                  key={u.id}
                  id={u.id}
                  health={u.health}
                  active={sel === u.id}
                  dim={dim(u.id)}
                  onClick={() => setSel(u.id)}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-10 bg-border" />
              <Node
                id={depGraph.center}
                health="warn"
                center
                active={sel === depGraph.center}
                dim={dim(depGraph.center)}
                onClick={() => setSel(depGraph.center)}
              />
              <div className="h-px w-10 bg-border" />
            </div>

            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Downstream
              </div>
              {depGraph.downstream.map((d) => (
                <Node
                  key={d.id}
                  id={d.id}
                  health={d.health}
                  active={sel === d.id}
                  dim={dim(d.id)}
                  onClick={() => setSel(d.id)}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-ok" /> Healthy
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warn" /> Degraded
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-crit" /> Critical
            </span>
            <span className="ml-auto">Click any node to inspect · 214 services indexed</span>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Node detail" right={<Pill>{info.status}</Pill>}>
            <h3 className="mb-2 text-[13.5px] font-semibold">{sel}</h3>
            <KeyVals
              items={[
                ["Service owner", info.owner],
                ["Criticality tier", info.tier],
                ["Business process", info.process],
                ["Revenue at risk", <span key="r" className="font-semibold text-crit">{info.revenue} of downtime</span>],
                ["Current status", <Pill key="s">{info.status}</Pill>],
              ]}
            />
          </Panel>

          <Panel title="Blast radius" desc={sim ? `Simulated outage: ${sim}` : "Run a simulation to see impact"}>
            {sim ? (
              <ul className="space-y-1.5 text-[12.5px]">
                {blast.map((b) => (
                  <li key={b} className="rounded-md border border-crit/30 bg-crit-soft px-3 py-2">
                    <div className="font-medium">{b}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {nodeInfo[b]?.process} · {nodeInfo[b]?.revenue}
                    </div>
                  </li>
                ))}
                <li className="rounded-md bg-muted px-3 py-2 text-[12px]">
                  Estimated aggregate exposure:{" "}
                  <span className="font-semibold">
                    $
                    {blast
                      .reduce((a, b) => a + parseFloat((nodeInfo[b]?.revenue ?? "0").replace(/[^0-9.]/g, "")), 0)
                      .toFixed(0)}
                    K / hour
                  </span>{" "}
                  across {blast.length} services.
                </li>
              </ul>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                Select a node and press “Simulate outage” to highlight everything that fails with it and
                the business processes affected.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
