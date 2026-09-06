import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, Drawer, ExportBtn, KeyVals, Kpi, Panel, Pill } from "@/components/kit";
import { problems } from "@/data/db";

export const Route = createFileRoute("/problems")({
  head: () => ({
    meta: [
      { title: "Problem Management — Digital Brain" },
      {
        name: "description",
        content:
          "Recurring incident patterns clustered into problem records with recommended permanent fixes and shipping status.",
      },
      { property: "og:title", content: "Problem Management — Digital Brain" },
      {
        property: "og:description",
        content: "Nine recurring patterns detected in 30 days; six problem records auto opened.",
      },
    ],
  }),
  component: Problems,
});

type P = (typeof problems)[number];

function Problems() {
  const [sel, setSel] = useState<P | null>(null);

  return (
    <AppShell
      intro="The Problem Management Agent watches for repeat signatures across incidents and opens a problem record when a pattern is statistically real, not coincidental."
      actions={<ExportBtn label="Export problem register" />}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi
          label="Recurring patterns detected (30d)"
          value="9"
          sub="across 214 services"
          tone="info"
        />
        <Kpi
          label="Problem records auto opened"
          value="6"
          sub="3 pending engineering triage"
          tone="warn"
        />
        <Kpi
          label="Permanent fixes shipped"
          value="3"
          sub="14 incidents/mo prevented"
          tone="ok"
          trend="↑ 2"
        />
      </div>

      <Panel
        className="mt-4"
        title="Problem records"
        desc="Click a record for the clustered incidents and root cause writeup"
        pad={false}
      >
        <DataTable<P>
          rows={problems}
          rowKey={(r) => r.id}
          onRow={setSel}
          cols={[
            {
              key: "id",
              header: "Problem",
              cell: (r) => <span className="font-medium">{r.id}</span>,
            },
            { key: "pattern", header: "Pattern" },
            { key: "occ", header: "Occurrences (30d)", align: "right" },
            { key: "service", header: "Affected service" },
            {
              key: "fix",
              header: "Recommended permanent fix",
              cell: (r) => <span className="text-tertiary">{r.fix}</span>,
            },
            { key: "status", header: "Status", cell: (r) => <Pill>{r.status}</Pill> },
          ]}
        />
      </Panel>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `${sel.id} · ${sel.pattern}` : ""}
        subtitle={sel?.service}
      >
        {sel && (
          <>
            <KeyVals
              items={[
                ["Status", <Pill key="s">{sel.status}</Pill>],
                ["Occurrences (30d)", String(sel.occ)],
                ["Permanent fix", sel.fix],
                ["Owner", "Platform Engineering — Enterprise Apps"],
              ]}
            />
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Root cause writeup
              </h4>
              <p className="rounded-lg bg-action px-3 py-2 text-xs leading-relaxed">
                {sel.writeup}
              </p>
            </section>
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Clustered incidents
              </h4>
              <ol className="relative space-y-2 border-l border-default pl-4">
                {sel.incidents.map((i, idx) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-info" />
                    <span className="text-xs font-medium">{i}</span>
                    <span className="ml-2 text-2xs text-tertiary">
                      {idx === 0 ? "most recent · today" : `${idx * 4 + 2} days ago`}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </Drawer>
    </AppShell>
  );
}
