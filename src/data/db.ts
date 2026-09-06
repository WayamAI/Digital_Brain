// Synthetic / illustrative demo data for the Digital Brain prototype.
// Nothing here is real PepsiCo data — all names, tickets and figures are fictional.

export type Sev = "Critical" | "High" | "Medium" | "Low";
export type Tier = "Tier 1" | "Tier 2" | "Tier 3";

export const BUS = [
  "PepsiCo Beverages",
  "Frito Lay",
  "Quaker",
  "Global Business Services",
] as const;

export const ROLES = [
  {
    id: "operator",
    name: "IT Operator (L1/L2)",
    who: "Sana Q.",
    desc: "Control Tower, incident + approval queues, day to day agent work",
  },
  {
    id: "manager",
    name: "IT Ops Manager",
    who: "R. Alvarez",
    desc: "SLAs, capacity, vendors, team workload, higher risk approvals",
  },
  {
    id: "engineer",
    name: "Platform Engineer",
    who: "J. Kim",
    desc: "Agent config, autonomy thresholds, integrations, runbooks",
  },
  {
    id: "exec",
    name: "CIO / Executive",
    who: "M. Delgado",
    desc: "Executive briefing, cost, compliance and risk posture",
  },
] as const;

export const kpis = [
  {
    label: "Open Incidents",
    value: "5",
    sub: "2 critical",
    tone: "crit" as const,
    trend: "+1 vs. yesterday",
  },
  {
    label: "Auto Resolved Today (Tier 1)",
    value: "41",
    sub: "zero human touches",
    tone: "ok" as const,
    trend: "↑ 12%",
  },
  {
    label: "Awaiting Approval (Tier 2)",
    value: "2",
    sub: "oldest waiting 4 min",
    tone: "warn" as const,
    trend: "SLA 15 min",
  },
  {
    label: "Median MTTR",
    value: "27 min",
    sub: "vs. 3h 40m team baseline",
    tone: "ok" as const,
    trend: "↓ 88%",
  },
  {
    label: "Alert Noise Suppressed",
    value: "92.5%",
    sub: "3,870 of 4,182 raw alerts",
    tone: "info" as const,
    trend: "↑ 0.8%",
  },
  {
    label: "Change Success Rate (30d)",
    value: "96.2%",
    sub: "312 changes executed",
    tone: "ok" as const,
    trend: "↑ 1.4%",
  },
];

export const resolved24h = [
  { t: "00:00", tier1: 4, tier2: 1, tier3: 0 },
  { t: "02:00", tier1: 3, tier2: 1, tier3: 1 },
  { t: "04:00", tier1: 5, tier2: 0, tier3: 0 },
  { t: "06:00", tier1: 6, tier2: 2, tier3: 0 },
  { t: "08:00", tier1: 9, tier2: 3, tier3: 1 },
  { t: "10:00", tier1: 11, tier2: 4, tier3: 1 },
  { t: "12:00", tier1: 8, tier2: 3, tier3: 0 },
  { t: "14:00", tier1: 12, tier2: 4, tier3: 2 },
  { t: "16:00", tier1: 7, tier2: 2, tier3: 1 },
  { t: "18:00", tier1: 6, tier2: 2, tier3: 0 },
  { t: "20:00", tier1: 5, tier2: 1, tier3: 1 },
  { t: "22:00", tier1: 4, tier2: 1, tier3: 0 },
];

export const workSplit = [
  { tier: "Tier 1 — agent only", pct: 72, hours: 18 },
  { tier: "Tier 2 — agent + approval", pct: 23, hours: 57 },
  { tier: "Tier 3 — human led", pct: 5, hours: 25 },
];

export const loopStages = [
  { stage: "Detect", count: 312, note: "signals in window" },
  { stage: "Correlate", count: 63, note: "clusters formed" },
  { stage: "Diagnose", count: 11, note: "active hypotheses" },
  { stage: "Recommend", count: 7, note: "runbooks proposed" },
  { stage: "Approve / Act", count: 5, note: "2 awaiting human" },
  { stage: "Verify", count: 4, note: "post action checks" },
  { stage: "Learn", count: 3, note: "model updates queued" },
];

export type NeedsYouItem = {
  item: string;
  agent: string;
  why: string;
  age: string;
  to: string;
  /** Set when the item is an incident with a dispatchable agent pipeline. */
  incident?: string;
};

export const needsYou: NeedsYouItem[] = [
  {
    item: "INC-48211 · Salesforce Field Sales (LatAm)",
    agent: "Incident Resolution Agent",
    why: "Confidence 71% — credential rotation touches shared integration user",
    age: "4 min",
    to: "/approvals",
    incident: "INC-48211",
  },
  {
    item: "INC-48207 · ServiceNow ITSM Portal (Global)",
    agent: "Root Cause Investigation Agent",
    why: "Confidence 38% — below 60% autonomy floor, escalated to L2",
    age: "41 min",
    to: "/incidents",
    incident: "INC-48207",
  },
  {
    item: "CHG-3391 · SAP ERP patch (Frito Lay NA)",
    agent: "Change Risk Agent",
    why: "34% predicted failure risk, window overlaps order surge",
    age: "1h 20m",
    to: "/change-risk",
  },
  {
    item: "SEC-2207 · Public S3 bucket, Quaker reporting exports",
    agent: "Compliance Operations Agent",
    why: "Open security exception awaiting owner sign off",
    age: "3h 05m",
    to: "/compliance",
  },
];

export const slaRisks = [
  {
    service: "ServiceNow — ITSM Portal (Global)",
    minutes: 34,
    impact: "Ticket intake for 74k employees",
    sev: "Critical" as Sev,
  },
  {
    service: "SAP ERP — Order Management (Frito Lay NA)",
    minutes: 52,
    impact: "$310K/hr order to cash at risk",
    sev: "Critical" as Sev,
  },
  {
    service: "Salesforce — Field Sales (LatAm)",
    minutes: 88,
    impact: "2,400 field reps, order capture",
    sev: "High" as Sev,
  },
  {
    service: "Snowflake — Beverages Analytics",
    minutes: 145,
    impact: "Q3 promo reporting SLAs",
    sev: "High" as Sev,
  },
  {
    service: "Workday — HR Self Service (Global)",
    minutes: 210,
    impact: "Payroll change cutoff Friday",
    sev: "Medium" as Sev,
  },
];

export type Incident = {
  id: string;
  service: string;
  bu: string;
  region: string;
  sev: Sev;
  detected: string;
  cause: string;
  confidence: number;
  runbook: string;
  owner: string;
  status: "Executing" | "Awaiting Approval" | "Escalated" | "Resolved";
  /** Autonomy tier this incident is dispatched under. */
  tier: Tier;
  /** Plain language framing shown on the incident detail page. */
  desc: string;
  meta: Record<string, string>;
};

export const incidents: Incident[] = [
  {
    id: "INC-48213",
    service: "SAP ERP – Order Mgmt",
    bu: "Frito Lay",
    region: "North America",
    sev: "Critical",
    detected: "6 min ago",
    cause: "Deploy at 14:02 UTC correlated with DB connection pool exhaustion",
    confidence: 94,
    runbook: "Auto executing rollback",
    owner: "Agent (Tier 1)",
    status: "Executing",
    tier: "Tier 2",
    desc: "Alert storm at 14:05 UTC across order management, warehouse and e commerce services. Order create p95 latency 11.4s against a 482ms baseline, 12.4% error rate on order confirmation. Correlated to a deploy three minutes earlier.",
    meta: {
      Environment: "Production",
      Region: "North America",
      Owner: "Enterprise Apps — SAP",
      "Business impact": "$310K/hr order to cash at risk",
    },
  },
  {
    id: "INC-48211",
    service: "Salesforce – Field Sales App",
    bu: "PepsiCo Beverages",
    region: "LatAm",
    sev: "High",
    detected: "22 min ago",
    cause: "Auth token refresh failure post cert rotation",
    confidence: 71,
    runbook: "Suggested fix — awaiting approval",
    owner: "R. Alvarez",
    status: "Awaiting Approval",
    tier: "Tier 2",
    desc: "Field Sales login success rate fell from 99.1% to 62.4% eight minutes after a certificate rotation on the LatAm API gateway. 2,400 field reps affected; cached sessions still working but expiring.",
    meta: {
      Environment: "Production",
      Region: "LatAm",
      Owner: "Integration Platform",
      "Business impact": "2,400 field reps, order capture degraded",
    },
  },
  {
    id: "INC-48207",
    service: "ServiceNow – ITSM Portal",
    bu: "Global Business Services",
    region: "EMEA",
    sev: "High",
    detected: "41 min ago",
    cause: "Elevated latency, no clear correlation",
    confidence: 38,
    runbook: "Escalated — low confidence",
    owner: "J. Kim",
    status: "Escalated",
    tier: "Tier 3",
    desc: "ITSM Portal p95 response time degrading steadily since 13:31 UTC with no correlated change. Ticket intake for 74,000 employees. Three competing hypotheses, none above the 60% autonomy floor.",
    meta: {
      Environment: "Production",
      Region: "EMEA",
      Owner: "Global Business Services — ITSM",
      "Business impact": "Ticket intake for 74,000 employees",
    },
  },
  {
    id: "INC-48198",
    service: "Snowflake – Beverages Analytics",
    bu: "PepsiCo Beverages",
    region: "North America",
    sev: "Low",
    detected: "1h 12m ago",
    cause: "Warehouse auto suspend misconfig",
    confidence: 96,
    runbook: "Auto resolved",
    owner: "Agent (Tier 1)",
    status: "Resolved",
    tier: "Tier 1",
    desc: "Snowflake WH_BEVERAGES query queue grew from under 20 to 312 jobs after auto suspend was tightened for a cost test and never reverted. Analytics reporting freshness only, no customer impact.",
    meta: {
      Environment: "Production",
      Region: "North America",
      Owner: "Data Platform — Beverages",
      "Business impact": "Q3 promo reporting freshness",
    },
  },
  {
    id: "INC-48190",
    service: "Workday – HR Self Service",
    bu: "Global Business Services",
    region: "APAC",
    sev: "Low",
    detected: "2h 05m ago",
    cause: "Scheduled maintenance overlap",
    confidence: 91,
    runbook: "Auto resolved",
    owner: "Agent (Tier 1)",
    status: "Resolved",
    tier: "Tier 1",
    desc: "Workday self service unavailable for 18 minutes inside a vendor notified maintenance window. Zero user sessions attempted. The alerts were real; the impact was not.",
    meta: {
      Environment: "Production",
      Region: "APAC",
      Owner: "Global Business Services — HR Systems",
      "Business impact": "None — inside agreed maintenance window",
    },
  },
];

export const incidentDetail: Record<
  string,
  {
    signals: { t: string; kind: string; text: string }[];
    reasoning: string[];
    steps: { step: string; state: "done" | "running" | "pending" }[];
  }
> = {
  "INC-48213": {
    signals: [
      {
        t: "14:02 UTC",
        kind: "Change",
        text: "Deploy sap-om-api v4.19.2 (CHG-3388) by pipeline ‘om-prod’",
      },
      { t: "14:05 UTC", kind: "Metric", text: "DB active connections 180/180 (pool max reached)" },
      {
        t: "14:06 UTC",
        kind: "Log",
        text: "HikariPool-1 — Connection is not available, request timed out after 30000ms ×2,411",
      },
      { t: "14:07 UTC", kind: "Trace", text: "p95 order create latency 480ms → 11.4s" },
      {
        t: "14:08 UTC",
        kind: "Alert",
        text: "Datadog monitor ‘OM order create error rate > 5%’ triggered",
      },
    ],
    reasoning: [
      "Error onset is 3 minutes after CHG-3388 and no other change landed in the 6-hour window.",
      "v4.19.2 diff adds a per request read connection without releasing it in the retry path.",
      "Connection count flatlines at pool max while request rate is flat — saturation, not a load spike.",
      "This pattern matches PRB-1042 (7 occurrences in 30d) with identical log fingerprint.",
    ],
    steps: [
      { step: "Freeze pipeline om-prod", state: "done" },
      { step: "Drain traffic from canary pods", state: "done" },
      { step: "Roll back sap-om-api to v4.19.1", state: "running" },
      { step: "Verify pool utilisation < 70% for 10 min", state: "pending" },
      {
        step: "Post status update to #it-ops-bridge and update INC in ServiceNow",
        state: "pending",
      },
    ],
  },
  "INC-48211": {
    signals: [
      { t: "13:40 UTC", kind: "Change", text: "Cert rotation on api-gw-latam (CHG-3386)" },
      { t: "13:48 UTC", kind: "Log", text: "invalid_grant: token refresh rejected ×860" },
      { t: "13:52 UTC", kind: "Metric", text: "Field Sales login success rate 99.1% → 62.4%" },
    ],
    reasoning: [
      "Failures start 8 minutes after cert rotation, only on the LatAm gateway.",
      "OAuth token cache still holds the pre rotation thumbprint (see PRB-1038).",
      "Blast radius limited to one integration user; 2,400 field reps affected.",
    ],
    steps: [
      { step: "Rotate integration credential in vault", state: "pending" },
      { step: "Bust OAuth token cache on api-gw-latam", state: "pending" },
      { step: "Verify login success rate > 98% for 15 min", state: "pending" },
    ],
  },
};

export const approvals = [
  {
    id: "APR-771",
    incident: "INC-48213",
    item: "INC-48213 · SAP ERP – Order Mgmt (Frito Lay NA)",
    agent: "Incident Resolution Agent",
    action: "Restart production SAP application server node sapom-prd-04",
    risk: "Medium",
    impact: "90s order capture pause for NA DCs if rollback alone is insufficient",
    waiting: "4 min",
    blast: "1 of 6 app nodes · 18% of order traffic · no data mutation",
    rollback: "Node re added to pool automatically; traffic re balanced in 45s",
    history: "Last 5 times this action was approved: 5/5 successful (avg 2m 10s)",
  },
  {
    id: "APR-770",
    incident: "INC-48211",
    item: "INC-48211 · Salesforce – Field Sales (LatAm)",
    agent: "Incident Resolution Agent",
    action: "Rotate expired API credential for Salesforce integration user",
    risk: "Low",
    impact: "Brief re auth for 2 batch jobs; no user facing downtime",
    waiting: "11 min",
    blast: "1 integration user · 3 dependent jobs · LatAm only",
    rollback: "Previous credential retained for 24h and re attachable in one click",
    history: "Last 5 times this action was approved: 5/5 successful (avg 55s)",
  },
];

export const alertVolume = [
  { d: "Aug 08", raw: 3980, surfaced: 71 },
  { d: "Aug 09", raw: 4120, surfaced: 66 },
  { d: "Aug 10", raw: 3765, surfaced: 58 },
  { d: "Aug 11", raw: 4310, surfaced: 74 },
  { d: "Aug 12", raw: 4088, surfaced: 61 },
  { d: "Aug 13", raw: 4225, surfaced: 69 },
  { d: "Aug 14", raw: 4182, surfaced: 63 },
];

export const suppressionRules = [
  {
    name: "Flapping host heartbeat",
    pattern: "host.down AND recovery < 90s",
    suppressed: 1204,
    tuned: "Jul 28",
    status: "Active",
  },
  {
    name: "Batch window disk spikes",
    pattern: "disk.used > 85% AND 01:00–04:00 UTC",
    suppressed: 812,
    tuned: "Aug 02",
    status: "Active",
  },
  {
    name: "Duplicate Datadog/Splunk pairs",
    pattern: "same service + 60s window",
    suppressed: 690,
    tuned: "Aug 11",
    status: "Active",
  },
  {
    name: "Synthetic monitor cold start",
    pattern: "synthetic.timeout AND first run",
    suppressed: 511,
    tuned: "Jul 19",
    status: "Active",
  },
  {
    name: "Non prod noise (dev/test)",
    pattern: "env != prod",
    suppressed: 498,
    tuned: "Aug 06",
    status: "Active",
  },
  {
    name: "Legacy Kronos poller",
    pattern: "kronos.poll.retry",
    suppressed: 155,
    tuned: "Jun 30",
    status: "Paused",
  },
];

export const clusters = [
  {
    cluster: "CL-9921",
    root: "sap-om-api pool exhaustion",
    folded: 187,
    service: "SAP ERP – Order Mgmt",
    score: 98,
  },
  {
    cluster: "CL-9918",
    root: "api-gw-latam invalid_grant",
    folded: 96,
    service: "Salesforce – Field Sales",
    score: 81,
  },
  {
    cluster: "CL-9915",
    root: "itsm-portal p95 latency",
    folded: 63,
    service: "ServiceNow – ITSM Portal",
    score: 74,
  },
  {
    cluster: "CL-9911",
    root: "snowflake wh_beverages suspend",
    folded: 41,
    service: "Snowflake – Beverages Analytics",
    score: 44,
  },
  {
    cluster: "CL-9908",
    root: "azure-fl-supply node pressure",
    folded: 28,
    service: "Azure – Frito Lay Supply Ops",
    score: 39,
  },
];

export const problems = [
  {
    id: "PRB-1042",
    pattern: "DB connection pool exhaustion under peak load",
    occ: 7,
    service: "SAP ERP – Order Mgmt",
    fix: "Increase pool size + add circuit breaker",
    status: "In Progress",
    incidents: [
      "INC-48213",
      "INC-48102",
      "INC-47990",
      "INC-47811",
      "INC-47702",
      "INC-47588",
      "INC-47401",
    ],
    writeup:
      "Order Management saturates its 180-connection pool whenever promo order volume exceeds ~2.1k orders/min and a retry path leaks a read connection. Permanent fix raises the pool to 320 and wraps the read path in a circuit breaker with a 2s budget.",
  },
  {
    id: "PRB-1038",
    pattern: "Cert rotation breaks OAuth token cache",
    occ: 4,
    service: "Salesforce integrations",
    fix: "Automate cache bust on rotation",
    status: "Fix Shipped",
    incidents: ["INC-48211", "INC-47905", "INC-47640", "INC-47322"],
    writeup:
      "Gateway keeps a thumbprint keyed OAuth cache that survives certificate rotation. Rotation runbook now emits a cache bust event consumed by all regional gateways.",
  },
  {
    id: "PRB-1031",
    pattern: "Snowflake warehouse auto suspend during batch jobs",
    occ: 5,
    service: "Beverages Analytics",
    fix: "Adjust auto suspend policy for batch windows",
    status: "Fix Shipped",
    incidents: ["INC-48198", "INC-47850", "INC-47733", "INC-47512", "INC-47205"],
    writeup:
      "WH_BEVERAGES suspends after 60s idle, mid DAG, causing cold restarts and failed downstream tasks. Policy now holds the warehouse resident during the 01:00–05:00 UTC batch window.",
  },
];

export const services = [
  {
    name: "SAP ERP – Order Management",
    bu: "Frito Lay",
    health: 61,
    trend: "↓ 9",
    risk: "High",
    owner: "R. Alvarez",
    tier: "Tier 0",
  },
  {
    name: "SAP ERP – Finance",
    bu: "Global Business Services",
    health: 96,
    trend: "→ 0",
    risk: "Low",
    owner: "P. Nwosu",
    tier: "Tier 1",
  },
  {
    name: "Salesforce – Field Sales",
    bu: "PepsiCo Beverages",
    health: 74,
    trend: "↓ 5",
    risk: "Medium",
    owner: "L. Duarte",
    tier: "Tier 1",
  },
  {
    name: "Salesforce – Service Cloud",
    bu: "Global Business Services",
    health: 93,
    trend: "↑ 1",
    risk: "Low",
    owner: "L. Duarte",
    tier: "Tier 1",
  },
  {
    name: "ServiceNow – ITSM Portal",
    bu: "Global Business Services",
    health: 68,
    trend: "↓ 7",
    risk: "High",
    owner: "J. Kim",
    tier: "Tier 0",
  },
  {
    name: "Workday – HR Self Service",
    bu: "Global Business Services",
    health: 97,
    trend: "→ 0",
    risk: "Low",
    owner: "A. Bergström",
    tier: "Tier 1",
  },
  {
    name: "Snowflake – Beverages Analytics",
    bu: "PepsiCo Beverages",
    health: 88,
    trend: "↓ 2",
    risk: "Medium",
    owner: "S. Rahman",
    tier: "Tier 2",
  },
  {
    name: "Snowflake – Quaker Reporting",
    bu: "Quaker",
    health: 95,
    trend: "↑ 2",
    risk: "Low",
    owner: "S. Rahman",
    tier: "Tier 2",
  },
  {
    name: "Beverages e Commerce Platform",
    bu: "PepsiCo Beverages",
    health: 91,
    trend: "↑ 1",
    risk: "Medium",
    owner: "C. Whitfield",
    tier: "Tier 0",
  },
  {
    name: "Kronos – Workforce (Plants)",
    bu: "Frito Lay",
    health: 84,
    trend: "↓ 3",
    risk: "Medium",
    owner: "D. Okafor",
    tier: "Tier 1",
  },
  {
    name: "Quaker Trade Promotions",
    bu: "Quaker",
    health: 94,
    trend: "→ 0",
    risk: "Low",
    owner: "H. Yamada",
    tier: "Tier 2",
  },
  {
    name: "Azure – Supply Ops Compute",
    bu: "Frito Lay",
    health: 89,
    trend: "→ 0",
    risk: "Low",
    owner: "D. Okafor",
    tier: "Tier 1",
  },
];

export const healthTrend = Array.from({ length: 30 }, (_, i) => ({
  d: `D-${29 - i}`,
  score: [
    96, 95, 96, 94, 95, 93, 94, 92, 93, 91, 92, 90, 91, 89, 90, 88, 89, 87, 88, 86, 85, 84, 82, 80,
    78, 74, 71, 68, 64, 61,
  ][i],
}));

export const predictions = [
  {
    p: "Storage capacity breach — Snowflake Beverages Analytics",
    conf: 83,
    win: "Next 5 days",
    signals: "Growth trend + seasonal Q3 promo analytics load",
    action: "Pre provision +20% storage",
  },
  {
    p: "SLA breach — ServiceNow ITSM Portal response time",
    conf: 71,
    win: "Next 48 hours",
    signals: "Rising ticket volume, degrading p95 response time",
    action: "Scale portal instance ahead of peak",
  },
  {
    p: "Outage — SAP ERP Order Mgmt connection pool",
    conf: 66,
    win: "Next 7 days",
    signals: "PRB-1042 recurrence cadence + promo order forecast",
    action: "Ship pool + circuit breaker fix before Sep 1 promo",
  },
  {
    p: "Capacity bottleneck — AWS compute, Beverages e commerce",
    conf: 64,
    win: "Next 6 weeks",
    signals: "3.2%/mo growth, holiday promo traffic model",
    action: "Scale reserved capacity +25%",
  },
  {
    p: "SLA breach — Kronos punch sync (Frito Lay plants)",
    conf: 58,
    win: "Next 72 hours",
    signals: "Poller retry rate up 4x since Aug 11",
    action: "Increase poller concurrency, patch legacy adapter",
  },
  {
    p: "Outage — Azure AD conditional access misconfig (EMEA)",
    conf: 52,
    win: "Next 7 days",
    signals: "Config drift detected on 2 tenants",
    action: "Revert drift, enforce policy as code baseline",
  },
];

export const predictionAccuracy = [
  { m: "May W1", predicted: 44, actual: 41 },
  { m: "May W3", predicted: 47, actual: 49 },
  { m: "Jun W1", predicted: 52, actual: 50 },
  { m: "Jun W3", predicted: 48, actual: 47 },
  { m: "Jul W1", predicted: 55, actual: 57 },
  { m: "Jul W3", predicted: 51, actual: 50 },
  { m: "Aug W1", predicted: 58, actual: 57 },
  { m: "Aug W2", predicted: 54, actual: 53 },
];

export const changes = [
  {
    id: "CHG-3391",
    system: "SAP ERP (Frito Lay NA)",
    desc: "Kernel patch + OM connection pool config",
    window: "Aug 16, 10:00–14:00 CT",
    risk: 34,
    rec: "Reschedule",
    approver: "R. Alvarez",
    note: "Overlaps 10am–2pm CT order surge. Similar patches failed 3 of 11 times in window vs. 0 of 14 out of window.",
  },
  {
    id: "CHG-3389",
    system: "ServiceNow ITSM (Global)",
    desc: "Portal instance scale up to L4",
    window: "Aug 15, 22:00–23:30 UTC",
    risk: 11,
    rec: "Proceed",
    approver: "J. Kim",
    note: "Low blast radius, vendor managed scale operation, rollback in 5 min.",
  },
  {
    id: "CHG-3386",
    system: "Salesforce (LatAm)",
    desc: "API gateway certificate rotation",
    window: "Aug 15, 13:30–14:00 UTC",
    risk: 46,
    rec: "Add rollback plan",
    approver: "L. Duarte",
    note: "PRB-1038 pattern — require cache bust step and 30 min soak before closure.",
  },
  {
    id: "CHG-3382",
    system: "Snowflake (Global Analytics)",
    desc: "Warehouse resize WH_BEVERAGES M→L",
    window: "Aug 17, 02:00–03:00 UTC",
    risk: 8,
    rec: "Proceed",
    approver: "S. Rahman",
    note: "Batch window, reversible, no downstream schema impact.",
  },
  {
    id: "CHG-3379",
    system: "Azure AD (EMEA)",
    desc: "Conditional access policy baseline",
    window: "Aug 18, 06:00–07:00 UTC",
    risk: 29,
    rec: "Add rollback plan",
    approver: "A. Bergström",
    note: "Identity blast radius across 31k users — stage by pilot ring first.",
  },
];

export const capacityTrend = Array.from({ length: 13 }, (_, i) => ({
  w: `W-${12 - i}`,
  cpu: 58 + i * 1.4,
  mem: 61 + i * 1.1,
  storage: 55 + i * 1.6,
  spend: 2.05 + i * 0.03,
}));

export const capacityRecs = [
  {
    r: "AWS compute — Beverages e commerce",
    util: 78,
    growth: "↑ 3.2%/mo",
    breach: "6 weeks",
    rec: "Scale up 25% ahead of holiday promo season",
  },
  {
    r: "Snowflake storage — Global Analytics",
    util: 71,
    growth: "↑ 5.1%/mo",
    breach: "8 weeks",
    rec: "Add storage tier / archive cold data",
  },
  {
    r: "Azure compute — Frito Lay Supply Ops",
    util: 64,
    growth: "Stable",
    breach: "—",
    rec: "No action needed",
  },
  {
    r: "SAP HANA memory — Order Mgmt",
    util: 83,
    growth: "↑ 2.4%/mo",
    breach: "4 weeks",
    rec: "Add 512GB node to scale out cluster",
  },
  {
    r: "Salesforce API call entitlement",
    util: 69,
    growth: "↑ 4.0%/mo",
    breach: "9 weeks",
    rec: "Negotiate higher entitlement at renewal",
  },
];

export const spendByPlatform = [
  { m: "Sep", aws: 980, azure: 720, gcp: 180, saas: 420 },
  { m: "Oct", aws: 1010, azure: 735, gcp: 176, saas: 424 },
  { m: "Nov", aws: 1055, azure: 742, gcp: 181, saas: 428 },
  { m: "Dec", aws: 1120, azure: 760, gcp: 190, saas: 431 },
  { m: "Jan", aws: 1042, azure: 738, gcp: 178, saas: 436 },
  { m: "Feb", aws: 1008, azure: 726, gcp: 172, saas: 440 },
  { m: "Mar", aws: 1064, azure: 749, gcp: 181, saas: 442 },
  { m: "Apr", aws: 1088, azure: 758, gcp: 184, saas: 447 },
  { m: "May", aws: 1105, azure: 764, gcp: 186, saas: 451 },
  { m: "Jun", aws: 1142, azure: 771, gcp: 190, saas: 455 },
  { m: "Jul", aws: 1170, azure: 780, gcp: 193, saas: 459 },
  { m: "Aug", aws: 1188, azure: 786, gcp: 196, saas: 462 },
];

export const costOpps = [
  {
    r: "EC2 fleet — dev/test (Beverages)",
    p: "AWS",
    issue: "Idle nights/weekends, no auto scaling",
    cost: 41,
    rec: "Schedule shutdown outside business hours",
    save: 18,
  },
  {
    r: "Overprovisioned SQL DB — Quaker Reporting",
    p: "Azure",
    issue: "12% avg utilization",
    cost: 22,
    rec: "Downsize tier",
    save: 14,
  },
  {
    r: "Unused reserved instances",
    p: "AWS",
    issue: "34 RIs unused 60+ days",
    cost: 9,
    rec: "Reallocate or sell back",
    save: 9,
  },
  {
    r: "Snowflake WH_QUAKER auto suspend",
    p: "SaaS",
    issue: "Idle credits burned, 10 min suspend",
    cost: 17,
    rec: "Drop auto suspend to 60s",
    save: 7,
  },
  {
    r: "Orphaned managed disks — Frito Lay",
    p: "Azure",
    issue: "212 unattached disks",
    cost: 6,
    rec: "Delete after 30-day snapshot",
    save: 6,
  },
  {
    r: "Duplicate observability licences",
    p: "SaaS",
    issue: "Splunk + Datadog overlap on 140 hosts",
    cost: 33,
    rec: "Consolidate host coverage",
    save: 12,
  },
  {
    r: "GCP BigQuery on demand queries",
    p: "GCP",
    issue: "No slot reservation for recurring jobs",
    cost: 14,
    rec: "Move recurring jobs to flat rate slots",
    save: 5,
  },
];

export const vendors = [
  {
    v: "Accenture",
    s: "Managed Services",
    sla: 97.4,
    resp: "12 min",
    inc: 41,
    trend: "↑",
    score: 91,
  },
  {
    v: "Infosys",
    s: "Application Support",
    sla: 89.2,
    resp: "27 min",
    inc: 63,
    trend: "↓",
    score: 72,
  },
  { v: "AWS", s: "Cloud Infrastructure", sla: 99.95, resp: "6 min", inc: 8, trend: "→", score: 96 },
  { v: "Microsoft", s: "Azure / M365", sla: 99.6, resp: "9 min", inc: 14, trend: "→", score: 94 },
  { v: "Salesforce", s: "CRM Platform", sla: 99.1, resp: "18 min", inc: 11, trend: "↑", score: 90 },
  { v: "SAP", s: "ERP Support", sla: 95.8, resp: "34 min", inc: 22, trend: "↓", score: 80 },
  { v: "ServiceNow", s: "ITSM Platform", sla: 98.3, resp: "15 min", inc: 9, trend: "→", score: 92 },
  { v: "Zscaler", s: "Network Security", sla: 99.2, resp: "11 min", inc: 6, trend: "↑", score: 93 },
  { v: "TCS", s: "Infrastructure Ops", sla: 93.5, resp: "22 min", inc: 37, trend: "↓", score: 78 },
  { v: "Wipro", s: "Service Desk", sla: 96.1, resp: "19 min", inc: 29, trend: "→", score: 85 },
];

export const vendorTrend = [
  { m: "Sep", Accenture: 96.1, Infosys: 95.4, AWS: 99.9, SAP: 96.8 },
  { m: "Oct", Accenture: 96.4, Infosys: 95.0, AWS: 99.9, SAP: 96.4 },
  { m: "Nov", Accenture: 96.8, Infosys: 94.6, AWS: 99.9, SAP: 96.1 },
  { m: "Dec", Accenture: 96.2, Infosys: 93.9, AWS: 99.8, SAP: 95.4 },
  { m: "Jan", Accenture: 96.9, Infosys: 93.5, AWS: 99.9, SAP: 96.0 },
  { m: "Feb", Accenture: 97.1, Infosys: 93.1, AWS: 99.9, SAP: 96.3 },
  { m: "Mar", Accenture: 97.0, Infosys: 92.4, AWS: 100, SAP: 95.9 },
  { m: "Apr", Accenture: 97.3, Infosys: 91.8, AWS: 99.9, SAP: 95.6 },
  { m: "May", Accenture: 97.2, Infosys: 91.0, AWS: 99.9, SAP: 95.9 },
  { m: "Jun", Accenture: 97.5, Infosys: 90.2, AWS: 100, SAP: 95.7 },
  { m: "Jul", Accenture: 97.3, Infosys: 89.7, AWS: 99.9, SAP: 95.8 },
  { m: "Aug", Accenture: 97.4, Infosys: 89.2, AWS: 99.95, SAP: 95.8 },
];

export const complianceFindings = [
  {
    sys: "AWS S3 — Quaker reporting exports",
    pol: "PEP-SEC-014 Public object access",
    find: "Bucket policy allows public list",
    sev: "Critical" as Sev,
    det: "3h 05m ago",
    status: "Open Exception",
  },
  {
    sys: "Azure SQL — Frito Lay Supply",
    pol: "PEP-SEC-022 Encryption at rest",
    find: "TDE disabled on 1 replica",
    sev: "High" as Sev,
    det: "1d ago",
    status: "Remediating",
  },
  {
    sys: "SAP ERP — Finance",
    pol: "PEP-SOX-003 SoD conflict",
    find: "2 users hold post + approve",
    sev: "High" as Sev,
    det: "2d ago",
    status: "Remediating",
  },
  {
    sys: "ServiceNow — ITSM",
    pol: "PEP-ITG-009 Change evidence",
    find: "4 changes closed without evidence",
    sev: "Medium" as Sev,
    det: "3d ago",
    status: "Resolved",
  },
  {
    sys: "Workday — HR",
    pol: "PEP-PRV-002 Data retention",
    find: "Terminated records past 7y",
    sev: "Medium" as Sev,
    det: "5d ago",
    status: "Resolved",
  },
  {
    sys: "Snowflake — Beverages",
    pol: "PEP-SEC-031 Network policy",
    find: "Warehouse reachable from any IP",
    sev: "Medium" as Sev,
    det: "6d ago",
    status: "Remediating",
  },
  {
    sys: "M365 — Global",
    pol: "PEP-SEC-041 Legacy auth",
    find: "Basic auth enabled for 12 mailboxes",
    sev: "Low" as Sev,
    det: "8d ago",
    status: "Resolved",
  },
  {
    sys: "Azure AD — EMEA",
    pol: "PEP-SEC-018 Conditional access",
    find: "Drift from policy baseline on 2 tenants",
    sev: "High" as Sev,
    det: "9d ago",
    status: "Remediating",
  },
];

export const complianceTrend = [
  { m: "Sep", score: 88 },
  { m: "Oct", score: 89 },
  { m: "Nov", score: 90 },
  { m: "Dec", score: 89 },
  { m: "Jan", score: 91 },
  { m: "Feb", score: 92 },
  { m: "Mar", score: 91 },
  { m: "Apr", score: 93 },
  { m: "May", score: 93 },
  { m: "Jun", score: 94 },
  { m: "Jul", score: 95 },
  { m: "Aug", score: 94 },
];

export type Agent = {
  name: string;
  stage: "Observe" | "Understand" | "Decide" | "Act" | "Learn" | "Report";
  status: "Healthy" | "Degraded";
  actions: number;
  tier: Tier;
  learned: string;
  what: string;
  guardrails: string[];
  slug: string;
};

export const agents: Agent[] = [
  {
    slug: "alert-noise",
    name: "Alert Noise Reduction Agent",
    stage: "Observe",
    status: "Healthy",
    actions: 3870,
    tier: "Tier 1",
    learned: "12 min ago",
    what: "Deduplicates, correlates and suppresses raw monitoring alerts before they reach a human.",
    guardrails: ["Never suppresses Sev-1 patterns", "Every suppression is replayable for 30 days"],
  },
  {
    slug: "service-health",
    name: "Service Health Agent",
    stage: "Observe",
    status: "Healthy",
    actions: 214,
    tier: "Tier 1",
    learned: "26 min ago",
    what: "Scores health per service and forecasts degradation windows.",
    guardrails: ["Read only on production", "Escalates any Tier 0 service below 70"],
  },
  {
    slug: "dependency-impact",
    name: "Dependency Impact Agent",
    stage: "Observe",
    status: "Healthy",
    actions: 96,
    tier: "Tier 1",
    learned: "1h ago",
    what: "Maintains the live service dependency graph and computes blast radius.",
    guardrails: ["Simulation only — never mutates topology"],
  },
  {
    slug: "root-cause",
    name: "Root Cause Investigation Agent",
    stage: "Understand",
    status: "Healthy",
    actions: 37,
    tier: "Tier 2",
    learned: "18 min ago",
    what: "Correlates logs, metrics, traces and changes into a ranked causal hypothesis.",
    guardrails: ["Publishes confidence with every conclusion", "Below 60% → human owner"],
  },
  {
    slug: "problem-mgmt",
    name: "Problem Management Agent",
    stage: "Understand",
    status: "Healthy",
    actions: 9,
    tier: "Tier 2",
    learned: "3h ago",
    what: "Detects recurring incident patterns and opens problem records with permanent fixes.",
    guardrails: ["Cannot close a problem record without engineering sign off"],
  },
  {
    slug: "knowledge",
    name: "Knowledge Assistant Agent",
    stage: "Understand",
    status: "Healthy",
    actions: 148,
    tier: "Tier 1",
    learned: "44 min ago",
    what: "Answers operator questions over runbooks, architecture docs, SOPs and incident history.",
    guardrails: ["Always cites sources", "Refuses answers without a cited document"],
  },
  {
    slug: "predictive",
    name: "Predictive Operations Agent",
    stage: "Decide",
    status: "Healthy",
    actions: 21,
    tier: "Tier 2",
    learned: "2h ago",
    what: "Forecasts outages, SLA breaches and bottlenecks with preventive recommendations.",
    guardrails: ["Recommends only — never executes preventive change"],
  },
  {
    slug: "change-risk",
    name: "Change Risk Agent",
    stage: "Decide",
    status: "Healthy",
    actions: 46,
    tier: "Tier 2",
    learned: "35 min ago",
    what: "Scores every planned change for failure risk and suggests safer windows.",
    guardrails: ["Cannot approve its own recommendation", "CAB retains veto"],
  },
  {
    slug: "capacity",
    name: "Capacity Planning Agent",
    stage: "Decide",
    status: "Healthy",
    actions: 18,
    tier: "Tier 2",
    learned: "5h ago",
    what: "Forecasts CPU, memory, storage and spend and recommends scaling ahead of breach.",
    guardrails: ["Scaling above $25K/mo delta requires Ops Manager approval"],
  },
  {
    slug: "incident-resolution",
    name: "Incident Resolution Agent",
    stage: "Act",
    status: "Healthy",
    actions: 41,
    tier: "Tier 1",
    learned: "6 min ago",
    what: "Diagnoses and executes runbooks to resolve incidents end to end.",
    guardrails: ["No schema or payment system actions", "Auto rollback on failed verification"],
  },
  {
    slug: "copilot",
    name: "Operations Copilot",
    stage: "Act",
    status: "Healthy",
    actions: 132,
    tier: "Tier 2",
    learned: "9 min ago",
    what: "Conversational assistant for operators: drafts updates, summarises bridges, updates tickets.",
    guardrails: ["Outbound exec comms require operator send", "All ticket writes logged"],
  },
  {
    slug: "cost",
    name: "Cost Optimization (FinOps) Agent",
    stage: "Act",
    status: "Healthy",
    actions: 128,
    tier: "Tier 2",
    learned: "1h 20m ago",
    what: "Finds idle and overprovisioned resources and executes approved savings actions.",
    guardrails: ["Never terminates production resources", "Snapshot before delete"],
  },
  {
    slug: "compliance",
    name: "Compliance Operations Agent",
    stage: "Learn",
    status: "Degraded",
    actions: 7,
    tier: "Tier 2",
    learned: "22 min ago",
    what: "Continuously checks configuration against policy and assembles audit evidence.",
    guardrails: ["Exceptions require named human owner", "Evidence packages are immutable"],
  },
  {
    slug: "vendor",
    name: "Vendor Performance Agent",
    stage: "Learn",
    status: "Healthy",
    actions: 10,
    tier: "Tier 1",
    learned: "6h ago",
    what: "Tracks vendor SLA compliance, response times and risk trend for QBRs.",
    guardrails: ["Scores are advisory input to contract review only"],
  },
  {
    slug: "executive",
    name: "Executive Operations Agent",
    stage: "Report",
    status: "Healthy",
    actions: 3,
    tier: "Tier 1",
    learned: "7h ago",
    what: "Composes the daily leadership briefing from every other agent's output.",
    guardrails: ["Never publishes unverified financial impact", "Distro send is human initiated"],
  },
];

export const agentPerf = [
  { d: "W-7", success: 91, actions: 240 },
  { d: "W-6", success: 92, actions: 268 },
  { d: "W-5", success: 93, actions: 281 },
  { d: "W-4", success: 94, actions: 305 },
  { d: "W-3", success: 95, actions: 322 },
  { d: "W-2", success: 96, actions: 344 },
  { d: "W-1", success: 97, actions: 366 },
];

export const ledger = [
  {
    t: "14:08 UTC",
    action: "Rollback sap-om-api v4.19.2 → v4.19.1",
    agent: "Incident Resolution",
    tier: "Tier 1" as Tier,
    owner: "R. Alvarez (policy POL-014)",
    outcome: "In progress",
  },
  {
    t: "13:22 UTC",
    action: "Suppress 187 duplicate alerts, cluster CL-9921",
    agent: "Alert Noise Reduction",
    tier: "Tier 1" as Tier,
    owner: "J. Kim (policy POL-002)",
    outcome: "Success",
  },
  {
    t: "12:47 UTC",
    action: "Resize WH_BEVERAGES M → L for batch window",
    agent: "Capacity Planning",
    tier: "Tier 2" as Tier,
    owner: "S. Rahman (approved)",
    outcome: "Success",
  },
  {
    t: "11:05 UTC",
    action: "Terminate 34 idle dev EC2 instances",
    agent: "Cost Optimization",
    tier: "Tier 2" as Tier,
    owner: "R. Alvarez (approved)",
    outcome: "Success · $4.1K saved",
  },
  {
    t: "09:31 UTC",
    action: "Open PRB-1042 from 7 correlated incidents",
    agent: "Problem Management",
    tier: "Tier 2" as Tier,
    owner: "J. Kim (approved)",
    outcome: "Success",
  },
  {
    t: "08:12 UTC",
    action: "Auto resolve INC-48190 maintenance overlap",
    agent: "Incident Resolution",
    tier: "Tier 1" as Tier,
    owner: "A. Bergström (policy POL-009)",
    outcome: "Success",
  },
  {
    t: "06:40 UTC",
    action: "Publish daily executive briefing",
    agent: "Executive Operations",
    tier: "Tier 1" as Tier,
    owner: "M. Delgado (policy POL-021)",
    outcome: "Success",
  },
];

export const integrations = [
  {
    n: "SAP ERP",
    status: "Active",
    sync: "42s ago",
    records: "1.2M events/day",
    type: "Bi directional API",
  },
  {
    n: "Salesforce",
    status: "Active",
    sync: "1 min ago",
    records: "480K events/day",
    type: "Streaming API",
  },
  {
    n: "ServiceNow",
    status: "Active",
    sync: "18s ago",
    records: "6,240 tickets/day",
    type: "Bi directional (write back)",
  },
  {
    n: "Workday",
    status: "Active",
    sync: "6 min ago",
    records: "74K user records",
    type: "Scheduled sync",
  },
  {
    n: "Snowflake",
    status: "Active",
    sync: "3 min ago",
    records: "9.4M rows/day",
    type: "Query federation",
  },
  {
    n: "Splunk",
    status: "Degraded",
    sync: "14 min ago",
    records: "2.1TB logs/day",
    type: "Log ingestion",
  },
  {
    n: "Datadog",
    status: "Active",
    sync: "11s ago",
    records: "38K metrics/min",
    type: "Metrics + monitors",
  },
  {
    n: "AWS",
    status: "Active",
    sync: "55s ago",
    records: "12K resources",
    type: "Cloud control plane",
  },
  {
    n: "Azure",
    status: "Active",
    sync: "1 min ago",
    records: "8,700 resources",
    type: "Cloud control plane",
  },
  {
    n: "Microsoft 365 / Teams",
    status: "Active",
    sync: "30s ago",
    records: "312 notifications/day",
    type: "Copilot notifications",
  },
];

export const users = [
  {
    n: "R. Alvarez",
    r: "IT Ops Manager",
    bu: "Global IT",
    region: "North America",
    last: "Active now",
    approvals: 128,
  },
  {
    n: "J. Kim",
    r: "Platform Engineer",
    bu: "Global IT",
    region: "APAC",
    last: "Active now",
    approvals: 64,
  },
  {
    n: "Sana Q.",
    r: "IT Operator (L1/L2)",
    bu: "Global Business Services",
    region: "APAC",
    last: "2 min ago",
    approvals: 0,
  },
  {
    n: "M. Delgado",
    r: "CIO / Executive",
    bu: "Global IT",
    region: "North America",
    last: "1h ago",
    approvals: 12,
  },
  {
    n: "L. Duarte",
    r: "IT Operator (L1/L2)",
    bu: "PepsiCo Beverages",
    region: "LatAm",
    last: "8 min ago",
    approvals: 0,
  },
  {
    n: "S. Rahman",
    r: "Platform Engineer",
    bu: "PepsiCo Beverages",
    region: "EMEA",
    last: "22 min ago",
    approvals: 41,
  },
  {
    n: "A. Bergström",
    r: "IT Ops Manager",
    bu: "Global Business Services",
    region: "EMEA",
    last: "35 min ago",
    approvals: 96,
  },
  {
    n: "D. Okafor",
    r: "IT Operator (L1/L2)",
    bu: "Frito Lay",
    region: "North America",
    last: "1h ago",
    approvals: 0,
  },
  {
    n: "H. Yamada",
    r: "Platform Engineer",
    bu: "Quaker",
    region: "APAC",
    last: "3h ago",
    approvals: 18,
  },
  {
    n: "P. Nwosu",
    r: "IT Ops Manager",
    bu: "Global Business Services",
    region: "EMEA",
    last: "5h ago",
    approvals: 73,
  },
  {
    n: "C. Whitfield",
    r: "Platform Engineer",
    bu: "PepsiCo Beverages",
    region: "North America",
    last: "6h ago",
    approvals: 29,
  },
];

export const depGraph = {
  center: "SAP ERP – Order Management",
  upstream: [
    { id: "Azure AD (SSO)", health: "ok" },
    { id: "API Gateway – NA", health: "ok" },
    { id: "HANA DB Cluster", health: "warn" },
    { id: "MQ – Order Bus", health: "ok" },
  ],
  downstream: [
    { id: "Beverages e Commerce", health: "warn" },
    { id: "Snowflake – Analytics", health: "ok" },
    { id: "Salesforce – Field Sales", health: "warn" },
    { id: "Warehouse Mgmt (NA DCs)", health: "crit" },
    { id: "Billing & Invoicing", health: "ok" },
  ],
};

export const nodeInfo: Record<
  string,
  { owner: string; tier: string; process: string; revenue: string; status: string }
> = {
  "SAP ERP – Order Management": {
    owner: "R. Alvarez",
    tier: "Tier 0",
    process: "Order to Cash — Frito Lay NA",
    revenue: "$310K / hr",
    status: "Degraded",
  },
  "Azure AD (SSO)": {
    owner: "A. Bergström",
    tier: "Tier 0",
    process: "Identity for all enterprise apps",
    revenue: "$1.4M / hr",
    status: "Healthy",
  },
  "API Gateway – NA": {
    owner: "C. Whitfield",
    tier: "Tier 1",
    process: "All NA integration traffic",
    revenue: "$420K / hr",
    status: "Healthy",
  },
  "HANA DB Cluster": {
    owner: "P. Nwosu",
    tier: "Tier 0",
    process: "Order + finance persistence",
    revenue: "$310K / hr",
    status: "Warning",
  },
  "MQ – Order Bus": {
    owner: "D. Okafor",
    tier: "Tier 1",
    process: "Order event distribution",
    revenue: "$180K / hr",
    status: "Healthy",
  },
  "Beverages e Commerce": {
    owner: "C. Whitfield",
    tier: "Tier 0",
    process: "Direct to retailer ordering",
    revenue: "$260K / hr",
    status: "Warning",
  },
  "Snowflake – Analytics": {
    owner: "S. Rahman",
    tier: "Tier 2",
    process: "Demand + promo reporting",
    revenue: "$40K / hr",
    status: "Healthy",
  },
  "Salesforce – Field Sales": {
    owner: "L. Duarte",
    tier: "Tier 1",
    process: "Field order capture — LatAm",
    revenue: "$95K / hr",
    status: "Warning",
  },
  "Warehouse Mgmt (NA DCs)": {
    owner: "D. Okafor",
    tier: "Tier 0",
    process: "Pick / pack / ship — 41 DCs",
    revenue: "$505K / hr",
    status: "Critical",
  },
  "Billing & Invoicing": {
    owner: "P. Nwosu",
    tier: "Tier 1",
    process: "Invoice generation",
    revenue: "$120K / hr",
    status: "Healthy",
  },
};

export const knowledgeSources = [
  { name: "Runbooks", count: 412 },
  { name: "Architecture Docs", count: 188 },
  { name: "SOPs", count: 96 },
  { name: "Past Incidents", count: 14260 },
];

export const suggestedQuestions = [
  "Why did the SAP Order Management service fail yesterday?",
  "What is the escalation path for a P1 on a Tier 0 service?",
  "Which runbook covers Snowflake warehouse suspension during batch?",
  "Who owns the LatAm API gateway certificates?",
  "What changed on ServiceNow ITSM in the last 7 days?",
];

export const recentQuestions = [
  { q: "How do we roll back sap-om-api safely?", who: "D. Okafor", when: "9 min ago" },
  { q: "What is our RTO for Warehouse Management?", who: "A. Bergström", when: "38 min ago" },
  { q: "Show the postmortem for INC-47905", who: "L. Duarte", when: "1h ago" },
  { q: "Which vendors are in breach this quarter?", who: "P. Nwosu", when: "2h ago" },
];

export const copilotActions = [
  { a: "Drafted exec status update for INC-48213", t: "14:11 UTC", by: "Sana Q." },
  { a: "Updated ServiceNow INC-48213 with rollback status", t: "14:09 UTC", by: "Agent" },
  { a: "Summarised bridge call (20 min) — 4 action items", t: "14:04 UTC", by: "Sana Q." },
  { a: "Generated PIR draft for INC-47905", t: "11:52 UTC", by: "L. Duarte" },
  { a: "Paged secondary on call for ServiceNow escalation", t: "10:31 UTC", by: "J. Kim" },
  { a: "Created CHG-3391 rollback checklist", t: "09:14 UTC", by: "R. Alvarez" },
];

export const execBriefing = {
  date: "Friday, 14 August",
  incidents: [
    "INC-48213 — SAP Order Management (Frito Lay NA) degraded 14 min after a bad deploy; rollback executing, no orders lost.",
    "INC-48211 — Salesforce Field Sales (LatAm) login failures after cert rotation; fix awaiting approval.",
    "INC-48207 — ServiceNow ITSM latency, cause not yet isolated; L2 engaged.",
  ],
  slaRisks: [
    "ServiceNow ITSM Portal — 71% chance of response time breach in 48h.",
    "SAP Order Management — connection pool recurrence risk before the Sep 1 promo.",
    "Kronos punch sync — plant clock in delays at 3 Frito Lay sites.",
  ],
  impact: [
    "Estimated exposure from open issues: $410K of order to cash throughput per hour if OM degrades further.",
    "2,400 LatAm field reps on degraded order capture.",
    "No customer facing e commerce impact in the last 24h.",
  ],
  cost: [
    "AWS spend up 1.6% MoM, driven by Beverages e commerce pre scaling.",
    "$186K/mo of identified savings still unactioned — 128 idle resources.",
    "One anomaly: GCP BigQuery on demand spend +$11K vs. baseline.",
  ],
  changes: [
    "CHG-3391 SAP patch — 34% predicted failure risk, recommend reschedule off the order surge.",
    "CHG-3386 Salesforce cert rotation — 46% risk, rollback plan required.",
    "CHG-3379 Azure AD baseline — 29% risk, pilot ring first.",
  ],
  capacity: [
    "AWS compute (Beverages e commerce): breach in ~6 weeks — scale 25%.",
    "Snowflake storage (Global Analytics): breach in ~8 weeks — archive cold data.",
    "SAP HANA memory (Order Mgmt): breach in ~4 weeks — add node.",
    "Azure compute (Frito Lay Supply Ops): stable, no action.",
  ],
};

export const autonomyPolicies = [
  {
    action: "Restart stateless application node",
    tier: "Tier 1" as Tier,
    threshold: 85,
    blast: "≤ 20% of pool",
  },
  {
    action: "Roll back a deployment",
    tier: "Tier 1" as Tier,
    threshold: 90,
    blast: "Single service",
  },
  {
    action: "Scale compute / warehouse",
    tier: "Tier 1" as Tier,
    threshold: 80,
    blast: "Cost delta < $5K/mo",
  },
  {
    action: "Rotate credential or certificate",
    tier: "Tier 2" as Tier,
    threshold: 75,
    blast: "Shared integration user",
  },
  {
    action: "Restart production database node",
    tier: "Tier 2" as Tier,
    threshold: 92,
    blast: "Stateful, replicated",
  },
  {
    action: "Terminate cloud resources",
    tier: "Tier 2" as Tier,
    threshold: 88,
    blast: "Non production only",
  },
  {
    action: "Production database schema change",
    tier: "Tier 3" as Tier,
    threshold: 100,
    blast: "Always human owned",
  },
  {
    action: "Customer facing payment system action",
    tier: "Tier 3" as Tier,
    threshold: 100,
    blast: "Always human owned",
  },
  {
    action: "Identity / conditional access policy change",
    tier: "Tier 3" as Tier,
    threshold: 100,
    blast: "Always human owned",
  },
];

export const alwaysTier3 = [
  "Production database schema changes",
  "Customer facing payment systems",
  "Identity and conditional access policy",
  "Anything touching SOX scoped financial reporting",
  "Novel incident signatures with no prior runbook",
  "Any action with estimated impact above $250K/hr",
];
