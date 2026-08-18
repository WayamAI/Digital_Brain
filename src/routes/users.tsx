import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DataTable, ExportBtn, Kpi, Panel, Pill } from "@/components/kit";
import { users } from "@/data/db";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Digital Brain" },
      {
        name: "description",
        content:
          "Operators, engineers, managers and executives with access to Digital Brain, their business unit and approval authority.",
      },
      { property: "og:title", content: "Users & Roles — Digital Brain" },
      {
        property: "og:description",
        content: "Role based access across Global IT, Frito Lay, Beverages, Quaker and GBS.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const approvers = users.filter((u) => u.approvals > 0);

  return (
    <AppShell>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active users" value={String(users.length)} sub="4 business units" />
        <Kpi label="Approvers" value={String(approvers.length)} sub="can action Tier 2" tone="info" />
        <Kpi label="Active now" value="2" sub="APAC shift" tone="ok" />
        <Kpi label="Roles configured" value="4" sub="Operator, Engineer, Manager, CIO" tone="muted" />
      </div>

      <Panel
        className="mt-4"
        title="Users & roles"
        desc="Access, business unit and approval authority"
        right={<ExportBtn label="Export access review" />}
        pad={false}
      >
        <DataTable
          rows={users}
          rowKey={(u) => u.n}
          cols={[
            { key: "n", header: "Name", value: (r) => r.n },
            {
              key: "r",
              header: "Role",
              value: (r) => r.r,
              cell: (r) => <Pill tone={r.r.includes("CIO") ? "info" : "muted"}>{r.r}</Pill>,
            },
            { key: "bu", header: "Business unit", value: (r) => r.bu },
            { key: "region", header: "Region", value: (r) => r.region },
            { key: "approvals", header: "Approvals (90d)", value: (r) => r.approvals, align: "right" },
            {
              key: "last",
              header: "Last active",
              value: (r) => r.last,
              cell: (r) => (
                <span className={r.last === "Active now" ? "text-ok" : "text-muted-foreground"}>{r.last}</span>
              ),
            },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
