import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DataTable, Kpi, Panel, Pill } from "@/components/kit";
import { integrations } from "@/data/db";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Digital Brain" },
      {
        name: "description",
        content:
          "Connected enterprise systems feeding the agent loop: SAP, ServiceNow, Salesforce, Snowflake, Splunk, AWS and Azure.",
      },
      { property: "og:title", content: "Integrations — Digital Brain" },
      {
        property: "og:description",
        content: "Sync status, volume and connection type for every connected system.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const degraded = integrations.filter((i) => i.status !== "Active");

  return (
    <AppShell>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Connected systems"
          value={String(integrations.length)}
          sub="enterprise sources"
        />
        <Kpi
          label="Healthy connectors"
          value={String(integrations.length - degraded.length)}
          sub="syncing normally"
          tone="ok"
        />
        <Kpi
          label="Degraded"
          value={String(degraded.length)}
          sub="Splunk ingestion lag"
          tone="warn"
        />
        <Kpi label="Daily events ingested" value="3.9M" sub="across all sources" tone="info" />
      </div>

      <Panel
        className="mt-4"
        title="Connected systems"
        desc="Live sync state for every data source in the loop"
        pad={false}
      >
        <DataTable
          rows={integrations}
          rowKey={(i) => i.n}
          cols={[
            { key: "n", header: "System", value: (r) => r.n },
            { key: "type", header: "Connection", value: (r) => r.type },
            { key: "records", header: "Volume", value: (r) => r.records },
            { key: "sync", header: "Last sync", value: (r) => r.sync },
            {
              key: "status",
              header: "Status",
              value: (r) => r.status,
              cell: (r) => <Pill tone={r.status === "Active" ? "ok" : "warn"}>{r.status}</Pill>,
            },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
