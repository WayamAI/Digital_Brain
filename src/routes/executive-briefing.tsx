import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Boxes, CalendarClock, Gauge, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Btn, ExportBtn, Kpi, Panel, Pill } from "@/components/kit";
import { execBriefing } from "@/data/db";

export const Route = createFileRoute("/executive-briefing")({
  head: () => ({
    meta: [
      { title: "Executive Operations Briefing — Digital Brain" },
      {
        name: "description",
        content:
          "Daily auto generated leadership briefing: incidents, SLA risk, business impact, cost, change risk and capacity outlook.",
      },
      { property: "og:title", content: "Executive Operations Briefing — Digital Brain" },
      {
        property: "og:description",
        content: "One page leadership summary composed by the Executive Operations Agent each morning.",
      },
    ],
  }),
  component: BriefingPage,
});

function Section({
  icon,
  title,
  items,
  tone,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  tone: "ok" | "warn" | "crit" | "info";
}) {
  return (
    <Panel
      title={title}
      right={<Pill tone={tone}>{items.length} points</Pill>}
      desc={undefined}
    >
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed">
            <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function BriefingPage() {
  return (
    <AppShell>
      <div className="card-surface mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Pill tone="info">Auto generated 06:40 UTC</Pill>
        <span className="text-[12px] text-muted-foreground">
          {execBriefing.date} · PepsiCo Global IT · Composed by the Executive Operations Agent from 15 agent feeds
        </span>
        <div className="ml-auto flex gap-2">
          <ExportBtn label="Export PDF" />
          <Btn size="sm">Send to distribution list</Btn>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open Sev-1 / Sev-2" value="3" sub="1 rolling back" tone="warn" />
        <Kpi label="Revenue exposure" value="$410K/hr" sub="if OM degrades further" tone="crit" />
        <Kpi label="Unactioned savings" value="$186K/mo" sub="128 idle resources" tone="info" />
        <Kpi label="Autonomous resolution" value="68%" sub="of 24h volume" tone="ok" trend="+4pt" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Section icon={<AlertTriangle className="h-3.5 w-3.5" />} title="Major incidents" items={execBriefing.incidents} tone="crit" />
        <Section icon={<ShieldAlert className="h-3.5 w-3.5" />} title="SLA risks" items={execBriefing.slaRisks} tone="warn" />
        <Section icon={<Gauge className="h-3.5 w-3.5" />} title="Business impact" items={execBriefing.impact} tone="info" />
        <Section icon={<Banknote className="h-3.5 w-3.5" />} title="Cost signals" items={execBriefing.cost} tone="info" />
        <Section icon={<CalendarClock className="h-3.5 w-3.5" />} title="Change risk" items={execBriefing.changes} tone="warn" />
        <Section icon={<Boxes className="h-3.5 w-3.5" />} title="Capacity outlook" items={execBriefing.capacity} tone="ok" />
      </div>
    </AppShell>
  );
}
