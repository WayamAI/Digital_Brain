import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "@/components/app-icon";
import { AppShell } from "@/components/app-shell";
import { Btn, DataTable, Drawer, KeyVals, Panel, Pill } from "@/components/kit";
import { approvals } from "@/data/db";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Queue — Digital Brain" },
      {
        name: "description",
        content:
          "Human in the loop queue for Tier 2 agent actions: proposed remediation, blast radius, rollback plan and approval history.",
      },
      { property: "og:title", content: "Approval Queue — Digital Brain" },
      {
        property: "og:description",
        content: "Approve or reject agent proposed IT operations actions with full context.",
      },
    ],
  }),
  component: ApprovalQueue,
});

type Row = (typeof approvals)[number];

function ApprovalQueue() {
  const [rows, setRows] = useState<Row[]>(approvals);
  const [sel, setSel] = useState<Row | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const decide = (r: Row, ok: boolean) => {
    setRows((s) => s.filter((x) => x.id !== r.id));
    setSel(null);
    setLog((l) => [
      `${ok ? "Approved" : "Rejected"} ${r.id} — ${r.action} · ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      ...l,
    ]);
    toast[ok ? "success" : "message"](
      ok ? "Action approved and dispatched" : "Action rejected and reassigned",
      { description: r.action },
    );
  };

  return (
    <AppShell
      intro="Tier 2 items: the agent has a fix and the confidence to run it, but the blast radius requires a named human to say yes. Control Tower KPIs update as you decide."
      actions={<Pill tone={rows.length ? "warn" : "ok"}>{rows.length} awaiting · SLA 15 min</Pill>}
    >
      <Panel
        title="Pending approvals"
        desc="Click a row for blast radius and rollback plan"
        pad={false}
      >
        {rows.length ? (
          <DataTable<Row>
            rows={rows}
            rowKey={(r) => r.id}
            onRow={setSel}
            cols={[
              {
                key: "item",
                header: "Item",
                cell: (r) => <span className="font-medium">{r.item}</span>,
              },
              { key: "agent", header: "Agent" },
              { key: "action", header: "Proposed action" },
              { key: "risk", header: "Risk", cell: (r) => <Pill>{r.risk}</Pill> },
              {
                key: "impact",
                header: "Business impact if wrong",
                cell: (r) => <span className="text-tertiary">{r.impact}</span>,
              },
              { key: "waiting", header: "Waiting since" },
              {
                key: "act",
                header: "Decision",
                cell: (r) => (
                  <div className="flex gap-1.5">
                    <Btn
                      size="sm"
                      variant="ok"
                      onClick={() => {
                        decide(r, true);
                      }}
                    >
                      Approve
                    </Btn>
                    <Btn size="sm" variant="outline" onClick={() => decide(r, false)}>
                      Reject
                    </Btn>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <div className="px-4 py-6 text-sm text-tertiary">
            Queue clear — all Tier 2 proposals decided. New proposals appear here within seconds of
            agent diagnosis.
          </div>
        )}
      </Panel>

      <Panel
        className="mt-4"
        title="Decision log — this session"
        desc="Every decision is written to the accountability ledger"
      >
        <ul className="space-y-1.5 text-xs">
          {(log.length
            ? log
            : [
                "Approved APR-768 — Scale ServiceNow portal to L4 · 09:41",
                "Approved APR-766 — Terminate 34 idle dev EC2 instances · 08:12",
                "Rejected APR-765 — Restart HANA secondary node (deferred to CAB) · 07:55",
              ]
          ).map((l) => (
            <li key={l} className="rounded-lg border border-default px-3 py-2">
              {l}
            </li>
          ))}
        </ul>
      </Panel>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.action ?? ""}
        subtitle={sel?.item}
      >
        {sel && (
          <>
            <KeyVals
              items={[
                ["Proposed by", sel.agent],
                ["Risk level", <Pill key="r">{sel.risk}</Pill>],
                ["Waiting", sel.waiting],
                ["Blast radius", sel.blast],
                ["Rollback plan", sel.rollback],
                ["Impact if wrong", sel.impact],
              ]}
            />
            <div className="rounded-lg bg-success-bg px-3 py-2 text-xs text-success">
              {sel.history}
            </div>
            <div className="rounded-lg border border-default px-3 py-2.5">
              <div className="text-2xs font-semibold uppercase tracking-wide text-tertiary">
                Where this came from
              </div>
              <p className="mt-1 text-xs leading-relaxed text-tertiary">
                {sel.agent} raised this while working {sel.incident}. Open the incident to see the
                full agent pipeline that produced it, and approve at the gate in context.
              </p>
              <Link to="/incidents/$id" params={{ id: sel.incident }}>
                <Btn variant="outline" size="sm" className="mt-2">
                  <AppIcon name="dispatch" size="xs" />
                  Open {sel.incident} pipeline
                </Btn>
              </Link>
            </div>
            <div className="flex gap-2 border-t border-default pt-3">
              <Btn variant="ok" onClick={() => decide(sel, true)}>
                Approve &amp; execute
              </Btn>
              <Btn variant="outline" onClick={() => decide(sel, false)}>
                Reject &amp; reassign
              </Btn>
            </div>
          </>
        )}
      </Drawer>
    </AppShell>
  );
}
