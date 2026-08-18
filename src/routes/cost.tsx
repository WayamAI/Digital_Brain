import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Btn, DataTable, ExportBtn, Filters, Kpi, Panel, Pill, axisProps, tooltipStyle } from "@/components/kit";
import { costOpps, spendByPlatform } from "@/data/db";

export const Route = createFileRoute("/cost")({
  head: () => ({
    meta: [
      { title: "Cost Optimization (FinOps) — Digital Brain" },
      {
        name: "description",
        content:
          "Cloud and SaaS spend by platform, idle resource detection and $186K/month of identified savings with one click approval.",
      },
      { property: "og:title", content: "Cost Optimization (FinOps) — Digital Brain" },
      { property: "og:description", content: "Find, quantify and action cloud waste across AWS, Azure, GCP and SaaS." },
    ],
  }),
  component: Cost,
});

function Cost() {
  const [f, setF] = useState<Record<string, string>>({});
  const [approved, setApproved] = useState<string[]>([]);
  const rows = costOpps.filter((o) => !f["p"] || f["p"] === "All" || o.p === f["p"]);
  const pending = costOpps.filter((o) => !approved.includes(o.r)).reduce((a, b) => a + b.save, 0);

  return (
    <AppShell
      intro="The FinOps Agent never terminates production resources. Everything below is a proposal with a named owner, a snapshot and a reversible path."
      actions={<ExportBtn label="Export savings plan" />}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Monthly cloud spend" value="$2.40M" sub="AWS · Azure · GCP · SaaS" tone="info" trend="↑ 1.6% MoM" />
        <Kpi label="Identified savings" value="$186K/mo" sub="across 128 resources" tone="ok" />
        <Kpi label="Realised savings YTD" value="$1.42M" sub="from 940 actioned items" tone="ok" trend="↑ $71K" />
        <Kpi label="Still unactioned" value={`$${pending}K/mo`} sub={`${costOpps.length - approved.length} opportunities`} tone="warn" />
      </div>

      <Panel className="mt-4" title="Spend by platform" desc="US$ thousands per month, trailing 12 months">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByPlatform} margin={{ left: -10, right: 8, top: 6 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} formatter={(v: number | string) => [`$${v}K`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="aws" name="AWS" stackId="s" fill="var(--color-chart-1)" />
              <Bar dataKey="azure" name="Azure" stackId="s" fill="var(--color-chart-2)" />
              <Bar dataKey="gcp" name="GCP" stackId="s" fill="var(--color-chart-3)" />
              <Bar dataKey="saas" name="SaaS" stackId="s" fill="var(--color-chart-4)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="mt-4" title="Optimization opportunities" desc="Ranked by monthly savings" pad={false}>
        <div className="px-4 pt-3">
          <Filters
            groups={[{ key: "p", label: "Platform", options: ["AWS", "Azure", "GCP", "SaaS"] }]}
            state={f}
            onChange={(k, v) => setF((s) => ({ ...s, [k]: v }))}
            right={<span className="text-[11px] text-muted-foreground">{rows.length} opportunities</span>}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.r}
          cols={[
            { key: "r", header: "Resource", cell: (r) => <span className="font-medium">{r.r}</span> },
            { key: "p", header: "Platform", cell: (r) => <Pill>{r.p}</Pill> },
            { key: "issue", header: "Issue", cell: (r) => <span className="text-muted-foreground">{r.issue}</span> },
            { key: "cost", header: "Monthly cost", cell: (r) => <span className="num">${r.cost}K</span> },
            { key: "rec", header: "Recommendation" },
            { key: "save", header: "Potential saving", cell: (r) => <span className="num font-semibold text-ok">${r.save}K/mo</span> },
            {
              key: "act",
              header: "",
              cell: (r) =>
                approved.includes(r.r) ? (
                  <Pill tone="ok">Approved</Pill>
                ) : (
                  <Btn
                    variant="ok"
                    size="sm"
                    onClick={() => {
                      setApproved((s) => [...s, r.r]);
                      toast.success(`Approved — $${r.save}K/mo saving scheduled`, { description: r.r });
                    }}
                  >
                    Approve
                  </Btn>
                ),
            },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
