import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  Btn,
  DataTable,
  Drawer,
  ExportBtn,
  Filters,
  KeyVals,
  Kpi,
  Meter,
  Panel,
  Pill,
} from "@/components/kit";
import { changes } from "@/data/db";

export const Route = createFileRoute("/change-risk")({
  head: () => ({
    meta: [
      { title: "Change Risk Advisor — Digital Brain" },
      {
        name: "description",
        content:
          "Predicted failure risk for every upcoming change, with safer deployment windows, dependency previews and rollback readiness checks.",
      },
      { property: "og:title", content: "Change Risk Advisor — Digital Brain" },
      {
        property: "og:description",
        content: "Score changes before CAB: proceed, reschedule or add a rollback plan.",
      },
    ],
  }),
  component: ChangeRisk,
});

type C = (typeof changes)[number];

function ChangeRisk() {
  const [f, setF] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<C | null>(null);
  const rows = changes.filter((c) => !f["rec"] || f["rec"] === "All" || c.rec === f["rec"]);

  return (
    <AppShell
      intro="Risk is modelled from historical failure rates for similar changes, the dependency blast radius, and what else is happening in the same window."
      actions={<ExportBtn label="Export CAB pack" />}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Changes this month" value="312" sub="target ≤ 400" tone="info" />
        <Kpi
          label="Change success rate (30d)"
          value="96.2%"
          sub="12 failures"
          tone="ok"
          trend="↑ 1.4%"
        />
        <Kpi label="Flagged elevated risk" value="3" sub="of 5 upcoming" tone="warn" />
        <Kpi label="Avg. risk score" value="25.6%" sub="down from 31.2%" tone="ok" trend="↓ 5.6" />
      </div>

      <Panel
        className="mt-4"
        title="Upcoming changes"
        desc="Click a change for history, dependencies and rollback readiness"
        pad={false}
      >
        <div className="px-4 pt-3">
          <Filters
            groups={[
              {
                key: "rec",
                label: "Recommendation",
                options: ["Proceed", "Reschedule", "Add rollback plan"],
              },
            ]}
            state={f}
            onChange={(k, v) => setF((s) => ({ ...s, [k]: v }))}
            right={<span className="text-2xs text-tertiary">{rows.length} changes</span>}
          />
        </div>
        <DataTable<C>
          rows={rows}
          rowKey={(r) => r.id}
          onRow={setSel}
          cols={[
            {
              key: "id",
              header: "Change",
              cell: (r) => <span className="font-medium">{r.id}</span>,
            },
            { key: "system", header: "System" },
            {
              key: "desc",
              header: "Description",
              cell: (r) => <span className="text-tertiary">{r.desc}</span>,
            },
            { key: "window", header: "Requested window" },
            {
              key: "risk",
              header: "Predicted failure risk",
              cell: (r) => (
                <Meter value={r.risk} tone={r.risk >= 40 ? "crit" : r.risk >= 25 ? "warn" : "ok"} />
              ),
            },
            { key: "rec", header: "Recommendation", cell: (r) => <Pill>{r.rec}</Pill> },
            { key: "approver", header: "Approver" },
          ]}
        />
      </Panel>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `${sel.id} · ${sel.system}` : ""}
        subtitle={sel?.desc}
      >
        {sel && (
          <>
            <KeyVals
              items={[
                ["Requested window", sel.window],
                [
                  "Predicted failure risk",
                  <Meter
                    key="m"
                    value={sel.risk}
                    tone={sel.risk >= 40 ? "crit" : sel.risk >= 25 ? "warn" : "ok"}
                  />,
                ],
                ["Recommendation", <Pill key="r">{sel.rec}</Pill>],
                ["Approver", sel.approver],
              ]}
            />
            <p className="rounded-lg bg-action px-3 py-2 text-xs leading-relaxed">{sel.note}</p>

            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Historical failure rate — similar changes
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex justify-between rounded-lg border border-default px-3 py-2">
                  <span>Same system, in peak window</span>
                  <span className="text-error">3 of 11 failed (27%)</span>
                </li>
                <li className="flex justify-between rounded-lg border border-default px-3 py-2">
                  <span>Same system, off peak window</span>
                  <span className="text-success">0 of 14 failed (0%)</span>
                </li>
                <li className="flex justify-between rounded-lg border border-default px-3 py-2">
                  <span>Same change type, all systems (90d)</span>
                  <span className="text-warning-content">5 of 62 failed (8%)</span>
                </li>
              </ul>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Dependency impact preview
              </h4>
              <p className="text-xs leading-relaxed">
                Touches 1 Tier 0 service and 5 downstream consumers, including Warehouse Management
                (41 NA distribution centres) and Beverages e Commerce. Aggregate exposure during the
                window: approximately $1.2M/hour if the change fails without rollback.
              </p>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Suggested window &amp; rollback readiness
              </h4>
              <div className="rounded-lg bg-success-bg px-3 py-2 text-xs text-success">
                Suggested: Aug 17, 02:00–05:00 CT (off peak, no competing changes, full L2
                coverage).
              </div>
              <ul className="mt-2 space-y-1 text-xs">
                {[
                  ["Verified rollback artefact available", true],
                  ["Backout tested in staging within 7 days", true],
                  ["Owner on bridge for the window", true],
                  ["Post change verification runbook attached", false],
                ].map(([t, ok]) => (
                  <li key={String(t)} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex gap-2 border-t border-default pt-3">
              <Btn
                variant="ok"
                onClick={() => toast.success(`${sel.id} approved for the suggested window`)}
              >
                Accept recommendation
              </Btn>
              <Btn
                variant="outline"
                onClick={() => toast.message(`${sel.id} sent to CAB for review`)}
              >
                Send to CAB
              </Btn>
            </div>
          </>
        )}
      </Drawer>
    </AppShell>
  );
}
