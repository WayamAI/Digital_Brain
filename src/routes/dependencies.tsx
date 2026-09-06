import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

/* Health reads as a dot, not as a 2px ring around the whole node. A grid of
   glowing outlines is exactly the neon look the design system rules out — the
   dot carries the same information at a fraction of the visual weight. */
const HEALTH_DOT: Record<string, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  crit: "bg-error",
};

type GraphNodeProps = {
  id: string;
  health: string;
  active: boolean;
  onClick: () => void;
  dim: boolean;
  inBlast?: boolean | undefined;
  center?: boolean | undefined;
  nodeRef: (el: HTMLButtonElement | null) => void;
};

function GraphNode({ id, health, active, onClick, dim, inBlast, center, nodeRef }: GraphNodeProps) {
  const info = nodeInfo[id];
  return (
    <button
      ref={nodeRef}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "transition-ui group relative flex w-full items-center gap-2.5 rounded-xl border px-3 text-left outline-none",
        // Every node is the same height, so the two columns line up on a grid
        // instead of drifting against each other.
        center ? "h-[58px] bg-raised-2" : "h-[52px] bg-raised",
        "focus-visible:ring-2 focus-visible:ring-ring/40",
        active ? "border-active shadow-raised" : "border-default hover:border-active",
        !active && "hover:bg-raised-2",
        inBlast && "border-error-stroke bg-error-bg",
        dim && "opacity-30",
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", HEALTH_DOT[health] ?? "bg-neutral")} />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-primary",
            center ? "type-heading-md" : "type-label-md",
          )}
        >
          {id}
        </span>
        <span className="mt-0.5 block truncate type-caption text-tertiary">
          {info?.tier} · {info?.status}
        </span>
      </span>
    </button>
  );
}

type Edge = { key: string; d: string; state: "idle" | "active" | "blast" };

/**
 * Edges are measured, not guessed. Node heights differ with the column counts
 * (4 upstream vs 5 downstream), so the only honest way to draw the connectors
 * is from the real laid-out boxes — recomputed whenever anything resizes.
 */
function useGraphEdges(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  nodes: React.RefObject<Record<string, HTMLButtonElement | null>>,
  center: string,
  upstream: { id: string }[],
  downstream: { id: string }[],
  stateOf: (id: string) => Edge["state"],
) {
  const [edges, setEdges] = useState<Edge[]>([]);

  const compute = useCallback(() => {
    const wrap = wrapRef.current;
    const hub = nodes.current[center];
    if (!wrap || !hub) return;
    const w = wrap.getBoundingClientRect();
    const h = hub.getBoundingClientRect();
    const hubLeft = { x: h.left - w.left, y: h.top - w.top + h.height / 2 };
    const hubRight = { x: h.right - w.left, y: hubLeft.y };

    const next: Edge[] = [];
    const link = (id: string, from: { x: number; y: number }, to: { x: number; y: number }) => {
      const mx = (from.x + to.x) / 2;
      next.push({
        key: id,
        d: `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`,
        state: stateOf(id),
      });
    };

    for (const u of upstream) {
      const el = nodes.current[u.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      link(u.id, { x: r.right - w.left, y: r.top - w.top + r.height / 2 }, hubLeft);
    }
    for (const d of downstream) {
      const el = nodes.current[d.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      link(d.id, hubRight, { x: r.left - w.left, y: r.top - w.top + r.height / 2 });
    }
    // Only commit when the geometry actually moved — a ResizeObserver that
    // writes identical state on every callback is an infinite loop.
    setEdges((prev) =>
      prev.length === next.length &&
      prev.every(
        (e, i) => e.key === next[i]?.key && e.d === next[i]?.d && e.state === next[i]?.state,
      )
        ? prev
        : next,
    );
  }, [wrapRef, nodes, center, upstream, downstream, stateOf]);

  useLayoutEffect(() => {
    compute();
  }, [compute]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    for (const el of Object.values(nodes.current)) if (el) ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [compute, wrapRef, nodes]);

  return edges;
}

function Dependencies() {
  const [sel, setSel] = useState(depGraph.center);
  const [sim, setSim] = useState<string | null>(null);
  const info = nodeInfo[sel]!;
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const setNodeRef = (id: string) => (el: HTMLButtonElement | null) => {
    nodeEls.current[id] = el;
  };

  // Memoised: this array feeds edgeState -> compute -> setEdges. A fresh array
  // every render would make the measurement effect re-run forever.
  const blast = useMemo(
    () =>
      sim
        ? sim === depGraph.center
          ? depGraph.downstream.map((d) => d.id)
          : depGraph.upstream.some((u) => u.id === sim)
            ? [depGraph.center, ...depGraph.downstream.map((d) => d.id)]
            : []
        : [],
    [sim],
  );

  const dim = (id: string) => !!sim && sim !== id && !blast.includes(id);

  const edgeState = useCallback(
    (id: string): Edge["state"] => {
      if (sim && blast.includes(id)) return "blast";
      if (id === sel) return "active";
      return "idle";
    },
    [sim, blast, sel],
  );

  const edges = useGraphEdges(
    wrapRef,
    nodeEls,
    depGraph.center,
    depGraph.upstream,
    depGraph.downstream,
    edgeState,
  );

  const EDGE_STROKE: Record<Edge["state"], string> = {
    idle: "var(--stroke-default)",
    active: "var(--stroke-active)",
    blast: "var(--feedback-error-icon)",
  };

  return (
    <AppShell
      intro="Topology is discovered continuously from integrations — CMDB, cloud control planes and traffic traces — not maintained by hand."
      actions={
        <>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="rounded-lg border border-default bg-raised px-2.5 py-1.5 text-xs"
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
                toast.message("Outage simulated", {
                  description: `Blast radius computed for ${sel}`,
                });
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
          <div className="overflow-x-auto">
            <div
              ref={wrapRef}
              className="relative grid min-w-[760px] grid-cols-[minmax(0,1fr)_minmax(210px,250px)_minmax(0,1fr)] grid-rows-[auto_1fr] items-center gap-x-8 py-1"
            >
              {/* Connectors sit behind the nodes and are measured from the real
                  laid-out boxes, so they stay correct at any width. */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {edges.map((e) => (
                  <path
                    key={e.key}
                    d={e.d}
                    fill="none"
                    stroke={EDGE_STROKE[e.state]}
                    strokeWidth={e.state === "idle" ? 1 : 1.5}
                    className="transition-[stroke] duration-200"
                  />
                ))}
              </svg>

              <span className="col-start-1 row-start-1 pb-2 type-label-sm text-quaternary">
                Upstream
              </span>
              <span className="col-start-3 row-start-1 pb-2 type-label-sm text-quaternary">
                Downstream
              </span>

              <div className="col-start-1 row-start-2 flex flex-col gap-2.5">
                {depGraph.upstream.map((u) => (
                  <GraphNode
                    key={u.id}
                    id={u.id}
                    health={u.health}
                    active={sel === u.id}
                    dim={dim(u.id)}
                    inBlast={!!sim && blast.includes(u.id)}
                    nodeRef={setNodeRef(u.id)}
                    onClick={() => setSel(u.id)}
                  />
                ))}
              </div>

              {/* The hub sits in the middle column and centres itself against
                  both stacks, however many nodes each one holds. */}
              <div className="col-start-2 row-start-2 self-center">
                <GraphNode
                  id={depGraph.center}
                  health="warn"
                  center
                  active={sel === depGraph.center}
                  dim={dim(depGraph.center)}
                  inBlast={!!sim && blast.includes(depGraph.center)}
                  nodeRef={setNodeRef(depGraph.center)}
                  onClick={() => setSel(depGraph.center)}
                />
              </div>

              <div className="col-start-3 row-start-2 flex flex-col gap-2.5">
                {depGraph.downstream.map((d) => (
                  <GraphNode
                    key={d.id}
                    id={d.id}
                    health={d.health}
                    active={sel === d.id}
                    dim={dim(d.id)}
                    inBlast={!!sim && blast.includes(d.id)}
                    nodeRef={setNodeRef(d.id)}
                    onClick={() => setSel(d.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-muted pt-3 type-caption text-tertiary">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> Healthy
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warning" /> Degraded
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-error" /> Critical
            </span>
            <span className="ml-auto">Click any node to inspect · 214 services indexed</span>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Node detail" right={<Pill>{info.status}</Pill>}>
            <h3 className="mb-2 text-sm font-semibold">{sel}</h3>
            <KeyVals
              items={[
                ["Service owner", info.owner],
                ["Criticality tier", info.tier],
                ["Business process", info.process],
                [
                  "Revenue at risk",
                  <span key="r" className="font-semibold text-error">
                    {info.revenue} of downtime
                  </span>,
                ],
                ["Current status", <Pill key="s">{info.status}</Pill>],
              ]}
            />
          </Panel>

          <Panel
            title="Blast radius"
            desc={sim ? `Simulated outage: ${sim}` : "Run a simulation to see impact"}
          >
            {sim ? (
              <ul className="space-y-1.5 text-xs">
                {blast.map((b) => (
                  <li key={b} className="rounded-lg border border-error/30 bg-error-bg px-3 py-2">
                    <div className="font-medium">{b}</div>
                    <div className="text-2xs text-tertiary">
                      {nodeInfo[b]?.process} · {nodeInfo[b]?.revenue}
                    </div>
                  </li>
                ))}
                <li className="rounded-lg bg-action px-3 py-2 text-xs">
                  Estimated aggregate exposure:{" "}
                  <span className="font-semibold">
                    $
                    {blast
                      .reduce(
                        (a, b) =>
                          a + parseFloat((nodeInfo[b]?.revenue ?? "0").replace(/[^0-9.]/g, "")),
                        0,
                      )
                      .toFixed(0)}
                    K / hour
                  </span>{" "}
                  across {blast.length} services.
                </li>
              </ul>
            ) : (
              <p className="text-xs text-tertiary">
                Select a node and press “Simulate outage” to highlight everything that fails with it
                and the business processes affected.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
