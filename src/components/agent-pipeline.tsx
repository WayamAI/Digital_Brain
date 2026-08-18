import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Circle,
  ClipboardList,
  CircuitBoard,
  DollarSign,
  FileText,
  Gauge,
  GitBranch,
  Hand,
  LifeBuoy,
  ListChecks,
  Loader2,
  Lock,
  MessagesSquare,
  Radar,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
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

const AGENT_ICON: Record<string, typeof Activity> = {
  "alert-noise": Radar,
  "service-health": Activity,
  "dependency-impact": GitBranch,
  "root-cause": Search,
  "problem-mgmt": ListChecks,
  knowledge: LifeBuoy,
  predictive: TrendingUp,
  "change-risk": ClipboardList,
  capacity: Gauge,
  "incident-resolution": Zap,
  copilot: MessagesSquare,
  cost: DollarSign,
  compliance: ShieldCheck,
  vendor: Building2,
  executive: FileText,
};

const AGENT_BY_SLUG = Object.fromEntries(agents.map((a) => [a.slug, a]));

type StepPhase = "idle" | "running" | "done" | "gate" | "approved" | "rejected" | "human";

type StepState = { state: StepPhase; phase?: string | undefined; secs?: string | undefined };

type RunPhase = "idle" | "running" | "gate" | "halted" | "complete";

const NODE_CLASS: Record<StepPhase, string> = {
  idle: "border-border bg-card text-muted-foreground",
  running: "border-accent bg-info-soft text-accent pipe-ping",
  done: "border-ok bg-ok-soft text-ok",
  gate: "border-warn bg-warn-soft text-warn-ink",
  approved: "border-ok bg-ok-soft text-ok",
  rejected: "border-crit bg-crit-soft text-crit",
  human: "border-human bg-human-soft text-human",
};

const CARD_CLASS: Record<StepPhase, string> = {
  idle: "border-border opacity-55",
  running: "border-accent/55 shadow-[0_0_18px_var(--color-info-soft)]",
  done: "border-ok/35",
  gate: "border-warn/60 shadow-[0_0_20px_var(--color-warn-soft)]",
  approved: "border-ok/35",
  rejected: "border-crit/50",
  human: "border-human/55 shadow-[0_0_20px_var(--color-human-soft)]",
};

const ICON_TILE: Record<StepPhase, string> = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-info-soft text-accent",
  done: "bg-ok-soft text-ok",
  gate: "bg-warn-soft text-warn-ink",
  approved: "bg-ok-soft text-ok",
  rejected: "bg-crit-soft text-crit",
  human: "bg-human-soft text-human",
};

const METRIC_CLASS: Record<MetricTone, string> = {
  ok: "text-ok",
  warn: "text-warn-ink",
  crit: "text-crit",
  human: "text-human",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */

export function TierBanner({ tier }: { tier: Incident["tier"] }) {
  const meta = tierMeta[tier];
  const Icon = meta.tone === "ok" ? ShieldCheck : meta.tone === "warn" ? ShieldAlert : Hand;
  const skin =
    meta.tone === "ok"
      ? "border-ok/30 bg-ok-soft text-ok"
      : meta.tone === "warn"
        ? "border-warn/35 bg-warn-soft text-warn-ink"
        : "border-human/30 bg-human-soft text-human";

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", skin)}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" strokeWidth={1.9} />
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{meta.label}</div>
        <p className="mt-0.5 text-[11.5px] leading-relaxed opacity-85">{meta.blurb}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Metrics({ items }: { items: NonNullable<PipelineStep["metrics"]> }) {
  return (
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(112px,1fr))]">
      {items.map((m) => (
        <div key={m.l} className="rounded-md border border-border bg-muted/50 px-2.5 py-2">
          <div className="text-[8.5px] font-extrabold uppercase tracking-[0.09em] text-muted-foreground">
            {m.l}
          </div>
          <div
            className={cn("num mt-0.5 text-[16px] font-extrabold", m.tone && METRIC_CLASS[m.tone])}
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
        <div key={f} className="flex items-baseline gap-2 text-[12px]">
          <span className="num shrink-0 text-[11px] font-bold text-accent">{mark}</span>
          <span className="text-muted-foreground">{f}</span>
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
              "flex items-baseline gap-2.5 rounded-md border px-3 py-2 text-[12.5px]",
              held ? "border-warn/45 bg-warn-soft" : "border-border bg-muted/50",
            )}
          >
            <span
              className={cn(
                "num shrink-0 text-[10px] font-extrabold",
                held ? "text-warn-ink" : done ? "text-ok" : "text-muted-foreground",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={cn("min-w-0 flex-1", !done && !held && "text-muted-foreground")}>
              {r.step}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              <Pill tone={r.tier === "Tier 1" ? "ok" : r.tier === "Tier 2" ? "warn" : "human"}>
                {r.tier}
              </Pill>
              {done && <Check className="h-3.5 w-3.5 text-ok" />}
              {held && <Lock className="h-3.5 w-3.5 text-warn-ink" />}
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
    <span className="num text-[11px] text-muted-foreground">
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
          <div className="text-[13.5px] font-semibold">
            {scenario.replay ? "Replay agent pipeline" : "Dispatch agent pipeline"}
          </div>
          <p className="mt-0.5 max-w-[62ch] text-[11.5px] leading-relaxed text-muted-foreground">
            {scenario.headline} Each agent receives the previous agent's output as its input.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {running && <Elapsed running={running} />}
          {phase === "gate" && <Pill tone="warn">Held — your decision required</Pill>}
          {finished ? (
            <Btn onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              {phase === "halted" ? "Reset pipeline" : "Run again"}
            </Btn>
          ) : (
            <Btn
              onClick={() => void runFrom(0)}
              className={cn((running || phase === "gate") && "pointer-events-none opacity-60")}
            >
              {running || phase === "gate" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {phase === "gate" ? "Awaiting approval…" : "Agents running…"}
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
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
          <span className="num text-[11px] text-muted-foreground">
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
  const Icon = AGENT_ICON[step.agent] ?? CircuitBoard;
  const s = state.state;
  const revealed = s !== "idle" && s !== "running";

  const NodeIcon =
    s === "running"
      ? Loader2
      : s === "gate"
        ? ShieldAlert
        : s === "rejected"
          ? X
          : s === "human"
            ? Hand
            : s === "done" || s === "approved"
              ? Check
              : Circle;

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
          <NodeIcon
            className={cn("h-3.5 w-3.5", s === "running" && "animate-spin")}
            strokeWidth={2.4}
          />
        </div>
        {!last && (
          <div
            className={cn(
              "relative my-1 min-h-3.5 w-0.5 flex-1 overflow-hidden",
              s === "done" || s === "approved" ? "bg-ok/50" : "bg-border",
              s === "running" && "pipe-flow",
            )}
          />
        )}
      </div>

      {/* card */}
      <div className="min-w-0 pb-4">
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-card transition-all duration-300",
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
              <Icon className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              {agent ? (
                <Link
                  to="/agents/$slug"
                  params={{ slug: agent.slug }}
                  className="text-[13px] font-bold hover:text-accent"
                >
                  {agent.name}
                </Link>
              ) : (
                <span className="text-[13px] font-bold">{step.agent}</span>
              )}
              <div className="num text-[10px] text-muted-foreground">
                agent://{step.agent}
                {agent ? ` · ${agent.stage} · ${agent.tier}` : ""}
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {statusPill}
              {state.secs && (
                <span className="num text-[10.5px] text-muted-foreground">{state.secs}</span>
              )}
            </div>
          </div>

          {s === "running" && state.phase && (
            <div className="flex items-center gap-2 px-4 pb-3 text-[12px] font-semibold text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {state.phase}…
            </div>
          )}

          {revealed && (
            <div className="pipe-reveal space-y-3.5 border-t border-border px-4 py-3.5">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">{step.say}</p>
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
            <div className="flex items-center gap-2 border-t border-dashed border-border bg-muted/50 px-4 py-2.5 text-[11.5px] text-muted-foreground">
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
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
      <div className="pipe-reveal flex items-start gap-2.5 border-t border-border bg-ok-soft px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
        <div className="text-[12.5px] font-semibold text-ok">{gate.approvedBy}</div>
      </div>
    );
  }

  if (state === "rejected") {
    return (
      <div className="pipe-reveal space-y-1.5 border-t border-border bg-crit-soft px-4 py-3">
        <div className="flex items-start gap-2.5">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-crit" />
          <div className="text-[12.5px] font-semibold text-crit">{halted.title}</div>
        </div>
        <p className="pl-6.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {halted.detail}
        </p>
      </div>
    );
  }

  return (
    <div className="pipe-reveal space-y-3.5 border-t border-border px-4 py-3.5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-warn-ink" />
        <strong className="text-[13px]">{gate.title}</strong>
        <Pill className="ml-auto" tone="warn">
          {gate.approvalId}
        </Pill>
      </div>

      <RunbookList steps={gate.runbook} />

      <p className="text-[11px] leading-relaxed text-muted-foreground">{gate.note}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Btn variant="ok" onClick={onApprove}>
          <Check className="h-3.5 w-3.5" />
          Approve and execute
        </Btn>
        <Btn variant="outline" onClick={onReject}>
          Reject
        </Btn>
        <Link to="/approvals" className="ml-auto">
          <Btn variant="ghost" size="sm">
            Open Approval Queue
            <ChevronRight className="h-3 w-3" />
          </Btn>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HumanPanel({ human }: { human: NonNullable<PipelineStep["human"]> }) {
  return (
    <div className="pipe-reveal space-y-3.5 border-t border-border bg-human-soft/60 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <Hand className="h-4 w-4 shrink-0 text-human" />
        <strong className="text-[13px] text-human">Control transferred to a human owner</strong>
      </div>

      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {[
          ["Owner of record", human.owner],
          ["Paged", human.paged],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border bg-card px-3 py-2.5">
            <div className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
              {l}
            </div>
            <div className="mt-0.5 text-[12.5px] font-semibold">{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Decisions only a human can make
        </div>
        <div className="space-y-1.5">
          {human.decisions.map((q) => (
            <div key={q} className="flex items-baseline gap-2 text-[12px]">
              <span className="num shrink-0 text-[11px] font-bold text-human">?</span>
              <span className="text-muted-foreground">{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-3 py-2.5">
        <div className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
          What the agents handed over
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed">{human.gave}</p>
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
      ? "border-ok/35 bg-ok-soft"
      : kind === "human"
        ? "border-human/35 bg-human-soft"
        : "border-crit/35 bg-crit-soft";
  const tile =
    kind === "ok"
      ? "bg-ok/15 text-ok"
      : kind === "human"
        ? "bg-human/15 text-human"
        : "bg-crit/15 text-crit";
  const Icon = kind === "ok" ? ShieldCheck : kind === "human" ? Hand : X;

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
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold">{title}</div>
        <p className="mt-0.5 max-w-[86ch] text-[11.5px] leading-relaxed text-muted-foreground">
          {detail}
        </p>
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
