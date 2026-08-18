# PepsiCo Ops Console

Digital Brain — Agentic IT Operations Platform for PepsiCo | App Prototype Build Prompt

What This Application Is

A cloud-based Agentic IT Operations platform built for PepsiCo's Global IT organization. Digital Brain is a "closed-loop" AI operations system: a fleet of specialized autonomous agents that continuously observe the IT estate, understand what's happening, decide what to do, act on it (with human approval where required), learn from outcomes, and report to leadership.

This is a fully functional, production-grade internal application prototype for PepsiCo IT Operations (covering enterprise systems across PepsiCo Beverages, Frito-Lay, Quaker, and Global Business Services). Every screen must have realistic data, working navigation, interactive charts, and functional workflows. No placeholder text. No empty states. No "coming soon" screens. When someone opens this, they should think "this is how PepsiCo actually runs IT Ops" — not "this is a concept."

All data in this build is synthetic/illustrative and must be clearly usable as a demo — no real PepsiCo system credentials, real incident data, or real employee names should be implied as authentic; treat all names, tickets, and figures as realistic-but-fictional.

Application Name

Digital Brain — subtitle: Agentic IT Operations for PepsiCo

Look and Feel

Clean, enterprise command-center aesthetic — think a NOC (Network Operations Center) wall crossed with a modern SaaS console. Confident, calm, built for operators who are watching this screen during an incident at 2 AM.

Color palette: PepsiCo-inspired cool palette — deep PepsiCo blue primary (#004B93), electric blue accent (#0078D4), white content backgrounds, light gray (#F5F7FA) section fills. A restrained red accent (#E32934) reserved only for critical/PepsiCo-brand moments (logo mark, critical severity), so it doesn't compete with status colors. Status colors: green (#2AA876) healthy/auto-resolved, amber (#F2A93B) warning/awaiting approval, red (#D64550) critical/breach.

Layout: Left sidebar navigation (collapsible, icon + label, dark navy #0B1D33 background), sticky top header with breadcrumb, live sync indicator, and user/role info, main content area in light mode.

Typography: Sharp sans-serif (Inter or similar). Large KPI numbers in bold with small trend arrows. Table data at 13–14px. Muted gray labels/captions.

Tables: Dense, sortable, enterprise-grade. Inline status badges. Column filters. Row hover states.

Charts: Flat, clean, professional (Recharts). Muted gridlines, hover tooltips. No 3D, no gradient fills. Color used to distinguish autonomy tiers and severity, never decoratively.

Density: Information-dense but structured — this is a tool operators live in during their shift, not a marketing dashboard.

Mode: Light mode.

User Roles & Authentication

Login screen with a role selector for demo purposes. Four roles:

IT Operator (L1/L2) — Monitors the Control Tower, works the incident and approval queues, day-to-day agent interaction

IT Ops Manager — Oversees SLAs, capacity, vendor performance, team workload, approves higher-risk actions

Platform Engineer — Configures agents, autonomy thresholds, integrations, runbooks

CIO / Executive — Views the Executive Operations Briefing, cost, compliance, and risk posture only

Default to IT Ops Manager so all screens are accessible. Show role badge in the top-right user menu. Login routes directly to the Control Tower.

Global Navigation Structure (Left Sidebar)

Control Tower (home/landing screen)

Operate
 └── Incident Queue
 └── Approval Queue (human-in-the-loop)
 └── Alert Noise Reduction
 └── Problem Management
 └── Operations Copilot

Understand
 └── Root Cause Investigation
 └── Dependency Impact Map
 └── Knowledge Assistant

Predict & Plan
 └── Service Health Monitor
 └── Predictive Operations
 └── Change Risk Advisor
 └── Capacity Planning

Cost & Vendors
 └── Cost Optimization (FinOps)
 └── Vendor Performance

Governance
 └── Compliance Operations
 └── Executive Operations Briefing

Platform
 └── Agent Fleet (15 agents)
 └── Autonomy Model & Guardrails
 └── Integrations
 └── Users & Roles


Sidebar sections collapsible. Active page highlighted. Alert badges: "Incident Queue" (e.g., badge "5"), "Approval Queue" (e.g., badge "2"), "Compliance Operations" (e.g., badge "1" for an open exception).

Screen-by-Screen Specification

Screen 1 — Control Tower (Home)

The landing screen. What an IT Ops Manager checks the moment they sit down.

Top status banner: "All systems nominal" health pill, shift context ("PepsiCo Global IT Operations · Follow-the-sun L2 · APAC shift active"), live sync ticker ("synced 6s ago").

Row 1 — 6 KPI cards:

Open Incidents: 5 (2 critical, red)

Auto-Resolved Today (Tier 1): 41 (green, zero human touches)

Awaiting Approval (Tier 2): 2 (amber, oldest waiting 4 min)

Median MTTR: 27 min vs. 3h 40m team baseline (green, ↓ 88%)

Alert Noise Suppressed: 3,870 / 4,182 raw alerts (92.5%)

Change Success Rate (30d): 96.2% (green, ↑ 1.4%)

Row 2 — two charts:

Left: Incidents resolved, last 24 hours (stacked bar, 2-hour buckets) — split by autonomy tier (Tier 1 agent-only / Tier 2 agent+approval / Tier 3 human-led)

Right: "Where the work goes" (horizontal bar) — Tier 1: 72%, Tier 2: 23%, Tier 3: 5% (annotated: "Tier 3 is 5% of volume but ~25% of team hours — the work worth protecting")

Row 3 — "The Loop" live pipeline visualization: a left-to-right stage flow (Detect → Correlate → Diagnose → Recommend → Approve/Act → Verify → Learn) showing live counts of items currently in each stage, each stage consuming the prior stage's output.

Row 4 — three panels:

Needs You — the human-attention queue: item, agent, why it's escalated, age, quick "Review" action

Top 5 stock-out-equivalent risks (reframe: "Top 5 SLA-breach risks") — service, minutes to breach, business impact, "Investigate" action

Agent fleet health — 15/15 healthy, grouped by pipeline stage, mini status dots

Row 5 — Accountability strip: "Accountability transferred to agents: 0%" with explainer tooltip — every autonomous action is attributable to a named human owner or a pre-approved policy (compliance/audit framing).

Quick actions: "Open Incident Queue" · "Review Approval Queue" · "View Executive Briefing"

Screen 2 — Incident Queue (Incident Resolution Agent)

Header: Open: 5 · Auto-resolving: 3 · Escalated: 2 · Avg confidence on active diagnoses: 87%

Table — Active Incidents:

Incident ID Service Severity Detected Probable Root Cause (agent) Confidence Runbook Status Owner Status INC-48213 SAP ERP – Order Mgmt (Frito-Lay NA) 🔴 Critical 6 min ago Deploy at 14:02 UTC correlated with DB connection pool exhaustion 94% Auto-executing rollback Agent (Tier 1) Executing INC-48211 Salesforce – Field Sales App (LatAm) 🟡 High 22 min ago Auth token refresh failure post cert rotation 71% Suggested fix — awaiting approval R. Alvarez Awaiting Approval INC-48207 ServiceNow – ITSM Portal (Global) 🟡 High 41 min ago Elevated latency, no clear correlation 38% Escalated — low confidence J. Kim Escalated INC-48198 Snowflake – Beverages Analytics 🟢 Low 1h 12m ago Warehouse auto-suspend misconfig 96% Auto-resolved Agent (Tier 1) Resolved INC-48190 Workday – HR Self-Service (Global) 🟢 Low 2h 05m ago Scheduled maintenance overlap 91% Auto-resolved Agent (Tier 1) Resolved

Sortable, filterable by severity/service/status. Click a row → Incident Detail view:

Correlated signals: logs, metrics, traces, recent deployments/changes (timeline)

Agent's reasoning trail (plain-language "why I think this is the cause")

Recommended/executed runbook steps

"Approve action" / "Reject & reassign" buttons (Tier 2 items)

Confidence threshold note: "Escalates automatically below 60% confidence"

Screen 3 — Approval Queue (Human-in-the-loop)

Queue of Tier 2 items where the agent proposes but a human must approve before execution.

Table: Item, Agent, Proposed Action, Risk Level, Business Impact if wrong, Waiting since, Approve / Reject buttons.

Example rows:

Restart production SAP application server (Frito-Lay NA) — Risk: Medium — waiting 4 min

Rotate expired API credential for Salesforce integration (LatAm) — Risk: Low — waiting 11 min

Detail drawer on click: full context, blast radius, rollback plan, similar past approvals and their outcomes ("Last 5 times this action was approved: 5/5 successful").

Screen 4 — Alert Noise Reduction

Summary: Raw alerts (24h): 4,182 · Suppressed as duplicate/noise: 3,870 (92.5%) · Surfaced to humans: 63 · False-positive rate (trailing 30d): 3.1%

Chart: Alert volume — raw vs. surfaced (area chart, 7 days)

Table — Suppression Rules Active: Rule name, pattern matched, alerts suppressed (24h), last tuned, status (active/paused).

Table — Correlated Clusters (live): Cluster, root alert, related alerts folded in, affected service, priority score.

Screen 5 — Problem Management (Problem Management Agent)

Summary: Recurring incident patterns detected (30d): 9 · Problem records auto-opened: 6 · Permanent fixes shipped: 3

Table — Problem Records:

Problem ID Pattern Occurrences (30d) Affected Service Recommended Permanent Fix Status PRB-1042 DB connection pool exhaustion under peak load 7 SAP ERP – Order Mgmt Increase pool size + add circuit breaker In Progress PRB-1038 Cert rotation breaks OAuth token cache 4 Salesforce integrations Automate cache bust on rotation Fix Shipped PRB-1031 Snowflake warehouse auto-suspend during batch jobs 5 Beverages Analytics Adjust auto-suspend policy for batch windows Fix Shipped

Click → clustered incident list, timeline, and root-cause writeup.

Screen 6 — Operations Copilot

Chat-style workspace for operators. Left: conversation with the Copilot. Right: context panel (active incident, relevant runbooks, related tickets).

Copilot capabilities shown via example prompts/responses:

"Draft a status update for INC-48213 for the exec Slack channel" → generates draft

"Summarize the last 20 minutes of the bridge call" → generates summary with action items

"What's the postmortem template for a P1?" → pulls template

"Update ServiceNow ticket INC-48213 with the rollback status" → confirms auto-update

Bottom: Recent Copilot Actions log — drafted updates, generated postmortems, tickets updated, timestamps.

Screen 7 — Root Cause Investigation

Search/select an incident → full investigation workspace.

Event timeline (horizontal): deployments, config changes, alerts, and tickets plotted together for the incident window.

Evidence panel: logs excerpt, metric spike chart, trace waterfall, "recent changes" list with diff links.

Agent conclusion card: Most likely root cause, confidence %, supporting evidence bullets, "Generate Post-Incident Report" button → produces a structured PIR (summary, timeline, root cause, impact, remediation, action items) as a downloadable doc.

Screen 8 — Dependency Impact Map

Service selector at top (e.g., "SAP ERP – Order Management").

Graph view (center): node-link diagram — selected service in the center, upstream dependencies and downstream consumers radiating out, color-coded by current health.

Side panel on node click: service owner, criticality tier, business processes affected (e.g., "Order-to-Cash — Frito-Lay NA"), estimated revenue-at-risk per hour of downtime, current status.

"Simulate outage" button: pick a node → highlights the full blast radius and lists affected downstream apps/business processes with estimated impact.

Screen 9 — Knowledge Assistant

Natural-language Q&A interface over runbooks, architecture docs, incident history, and SOPs.

Example interaction shown pre-filled:

Q: "Why did the SAP Order Management service fail yesterday?" A: Summarized answer citing INC-48213, the correlated deployment, the runbook used, and resolution time — with linked sources (runbook doc, incident ticket, architecture diagram).

Sidebar: Suggested questions, recently asked questions (team-wide), source library browser (Runbooks / Architecture Docs / SOPs / Past Incidents) with document counts.

Screen 10 — Service Health Monitor (Service Health Agent)

Service list (left): all monitored services grouped by business unit — PepsiCo Beverages, Frito-Lay, Quaker, Global Business Services — each with a live health dot.

Selected service detail (right):

Health score trend (line chart, 30 days)

Degradation prediction: "62% probability of latency breach in next 4 hours based on current trend" with recommended preventive action

Recent executive health summary (auto-generated paragraph)

Table — Service Health Summary: Service, BU, Current Health, 7-day trend, Predicted Risk (next 24h), Owner.

Screen 11 — Predictive Operations

Summary cards: Predicted outages (next 7d): 2 · Predicted SLA breaches: 4 · Predicted capacity bottlenecks: 3

Chart — Prediction accuracy over time (line, trailing 90 days) — predicted vs. actual incident volume.

Table — Active Predictions:

Prediction Confidence Predicted Window Driving Signals Recommended Preventive Action Storage capacity breach — Snowflake Beverages Analytics 83% Next 5 days Growth trend + seasonal Q3 promo analytics load Pre-provision +20% storage SLA breach — ServiceNow ITSM Portal response time 71% Next 48 hours Rising ticket volume, degrading response time trend Scale portal instance ahead of peak

Screen 12 — Change Risk Advisor (Change Risk Agent)

Upcoming changes table: Change ID, System, Description, Requested window, Predicted failure risk (%), Recommendation (Proceed / Reschedule / Add rollback plan), Approver.

Example: "CHG-3391 — SAP ERP patch (Frito-Lay NA) — Risk: 34% (elevated) — Recommendation: Reschedule outside peak order-processing window (currently overlaps 10am–2pm CT order surge)."

Detail drawer: historical failure rate for similar changes, dependency impact preview, suggested deployment window, rollback readiness checklist.

Screen 13 — Capacity Planning (Capacity Planning Agent)

Charts: CPU / Memory / Storage / Cloud spend trend (last 90 days) per major platform (SAP, Snowflake, Salesforce infra, AWS, Azure).

Table — Capacity Recommendations:

Resource Current Utilization Growth Trend (90d) Forecast Breach Date Recommendation AWS compute — Beverages e-commerce 78% ↑ 3.2%/mo 6 weeks Scale up 25% ahead of holiday promo season Snowflake storage — Global Analytics 71% ↑ 5.1%/mo 8 weeks Add storage tier / archive cold data Azure compute — Frito-Lay Supply Ops 64% Stable — No action needed

Screen 14 — Cost Optimization (FinOps) (Cost Optimization Agent)

Top metrics: Monthly cloud spend: $2.4M · Idle resources identified: 128 · Potential monthly savings: $186K · Savings realized YTD: $1.1M

Chart: Cloud spend by platform (AWS / Azure / GCP / SaaS) — stacked bar, 12 months.

Table — Optimization Opportunities:

Resource Platform Issue Monthly Cost Recommendation Potential Savings EC2 fleet — dev/test (Beverages) AWS Idle nights/weekends, no auto-scaling $41K Schedule shutdown outside business hours $18K/mo Overprovisioned SQL DB — Quaker Reporting Azure 12% avg utilization $22K Downsize tier $14K/mo Unused reserved instances AWS 34 RIs unused 60+ days $9K Reallocate or sell back $9K/mo

Screen 15 — Vendor Performance (Vendor Performance Agent)

Table — Vendor Scorecard: Vendor, Service Provided, SLA Compliance %, Avg. Response Time, Incidents (30d), Risk Trend, Composite Score.

Example vendors: Accenture (Managed Services), Infosys (App Support), AWS (Cloud Infra), Microsoft (Azure/M365), Salesforce (CRM Platform), SAP (ERP Support), ServiceNow (ITSM Platform), Zscaler (Network Security).

Chart: SLA compliance trend by vendor (line, 12 months).

Detail drawer: SLA terms, breach history, predicted risk narrative ("Infosys App Support has trended down 6% over 2 months — recommend QBR").

Screen 16 — Compliance Operations (Compliance Operations Agent)

Summary: Policy compliance score: 94% · Configuration drift detected: 7 items · Open security exceptions: 1 (badge)

Table — Compliance Findings: System, Policy, Finding, Severity, Detected, Status, Evidence link ("Audit-ready evidence package" download).

Chart: Compliance score trend (line, 12 months) with target line at 97%.

Screen 17 — Executive Operations Briefing (Executive Operations Agent)

Auto-generated every morning — designed to be read in under 2 minutes.

Sections, each a compact card:

Top Incidents (last 24h) — count + 1-line summaries

SLA Risks — services at risk this week

Business Impact — estimated revenue/operational impact of open issues

Cost Anomalies — unexpected spend spikes

High-Risk Changes — upcoming changes flagged elevated risk

Capacity Forecast — one-line outlook per major platform

"Export as PDF" and "Send to Leadership Distro" buttons.

Screen 18 — Agent Fleet

Grid of 15 agent cards, grouped by pipeline stage (Observe / Understand / Decide / Act / Learn / Report):

Incident Resolution Agent

Service Health Agent

Change Risk Agent

Capacity Planning Agent

Cost Optimization (FinOps) Agent

Knowledge Assistant Agent

Problem Management Agent

Executive Operations Agent

Vendor Performance Agent

Alert Noise Reduction Agent

Root Cause Investigation Agent

Operations Copilot

Dependency Impact Agent

Compliance Operations Agent

Predictive Operations Agent

Each card: status (healthy/degraded), actions taken today, autonomy tier it typically operates at, last learning update. Click → agent detail page with performance history and a plain-language description of what it does and its guardrails.

Screen 19 — Autonomy Model & Guardrails

Explains and configures the Tier 1 / Tier 2 / Tier 3 model:

Tier 1 — Agent resolves alone (confidence above threshold, low blast radius)

Tier 2 — Agent proposes, human approves (medium risk/impact)

Tier 3 — Human owns, agent assists (high risk, novel, or low confidence)

Configurable thresholds panel: confidence % cutoffs per action type, blast-radius rules, always-Tier-3 action list (e.g., "production database schema changes," "customer-facing payment systems").

Accountability ledger: every autonomous action logged with owner-of-record, policy applied, and outcome — searchable, exportable for audit.

Screen 20 — Integrations

Integration cards (8–10): system name, status (🟢 Active / 🟡 Degraded / 🔴 Disconnected), last sync, records synced, sync type.

Systems: SAP ERP, Salesforce, ServiceNow, Workday, Snowflake, Splunk, Datadog, AWS, Azure, Microsoft 365 / Teams (for Copilot notifications).

Realistic Data Requirements

Systems/services: SAP ERP (Order Management, Finance), Salesforce (Field Sales, Service Cloud), ServiceNow (ITSM Portal), Workday (HR Self-Service), Snowflake (Analytics per BU), AWS/Azure infrastructure, e-commerce platforms, Kronos/Workforce systems.

Business units: PepsiCo Beverages, Frito-Lay, Quaker, Global Business Services — used to tag services, incidents, and impact.

Regions: North America, LatAm, EMEA, APAC — used for shift context and incident origin.

Vendors: Accenture, Infosys, AWS, Microsoft, Salesforce, SAP, ServiceNow, Zscaler, TCS, Wipro.

Financial values: Cloud spend in the low millions/month, savings opportunities in the tens-to-hundreds of thousands, all in USD.

Volumes: ~4,000 raw alerts/day, 40–60 incidents/day (mostly auto-resolved), 15 agents, 200–400 changes/month.

Interactions & Functional Behavior

All tables sortable by column header click

All charts show tooltips on hover with exact values

Filters on each screen update charts and tables on that page simultaneously

"Run" / "Re-analyze" actions show a brief loading animation (~2–3s) then refresh results

Approve/Reject actions in the Approval Queue update the Control Tower KPIs live

The Loop pipeline visualization animates item counts moving between stages

Dependency graph is pannable/zoomable; clicking a node updates the side panel

All "Export to PDF/CSV" buttons show a success toast

Sidebar alert badges reflect live counts

Login screen routes correctly to the Control Tower based on selected role

Breadcrumb updates correctly on every screen

What This Application Is NOT

Not a marketing website — a functional internal operations tool

No "Lorem ipsum" or placeholder text anywhere

No empty states — every screen has data

No "coming soon" pages — every nav item leads to a working screen

No onboarding tooltips or tutorial overlays

No "Upgrade to Pro" or pricing CTAs

No stock photography

Not a supply-chain / MRP / inventory tool — this is IT Operations only

This should look like a tool PepsiCo Global IT has been running in production for two years — not a concept mockup.

---

## Design system

Inherited from the JoulesToWatts Auto Ops front end so the products read as one family.

| | |
|---|---|
| **Primary** | Teal `hsl(171 100% 29%)` — primary action, success and Tier 1 are the same colour |
| **Brand red** | `#B92534`, sampled from the JoulesToWatts mark — logo and critical severity only |
| **Accent** | Blue `hsl(210 80% 55%)` — links, focus and "in progress", kept distinct from success |
| **Tiers** | Tier 1 teal `#009481` · Tier 2 amber `#F59E0B` · Tier 3 indigo `#3F51B5` |
| **Typography** | Manrope (200–800) + JetBrains Mono for timestamps, IDs and metrics |
| **Dark mode** | True neutral dark — `#0f0f0f` / `#1a1a1a` / `#262626` / `#333`, brand teal lifted to `#2fb5a1` |

Tier 3 is indigo rather than the more obvious orange because amber↔orange scored ΔE 9.6 against a
floor of 15 — the two were hard to separate even with full colour vision. Chart fills use their own
slightly darker steps in dark mode, since fills on a black ground need a different lightness band.

All colours live as tokens in `src/styles.css`. Never hardcode a colour in a component.

---

## Development

You need Node.js 22 or newer.

```sh
npm install
npm run dev          # http://localhost:8080
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build → `.output/` (Nitro `node-server` preset) |
| `npm start` | Run the built server: `node .output/server/index.mjs` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Project shape

```
src/
  data/db.ts          all synthetic data — one source of truth
  data/scenarios.ts   agent dispatch pipelines, one per incident
  components/kit.tsx  the design system primitives (Panel, Kpi, DataTable, Pill, Drawer)
  components/         app-shell.tsx, agent-pipeline.tsx
  routes/             file-based routes; routeTree.gen.ts is generated, do not edit
  styles.css          design tokens
```

---

## Deploying

The build produces a standard Node server, so anything that runs a container will host it.

### Docker

```sh
docker compose up --build        # http://localhost:8080
```

### Render

Deploy as a **Web Service** with `Docker` as the runtime — Render reads the `Dockerfile`
at the repo root and needs no build or start command. It injects `PORT`, which the server
honours.

| Field | Value |
|---|---|
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Health check path | `/` |
| Auto-Deploy | On |

A Free-tier web service sleeps after ~15 minutes idle and takes around 50 seconds to wake — fine
for internal review, worth upgrading to Starter before putting it in front of a client.
