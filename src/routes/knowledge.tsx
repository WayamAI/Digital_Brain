import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, Panel } from "@/components/kit";
import { knowledgeSources, recentQuestions, suggestedQuestions } from "@/data/db";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Assistant — Digital Brain" },
      {
        name: "description",
        content:
          "Natural language answers over runbooks, architecture documents, SOPs and 14,260 past incidents — every answer cites its sources.",
      },
      { property: "og:title", content: "Knowledge Assistant — Digital Brain" },
      {
        property: "og:description",
        content: "Ask operational questions and get cited answers from the PepsiCo IT knowledge base.",
      },
    ],
  }),
  component: Knowledge,
});

type QA = { q: string; a: string; sources: string[] };

const ANSWERS: QA[] = [
  {
    q: "Why did the SAP Order Management service fail yesterday?",
    a: "Order Management degraded at 14:05 UTC (INC-48213) when deploy CHG-3388 (sap-om-api v4.19.2) introduced a read path that acquired a database connection without releasing it on retry. The HikariCP pool saturated at 180/180 connections and p95 order create latency rose from 482 ms to 11.4 s. The Incident Resolution Agent froze the pipeline, drained canary pods and rolled back to v4.19.1; the service recovered 27 minutes after first signal with no orders lost. The signature matches PRB-1042, which has recurred seven times in 30 days — the permanent fix (pool increase plus circuit breaker) is in progress.",
    sources: [
      "Incident INC-48213 (ServiceNow)",
      "Change CHG-3388 — deploy record",
      "Runbook SOP-022 — connection pool saturation",
      "Problem record PRB-1042",
      "Architecture: SAP Order Management data tier (v9)",
    ],
  },
];

function Knowledge() {
  const [q, setQ] = useState(ANSWERS[0]!.q);
  const [answer, setAnswer] = useState<QA>(ANSWERS[0]!);
  const [loading, setLoading] = useState(false);

  const ask = (question: string) => {
    setQ(question);
    setLoading(true);
    setTimeout(() => {
      const hit = ANSWERS.find((a) => a.q.toLowerCase() === question.toLowerCase().trim());
      setAnswer(
        hit ?? {
          q: question,
          a: "Based on the current knowledge base: escalation for a P1 on a Tier 0 service pages the primary on call within 60 seconds, opens a bridge in #it-ops-bridge, and notifies the service owner plus the regional Ops Manager. If mitigation is not underway in 15 minutes, the CIO duty officer is notified. Tier 0 services carry a 30-minute RTO and a 5-minute RPO; Digital Brain assists but a named human owns every P1 from page to postmortem.",
          sources: [
            "SOP-007 — Major incident management",
            "SOP-014 — P1 post incident review",
            "Service catalogue — Tier 0 definitions",
          ],
        },
      );
      setLoading(false);
    }, 1100);
  };

  return (
    <AppShell intro="The Knowledge Assistant refuses to answer without a citation. If it cannot ground the answer in a document or incident record, it says so and routes you to an owner.">
      <div className="grid gap-3 xl:grid-cols-[1fr_330px]">
        <div className="space-y-3">
          <Panel title="Ask the knowledge base" desc="Runbooks · architecture docs · SOPs · incident history">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                ask(q);
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <Btn type="submit">Ask</Btn>
            </form>
          </Panel>

          <Panel title="Answer" desc={loading ? "Retrieving and grounding…" : "Grounded in 5 sources"}>
            {loading ? (
              <div className="space-y-2">
                {[90, 100, 75].map((w) => (
                  <div key={w} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-[13px] leading-relaxed">{answer.a}</p>
                <div className="mt-4">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Sources
                  </div>
                  <ul className="grid gap-1.5 md:grid-cols-2">
                    {answer.sources.map((s) => (
                      <li
                        key={s}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-muted"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel title="Suggested questions">
            <ul className="space-y-1.5">
              {suggestedQuestions.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => ask(s)}
                    className="w-full rounded-md border border-border px-3 py-2 text-left text-[12px] hover:border-accent hover:bg-muted"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recently asked (team wide)">
            <ul className="space-y-1.5 text-[12px]">
              {recentQuestions.map((r) => (
                <li key={r.q} className="rounded-md bg-muted px-3 py-2">
                  <div>{r.q}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.who} · {r.when}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Source library">
            <ul className="space-y-1.5 text-[12.5px]">
              {knowledgeSources.map((s) => (
                <li key={s.name} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                  <BookOpen className="h-3.5 w-3.5 text-accent" />
                  {s.name}
                  <span className="num ml-auto text-muted-foreground">{s.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
