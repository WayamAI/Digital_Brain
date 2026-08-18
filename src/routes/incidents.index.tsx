import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, DataTable, ExportBtn, Filters, Meter, Panel, Pill } from "@/components/kit";
import { incidents, type Incident } from "@/data/db";
import { scenarios } from "@/data/scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents/")({
  head: () => ({
    meta: [
      { title: "Incident Queue — Digital Brain" },
      {
        name: "description",
        content:
          "Active IT incidents with agent generated root causes, confidence scores, runbook status and autonomy tier ownership.",
      },
      { property: "og:title", content: "Incident Queue — Digital Brain" },
      {
        property: "og:description",
        content:
          "Agent diagnosed incidents across SAP, Salesforce, ServiceNow, Snowflake and Workday.",
      },
    ],
  }),
  component: IncidentQueue,
});

function IncidentQueue() {
  const [f, setF] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const rows = useMemo(
    () =>
      incidents.filter(
        (i) =>
          (!f["sev"] || f["sev"] === "All" || i.sev === f["sev"]) &&
          (!f["status"] || f["status"] === "All" || i.status === f["status"]) &&
          (!f["tier"] || f["tier"] === "All" || i.tier === f["tier"]) &&
          (!f["bu"] || f["bu"] === "All" || i.bu === f["bu"]),
      ),
    [f],
  );

  const open = (id: string) => void navigate({ to: "/incidents/$id", params: { id } });

  return (
    <AppShell
      intro="Incident Resolution Agent owns diagnosis end to end. Anything below 60% confidence is escalated to a named human owner automatically. Open an incident to dispatch the agent pipeline and watch the agents hand off to each other."
      actions={<ExportBtn />}
    >
      <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Open", "5", "text-foreground"],
          ["Auto resolving", "3", "text-ok"],
          ["Escalated", "2", "text-warn-ink"],
          ["Avg confidence on active diagnoses", "87%", "text-foreground"],
        ].map(([l, v, t]) => (
          <div key={l} className="card-surface px-3.5 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{l}</div>
            <div className={cn("num mt-1 text-[22px] font-bold", t)}>{v}</div>
          </div>
        ))}
      </div>

      <Panel
        title="Active incidents"
        desc="Click any row to open the incident and dispatch its agent pipeline"
        pad={false}
      >
        <div className="px-4 pt-3">
          <Filters
            groups={[
              { key: "sev", label: "Severity", options: ["Critical", "High", "Medium", "Low"] },
              {
                key: "status",
                label: "Status",
                options: ["Executing", "Awaiting Approval", "Escalated", "Resolved"],
              },
              { key: "tier", label: "Autonomy tier", options: ["Tier 1", "Tier 2", "Tier 3"] },
              {
                key: "bu",
                label: "Business unit",
                options: ["Frito Lay", "PepsiCo Beverages", "Quaker", "Global Business Services"],
              },
            ]}
            state={f}
            onChange={(k, v) => setF((s) => ({ ...s, [k]: v }))}
            right={
              <span className="text-[11px] text-muted-foreground">{rows.length} incidents</span>
            }
          />
        </div>
        <DataTable<Incident>
          rows={rows}
          rowKey={(r) => r.id}
          onRow={(r) => open(r.id)}
          cols={[
            {
              key: "id",
              header: "Incident",
              cell: (r) => <span className="font-medium">{r.id}</span>,
            },
            {
              key: "service",
              header: "Service",
              cell: (r) => (
                <div>
                  <div>{r.service}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.bu} · {r.region}
                  </div>
                </div>
              ),
            },
            { key: "sev", header: "Severity", cell: (r) => <Pill>{r.sev}</Pill> },
            { key: "detected", header: "Detected" },
            {
              key: "cause",
              header: "Probable root cause (agent)",
              cell: (r) => <span className="text-muted-foreground">{r.cause}</span>,
            },
            {
              key: "confidence",
              header: "Confidence",
              cell: (r) => (
                <Meter
                  value={r.confidence}
                  tone={r.confidence >= 85 ? "ok" : r.confidence >= 60 ? "warn" : "crit"}
                />
              ),
            },
            {
              key: "tier",
              header: "Tier",
              cell: (r) => (
                <Pill tone={r.tier === "Tier 1" ? "ok" : r.tier === "Tier 2" ? "warn" : "human"}>
                  {r.tier}
                </Pill>
              ),
            },
            { key: "owner", header: "Owner" },
            { key: "status", header: "Status", cell: (r) => <Pill>{r.status}</Pill> },
            {
              key: "act",
              header: "Pipeline",
              cell: (r) => (
                <Link
                  to="/incidents/$id"
                  params={{ id: r.id }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Btn size="sm" variant={r.status === "Resolved" ? "outline" : "default"}>
                    <Zap className="h-3 w-3" />
                    {r.status === "Resolved" ? "Replay" : "Dispatch"}
                  </Btn>
                </Link>
              ),
            },
          ]}
        />
      </Panel>

      <Panel
        className="mt-4"
        title="How dispatch works"
        desc="The same loop runs for every incident — what changes is where it is allowed to stop"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              tier: "Tier 1",
              tone: "ok" as const,
              head: "Agent resolves alone",
              body: "The pipeline runs Observe → Report without pausing. Nobody is paged, and the ticket closes itself with the full evidence chain attached.",
              eg: "INC-48198 · INC-48190",
            },
            {
              tier: "Tier 2",
              tone: "warn" as const,
              head: "Agent proposes, human approves",
              body: "The agents investigate, prepare the runbook, then stop at a gate. Approving takes seconds because the investigation is already done.",
              eg: "INC-48213 · INC-48211",
            },
            {
              tier: "Tier 3",
              tone: "info" as const,
              head: "Human owns, agent assists",
              body: "The agents assemble evidence and cost the options, then transfer control to a named human. They do not choose.",
              eg: "INC-48207",
            },
          ].map((c) => (
            <div key={c.tier} className="rounded-lg border border-border p-3">
              <Pill tone={c.tone}>{c.tier}</Pill>
              <div className="mt-2 text-[12.5px] font-semibold">{c.head}</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{c.body}</p>
              <div className="num mt-2 text-[11px] text-muted-foreground">{c.eg}</div>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
