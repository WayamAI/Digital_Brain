import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, Panel, Pill } from "@/components/kit";
import { copilotActions } from "@/data/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "Operations Copilot — Digital Brain" },
      {
        name: "description",
        content:
          "Conversational operations workspace: draft exec updates, summarise bridge calls, pull postmortem templates and update ITSM tickets.",
      },
      { property: "og:title", content: "Operations Copilot — Digital Brain" },
      {
        property: "og:description",
        content: "Chat workspace for L1/L2 operators with live incident context and runbooks.",
      },
    ],
  }),
  component: Copilot,
});

type Msg = { role: "user" | "agent"; text: string; t: string };

const CANNED: { q: string; a: string }[] = [
  {
    q: "Draft a status update for INC-48213 for the exec Slack channel",
    a: "Draft ready — **INC-48213 · SAP Order Management (Frito Lay NA)**\n\nImpact: order create latency elevated (p95 11.4s) since 14:05 UTC; no orders lost, queue draining normally.\nCause: deploy sap-om-api v4.19.2 exhausted the DB connection pool (94% confidence, matches PRB-1042).\nAction: automated rollback to v4.19.1 in progress, ETA 6 minutes; pool utilisation already down to 84%.\nNext update: 14:40 UTC or on recovery.\n\nSend to #pep-it-exec, or edit first?",
  },
  {
    q: "Summarize the last 20 minutes of the bridge call",
    a: "Bridge summary (13:52–14:12 UTC · 9 participants)\n\n• Order Management degradation confirmed at 14:05; NA DCs reporting slow order confirmation.\n• Deploy CHG-3388 identified as the trigger; pipeline frozen at 14:06.\n• Rollback authorised by R. Alvarez under policy POL-014.\n• Warehouse Management asked for a 15-minute heads up before recovery.\n\nAction items:\n1. J. Kim — confirm pool utilisation < 70% for 10 min (owner, 14:30).\n2. D. Okafor — notify 41 NA DCs on recovery (owner, on rollback complete).\n3. R. Alvarez — attach this incident to PRB-1042 (owner, today).\n4. S. Rahman — verify analytics ingestion backlog cleared (owner, 15:00).",
  },
  {
    q: "What's the postmortem template for a P1?",
    a: "Pulled **SOP-014 · P1 Post Incident Review** (last revised 12 June).\n\nSections: 1) Executive summary · 2) Customer/business impact with quantified exposure · 3) Detection timeline (first signal → page → mitigation → resolution) · 4) Root cause with evidence · 5) Contributing factors · 6) What went well / what didn't · 7) Corrective actions with owners and dates · 8) Problem record linkage.\n\nDue within 5 business days, reviewed at the Thursday Ops Review. Want me to pre fill it for INC-48213?",
  },
  {
    q: "Update ServiceNow ticket INC-48213 with the rollback status",
    a: "Done — ServiceNow INC-48213 updated at 14:09 UTC.\n\n• Work note added: \"Automated rollback to sap-om-api v4.19.1 executing; pool utilisation 84% and falling.\"\n• State set to *In Progress*, assignment group *Enterprise Apps — SAP*.\n• Linked to PRB-1042 and CHG-3388.\n\nThe write is logged in the accountability ledger under your name.",
  },
];

function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "agent",
      text: "Good afternoon, Sana. I'm watching INC-48213 (SAP Order Management, rollback executing) and INC-48211 (Salesforce LatAm, awaiting approval). Ask me to draft, summarise, look something up, or update a ticket.",
      t: "14:03",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (q: string) => {
    if (!q.trim()) return;
    const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setMsgs((m) => [...m, { role: "user", text: q, t }]);
    setInput("");
    setThinking(true);
    const hit = CANNED.find((c) => c.q.toLowerCase() === q.toLowerCase().trim());
    setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [
        ...m,
        {
          role: "agent",
          text:
            hit?.a ??
            `Working from the live context for INC-48213 and the Enterprise Apps runbook set.\n\nClosest match: SOP-022 "Connection pool saturation — SAP Order Management". Steps: freeze the pipeline, drain canary pods, roll back the last deploy, verify pool utilisation below 70% for ten minutes, then post recovery notice to #it-ops-bridge.\n\nI can execute steps 1–3 under Tier 1 policy POL-014, or hand you a checklist. Which do you want?`,
          t,
        },
      ]);
    }, 1400);
  };

  return (
    <AppShell intro="The Copilot drafts, summarises and writes back to ServiceNow — it never sends outbound executive communication without an operator pressing send.">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Conversation" desc="Operations Copilot · Tier 2 autonomy" pad={false} className="min-h-[560px]">
          <div className="flex h-[460px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "agent" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand">
                    <Sparkles className="h-3.5 w-3.5 text-brand-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] whitespace-pre-line rounded-lg px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                    m.role === "user"
                      ? "bg-brand text-brand-foreground"
                      : "border border-border bg-muted",
                  )}
                >
                  {m.text}
                  <div
                    className={cn(
                      "mt-1.5 text-[10px]",
                      m.role === "user" ? "text-brand-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {m.t}
                  </div>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="text-[12px] text-muted-foreground">Copilot is composing…</div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {CANNED.map((c) => (
                <button
                  key={c.q}
                  onClick={() => send(c.q)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-accent hover:text-foreground"
                >
                  {c.q}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the Copilot to draft, summarise, look up or update…"
                className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
              />
              <Btn type="submit">
                <Send className="h-3.5 w-3.5" /> Send
              </Btn>
            </form>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Active incident context">
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center gap-2">
                <Pill tone="crit">INC-48213</Pill>
                <span className="text-muted-foreground">SAP ERP – Order Mgmt (Frito Lay NA)</span>
              </div>
              <p className="text-muted-foreground">
                Rollback executing · 94% confidence · owner Agent (Tier 1) · bridge #it-ops-bridge live
                with 9 participants.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Pill tone="warn">INC-48211</Pill>
                <span className="text-muted-foreground">Salesforce – Field Sales (LatAm)</span>
              </div>
            </div>
          </Panel>

          <Panel title="Relevant runbooks">
            <ul className="space-y-1.5 text-[12.5px]">
              {[
                "SOP-022 — Connection pool saturation (SAP OM)",
                "RB-118 — Safe deploy rollback, sap-om-api",
                "RB-091 — OAuth cache bust after cert rotation",
                "SOP-014 — P1 post incident review template",
              ].map((r) => (
                <li key={r} className="rounded-md border border-border px-3 py-2 hover:bg-muted">
                  {r}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Related tickets">
            <ul className="space-y-1.5 text-[12.5px]">
              {[
                ["CHG-3388", "Deploy sap-om-api v4.19.2 — frozen"],
                ["PRB-1042", "DB connection pool exhaustion — in progress"],
                ["INC-48102", "Prior occurrence, 4 days ago — resolved"],
              ].map(([id, d]) => (
                <li key={id} className="flex gap-2 rounded-md border border-border px-3 py-2">
                  <span className="font-medium">{id}</span>
                  <span className="text-muted-foreground">{d}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel className="mt-3" title="Recent Copilot actions" desc="Every write back is attributable">
        <ul className="grid gap-1.5 md:grid-cols-2">
          {copilotActions.map((a) => (
            <li key={a.a} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12.5px]">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              {a.a}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {a.by} · {a.t}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
