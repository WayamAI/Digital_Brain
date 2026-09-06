import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/components/app-icon";
import type { IconName } from "@/components/icons";
import { Btn, Panel, Pill } from "@/components/kit";
import { agents, type Incident } from "@/data/db";
import {
  tierMeta,
  type MetricTone,
  type PipelineStep,
  type RunbookStep,
  type Scenario,
} from "@/data/scenarios";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */

/** Agent slug -> icon concept. Deliberately the same glyphs the sidebar uses
 *  for the matching destination — one concept, one icon, everywhere. */
const AGENT_ICON: Record<string, IconName> = {
  "alert-noise": "alertNoise",
  "service-health": "serviceHealth",
  "dependency-impact": "dependency",
  "root-cause": "rootCause",
  "problem-mgmt": "problem",
  knowledge: "knowledge",
  predictive: "predictive",
  "change-risk": "changeRisk",
  capacity: "capacity",
  "incident-resolution": "dispatch",
  copilot: "copilot",
  cost: "cost",
  compliance: "compliance",
  vendor: "vendor",
  executive: "briefing",
};

const AGENT_BY_SLUG = Object.fromEntries(agents.map((a) => [a.slug, a]));

type StepPhase = "idle" | "running" | "done" | "gate" | "approved" | "rejected" | "human";

type StepState = { state: StepPhase; phase?: string | undefined; secs?: string | undefined };

type RunPhase = "idle" | "running" | "gate" | "halted" | "complete";

const NODE_CLASS: Record<StepPhase, string> = {
  idle: "border-default bg-raised text-tertiary",
  running: "border-info bg-info-bg text-info pipe-ping",
  done: "border-success bg-success-bg text-success",
  gate: "border-warning bg-warning-bg text-warning-content",
  approved: "border-success bg-success-bg text-success",
  rejected: "border-error bg-error-bg text-error",
  human: "border-human bg-human-soft text-human",
};

const CARD_CLASS: Record<StepPhase, string> = {
  idle: "border-default opacity-55",
  running: "border-info/55 shadow-[0_0_18px_var(--color-info-soft)]",
  done: "border-success/35",
  gate: "border-warning/60 shadow-[0_0_20px_var(--color-warn-soft)]",
  approved: "border-success/35",
  rejected: "border-error/50",
  human: "border-human/55 shadow-[0_0_20px_var(--color-human-soft)]",
};

const ICON_TILE: Record<StepPhase, string> = {
  idle: "bg-action text-tertiary",
  running: "bg-info-bg text-info",
  done: "bg-success-bg text-success",
  gate: "bg-warning-bg text-warning-content",
  approved: "bg-success-bg text-success",
  rejected: "bg-error-bg text-error",
  human: "bg-human-soft text-human",
};

const METRIC_CLASS: Record<MetricTone, string> = {
  ok: "text-success",
  warn: "text-warning-content",
  crit: "text-error",
  human: "text-human",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */

export function TierBanner({ tier }: { tier: Incident["tier"] }) {
  const meta = tierMeta[tier];
  const icon: IconName =
    meta.tone === "ok" ? "compliance" : meta.tone === "warn" ? "shieldAlert" : "human";
  const skin =
    meta.tone === "ok"
      ? "border-success/30 bg-success-bg text-success"
      : meta.tone === "warn"
        ? "border-warning/35 bg-warning-bg text-warning-content"
        : "border-human/30 bg-human-soft text-human";

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", skin)}>
      <AppIcon name={icon} size="lg" className="mt-0.5" />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{meta.label}</div>
        <p className="mt-0.5 text-2xs leading-relaxed opacity-85">{meta.blurb}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Metrics({ items }: { items: NonNullable<PipelineStep["metrics"]> }) {
  return (
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(112px,1fr))]">
      {items.map((m) => (
        <div key={m.l} className="rounded-lg border border-default bg-action/50 px-2.5 py-2">
          <div className="text-4xs font-extrabold uppercase tracking-[0.09em] text-tertiary">
            {m.l}
          </div>
          <div
            className={cn(
              "num mt-0.5 font-display text-display-md",
              m.tone && METRIC_CLASS[m.tone],
            )}
          >
            {m.v}
          </div>
        </div>
      ))}
    </div>
  );
}

function Findings({ items, mark = "›" }: { items: string[]; mark?: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((f) => (
        <div key={f} className="flex items-baseline gap-2 text-xs">
          <span className="num shrink-0 text-2xs font-bold text-info">{mark}</span>
          <span className="text-tertiary">{f}</span>
        </div>
      ))}
    </div>
  );
}

function RunbookList({ steps }: { steps: RunbookStep[] }) {
  return (
    <div className="space-y-1.5">
      {steps.map((r, i) => {
        const held = r.state === "held";
        const done = r.state === "done";
        return (
          <div
            key={r.step}
            className={cn(
              "flex items-baseline gap-2.5 rounded-lg border px-3 py-2 text-xs",
              held ? "border-warning/45 bg-warning-bg" : "border-default bg-action/50",
            )}
          >
            <span
              className={cn(
                "num shrink-0 text-3xs font-extrabold",
                held ? "text-warning-content" : done ? "text-success" : "text-tertiary",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={cn("min-w-0 flex-1", !done && !held && "text-tertiary")}>
              {r.step}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              <Pill tone={r.tier === "Tier 1" ? "ok" : r.tier === "Tier 2" ? "warn" : "human"}>
                {r.tier}
              </Pill>
              {done && <AppIcon name="check" size="sm" className="text-success" />}
              {held && <AppIcon name="lock" size="sm" className="text-warning-content" />}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Elapsed({ running }: { running: boolean }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <span className="num text-2xs text-tertiary">
      {m}:{String(s).padStart(2, "0")} elapsed
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function AgentPipeline({ incident, scenario }: { incident: Incident; scenario: Scenario }) {
  const steps = scenario.steps;
  const gateIndex = useMemo(() => steps.findIndex((s) => !!s.gate), [steps]);

  const [states, setStates] = useState<StepState[]>(() => steps.map(() => ({ state: "idle" })));
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [complete, setComplete] = useState(0);

  const tokenRef = useRef(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Abandon any in flight run if the component goes away.
  useEffect(() => () => void tokenRef.current++, []);

  const setStep = useCallback((i: number, next: StepState) => {
    setStates((prev) => prev.map((s, ix) => (ix === i ? next : s)));
  }, []);

  const focusStep = useCallback((i: number) => {
    stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const runFrom = useCallback(
    async (start: number) => {
      const token = tokenRef.current;
      setPhase("running");

      for (let i = start; i < steps.length; i++) {
        const st = steps[i]!;
        const secs = `${(st.ms / 1000).toFixed(1)}s`;

        setStep(i, { state: "running", phase: st.phases[0] });
        focusStep(i);

        const per = Math.max(420, Math.floor(st.ms / st.phases.length));
        for (const p of st.phases) {
          setStep(i, { state: "running", phase: p });
          await sleep(per);
          if (token !== tokenRef.current) return;
        }

        if (st.gate) {
          setStep(i, { state: "gate", secs });
          setPhase("gate");
          focusStep(i);
          return; // hold until approve() or reject()
        }

        setStep(i, { state: st.human ? "human" : "done", secs });
        setComplete(i + 1);
        await sleep(520);
        if (token !== tokenRef.current) return;
      }

      setPhase("complete");
    },
    [steps, setStep, focusStep],
  );

  const approve = useCallback(async () => {
    if (gateIndex < 0) return;
    const st = steps[gateIndex]!;
    setStep(gateIndex, { state: "approved", secs: st.gate?.held });
    setComplete(gateIndex + 1);
    await sleep(700);
    void runFrom(gateIndex + 1);
  }, [gateIndex, steps, setStep, runFrom]);

  const reject = useCallback(() => {
    if (gateIndex < 0) return;
    const st = steps[gateIndex]!;
    setStep(gateIndex, { state: "rejected", secs: st.gate?.held });
    setPhase("halted");
  }, [gateIndex, steps, setStep]);

  const reset = useCallback(() => {
    tokenRef.current++;
    setStates(steps.map(() => ({ state: "idle" })));
    setComplete(0);
    setPhase("idle");
  }, [steps]);

  const running = phase === "running";
  const finished = phase === "complete" || phase === "halted";

  return (
    <>
      {/* ---- dispatch bar ---- */}
      <div className="card-surface mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3.5">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {scenario.replay ? "Replay agent pipeline" : "Dispatch agent pipeline"}
          </div>
          <p className="mt-0.5 max-w-[62ch] text-2xs leading-relaxed text-tertiary">
            {scenario.headline} Each agent receives the previous agent's output as its input.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {running && <Elapsed running={running} />}
          {phase === "gate" && <Pill tone="warn">Held — your decision required</Pill>}
          {finished ? (
            <Btn onClick={reset}>
              <AppIcon name="retry" size="sm" />
              {phase === "halted" ? "Reset pipeline" : "Run again"}
            </Btn>
          ) : (
            <Btn
              onClick={() => void runFrom(0)}
              className={cn((running || phase === "gate") && "pointer-events-none opacity-60")}
            >
              {running || phase === "gate" ? (
                <>
                  <AppIcon name="loading" size="sm" spin />
                  {phase === "gate" ? "Awaiting approval…" : "Agents running…"}
                </>
              ) : (
                <>
                  <AppIcon name="dispatch" size="sm" />
                  {scenario.replay ? "Replay pipeline" : "Dispatch agents"}
                </>
              )}
            </Btn>
          )}
        </div>
      </div>

      {/* ---- pipeline ---- */}
      <Panel
        className="mt-3"
        title="Agent pipeline"
        desc={`${steps.length} agents · ${tierMeta[scenario.tier].label}`}
        right={
          <span className="num text-2xs text-tertiary">
            {complete} / {steps.length} complete
          </span>
        }
        pad={false}
      >
        <div className="px-4 pb-1 pt-4 sm:px-5">
          {steps.map((st, i) => (
            <PipelineRow
              key={`${st.agent}-${i}`}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              step={st}
              state={states[i] ?? { state: "idle" }}
              last={i === steps.length - 1}
              scenario={scenario}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      </Panel>

      {/* ---- outcome ---- */}
      {phase === "complete" && (
        <ResultBanner
          kind={scenario.outcome.kind}
          title={scenario.outcome.title}
          detail={scenario.outcome.detail}
          incidentId={incident.id}
        />
      )}
      {phase === "halted" && (
        <ResultBanner
          kind="halted"
          title={scenario.halted.title}
          detail={scenario.halted.detail}
          incidentId={incident.id}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function PipelineRow({
  ref,
  step,
  state,
  last,
  scenario,
  onApprove,
  onReject,
}: {
  ref: (el: HTMLDivElement | null) => void;
  step: PipelineStep;
  state: StepState;
  last: boolean;
  scenario: Scenario;
  onApprove: () => void;
  onReject: () => void;
}) {
  const agent = AGENT_BY_SLUG[step.agent];
  const icon = AGENT_ICON[step.agent] ?? "node";
  const s = state.state;
  const revealed = s !== "idle" && s !== "running";

  const nodeIcon: IconName =
    s === "running"
      ? "loading"
      : s === "gate"
        ? "shieldAlert"
        : s === "rejected"
          ? "close"
          : s === "human"
            ? "human"
            : s === "done" || s === "approved"
              ? "check"
              : "circle";

  const statusPill =
    s === "idle" ? (
      <Pill tone="muted">Queued</Pill>
    ) : s === "running" ? (
      <Pill tone="info">Running</Pill>
    ) : s === "gate" ? (
      <Pill tone="warn">Held for approval</Pill>
    ) : s === "approved" ? (
      <Pill tone="ok">Approved</Pill>
    ) : s === "rejected" ? (
      <Pill tone="crit">Rejected</Pill>
    ) : s === "human" ? (
      <Pill tone="human">Handed to human</Pill>
    ) : (
      <Pill tone="ok">Complete</Pill>
    );

  return (
    <div ref={ref} className="grid grid-cols-[30px_1fr] gap-x-3.5">
      {/* rail */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative z-[1] grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
            NODE_CLASS[s],
          )}
        >
          <AppIcon name={nodeIcon} size="sm" spin={s === "running"} />
        </div>
        {!last && (
          <div
            className={cn(
              "relative my-1 min-h-3.5 w-0.5 flex-1 overflow-hidden",
              s === "done" || s === "approved" ? "bg-success/50" : "bg-border",
              s === "running" && "pipe-flow",
            )}
          />
        )}
      </div>

      {/* card */}
      <div className="min-w-0 pb-4">
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-raised transition-all duration-300",
            CARD_CLASS[s],
          )}
        >
          <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
            <div
              className={cn(
                "grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg transition-colors",
                ICON_TILE[s],
              )}
            >
              <AppIcon name={icon} size="md" />
            </div>
            <div className="min-w-0">
              {agent ? (
                <Link
                  to="/agents/$slug"
                  params={{ slug: agent.slug }}
                  className="text-sm font-bold hover:text-info"
                >
                  {agent.name}
                </Link>
              ) : (
                <span className="text-sm font-bold">{step.agent}</span>
              )}
              <div className="num text-3xs text-tertiary">
                agent://{step.agent}
                {agent ? ` · ${agent.stage} · ${agent.tier}` : ""}
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {statusPill}
              {state.secs && <span className="num text-3xs text-tertiary">{state.secs}</span>}
            </div>
          </div>

          {s === "running" && state.phase && (
            <div className="flex items-center gap-2 px-4 pb-3 text-xs font-semibold text-info">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info" />
              </span>
              {state.phase}…
            </div>
          )}

          {revealed && (
            <div className="pipe-reveal space-y-3.5 border-t border-default px-4 py-3.5">
              <p className="text-xs leading-relaxed text-tertiary">{step.say}</p>
              {step.metrics && <Metrics items={step.metrics} />}
              {step.find && <Findings items={step.find} />}
            </div>
          )}

          {/* gate */}
          {step.gate && (s === "gate" || s === "approved" || s === "rejected") && (
            <GatePanel
              gate={step.gate}
              state={s}
              halted={scenario.halted}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {/* human handover */}
          {step.human && s === "human" && <HumanPanel human={step.human} />}

          {step.hand && revealed && s !== "gate" && s !== "rejected" && (
            <div className="flex items-center gap-2 border-t border-dashed border-default bg-action/50 px-4 py-2.5 text-2xs text-tertiary">
              <AppIcon name="arrowRight" size="sm" className="shrink-0" />
              {step.hand}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GatePanel({
  gate,
  state,
  halted,
  onApprove,
  onReject,
}: {
  gate: NonNullable<PipelineStep["gate"]>;
  state: StepPhase;
  halted: Scenario["halted"];
  onApprove: () => void;
  onReject: () => void;
}) {
  if (state === "approved") {
    return (
      <div className="pipe-reveal flex items-start gap-2.5 border-t border-default bg-success-bg px-4 py-3">
        <AppIcon name="compliance" size="md" className="mt-0.5 shrink-0 text-success" />
        <div className="text-xs font-semibold text-success">{gate.approvedBy}</div>
      </div>
    );
  }

  if (state === "rejected") {
    return (
      <div className="pipe-reveal space-y-1.5 border-t border-default bg-error-bg px-4 py-3">
        <div className="flex items-start gap-2.5">
          <AppIcon name="close" size="md" className="mt-0.5 shrink-0 text-error" />
          <div className="text-xs font-semibold text-error">{halted.title}</div>
        </div>
        <p className="pl-6.5 text-2xs leading-relaxed text-tertiary">{halted.detail}</p>
      </div>
    );
  }

  return (
    <div className="pipe-reveal space-y-3.5 border-t border-default px-4 py-3.5">
      <div className="flex items-center gap-2">
        <AppIcon name="shieldAlert" size="md" className="shrink-0 text-warning-content" />
        <strong className="text-sm">{gate.title}</strong>
        <Pill className="ml-auto" tone="warn">
          {gate.approvalId}
        </Pill>
      </div>

      <RunbookList steps={gate.runbook} />

      <p className="text-2xs leading-relaxed text-tertiary">{gate.note}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Btn variant="ok" onClick={onApprove}>
          <AppIcon name="check" size="sm" />
          Approve and execute
        </Btn>
        <Btn variant="outline" onClick={onReject}>
          Reject
        </Btn>
        <Link to="/approvals" className="ml-auto">
          <Btn variant="ghost" size="sm">
            Open Approval Queue
            <AppIcon name="chevronRight" size="xs" />
          </Btn>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HumanPanel({ human }: { human: NonNullable<PipelineStep["human"]> }) {
  return (
    <div className="pipe-reveal space-y-3.5 border-t border-default bg-human-soft/60 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <AppIcon name="human" size="md" className="shrink-0 text-human" />
        <strong className="text-sm text-human">Control transferred to a human owner</strong>
      </div>

      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {[
          ["Owner of record", human.owner],
          ["Paged", human.paged],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-default bg-raised px-3 py-2.5">
            <div className="text-4xs font-extrabold uppercase tracking-[0.1em] text-tertiary">
              {l}
            </div>
            <div className="mt-0.5 text-xs font-semibold">{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-2xs font-semibold uppercase tracking-wide text-tertiary">
          Decisions only a human can make
        </div>
        <div className="space-y-1.5">
          {human.decisions.map((q) => (
            <div key={q} className="flex items-baseline gap-2 text-xs">
              <span className="num shrink-0 text-2xs font-bold text-human">?</span>
              <span className="text-tertiary">{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-default bg-raised px-3 py-2.5">
        <div className="text-4xs font-extrabold uppercase tracking-[0.1em] text-tertiary">
          What the agents handed over
        </div>
        <p className="mt-1 text-xs leading-relaxed">{human.gave}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ResultBanner({
  kind,
  title,
  detail,
  incidentId,
}: {
  kind: "ok" | "human" | "halted";
  title: string;
  detail: string;
  incidentId: string;
}) {
  const skin =
    kind === "ok"
      ? "border-success/35 bg-success-bg"
      : kind === "human"
        ? "border-human/35 bg-human-soft"
        : "border-error/35 bg-error-bg";
  const tile =
    kind === "ok"
      ? "bg-success/15 text-success"
      : kind === "human"
        ? "bg-human/15 text-human"
        : "bg-error/15 text-error";
  const icon: IconName = kind === "ok" ? "compliance" : kind === "human" ? "human" : "close";

  return (
    <div
      className={cn(
        "pipe-reveal mt-3 flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4",
        skin,
      )}
    >
      <div
        className={cn("grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px]", tile)}
      >
        <AppIcon name={icon} size="xl" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 max-w-[86ch] text-2xs leading-relaxed text-tertiary">{detail}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link to="/autonomy">
          <Btn variant="outline" size="sm">
            View ledger entry
          </Btn>
        </Link>
        <Link to="/incidents">
          <Btn variant="ghost" size="sm">
            Back to queue
          </Btn>
        </Link>
      </div>
      <span className="sr-only">{incidentId}</span>
    </div>
  );
}
