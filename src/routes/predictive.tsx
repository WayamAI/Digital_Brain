import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Btn, DataTable, ExportBtn, Kpi, Meter, Panel, axisProps, tooltipStyle, useRunAction } from "@/components/kit";
import { predictionAccuracy, predictions } from "@/data/db";

export const Route = createFileRoute("/predictive")({
  head: () => ({
    meta: [
      { title: "Predictive Operations — Digital Brain" },
      {
        name: "description",
        content:
          "Forecast outages, SLA breaches and capacity bottlenecks with confidence scores, driving signals and preventive actions.",
      },
      { property: "og:title", content: "Predictive Operations — Digital Brain" },
      {
        property: "og:description",
        content: "Two predicted outages, four SLA breaches and three bottlenecks in the next seven days.",
      },
    ],
  }),
  component: Predictive,
});

function Predictive() {
  const [minConf, setMinConf] = useState(50);
  const { running, ranAt, run } = useRunAction();
  const rows = predictions.filter((p) => p.conf >= minConf);

  return (
    <AppShell
      intro="Predictions are advisory: the Predictive Operations Agent never executes preventive change itself. It hands a recommendation and the evidence behind it to an owner."
      actions={
        <>
          <Btn variant="outline" onClick={() => run("Forecast recomputed on the last 90 days of signals")}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Re run forecast
          </Btn>
          <ExportBtn label="Export predictions" />
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Predicted outages (next 7d)" value="2" sub="SAP OM, Azure AD EMEA" tone="crit" />
        <Kpi label="Predicted SLA breaches" value="4" sub="2 within 48 hours" tone="warn" />
        <Kpi label="Predicted capacity bottlenecks" value="3" sub="earliest in 4 weeks" tone="info" />
      </div>

      <Panel
        className="mt-4"
        title="Prediction accuracy — trailing 90 days"
        desc="Predicted vs. actual incident volume per period"
        right={ranAt ? <span className="text-[11px] text-muted-foreground">recomputed {ranAt}</span> : undefined}
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionAccuracy} margin={{ left: -14, right: 8, top: 6 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} strokeDasharray="5 4" />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          Mean absolute error 2.1 incidents per period · model retrained weekly on closed incident outcomes.
        </p>
      </Panel>

      <Panel
        className="mt-4"
        title="Active predictions"
        desc="Filtered live by minimum confidence"
        pad={false}
        right={
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Min confidence {minConf}%
            <input
              type="range"
              min={40}
              max={90}
              value={minConf}
              onChange={(e) => setMinConf(Number(e.target.value))}
              className="w-32 accent-[var(--color-accent)]"
            />
          </label>
        }
      >
        <DataTable
          rows={rows}
          rowKey={(r) => r.p}
          cols={[
            { key: "p", header: "Prediction", cell: (r) => <span className="font-medium">{r.p}</span> },
            {
              key: "conf",
              header: "Confidence",
              cell: (r) => <Meter value={r.conf} tone={r.conf >= 75 ? "crit" : r.conf >= 60 ? "warn" : "info"} />,
            },
            { key: "win", header: "Predicted window" },
            { key: "signals", header: "Driving signals", cell: (r) => <span className="text-muted-foreground">{r.signals}</span> },
            { key: "action", header: "Recommended preventive action" },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
