// Agent dispatch pipelines — one per incident in the queue.
//
// Each scenario is an ordered list of agent steps. A step is a single agent
// receiving the previous agent's output, working through named phases, then
// publishing what it found and handing off. Three endings exist:
//   Tier 1 — the pipeline runs to completion, nobody is paged.
//   Tier 2 — the pipeline stops at a gate and holds for a human decision.
//   Tier 3 — the pipeline assembles evidence and transfers control to a human.
//
// Synthetic / illustrative, same as the rest of src/data.

import type { Tier } from "./db";

export type MetricTone = "ok" | "warn" | "crit" | "human";

export type StepMetric = { l: string; v: string; tone?: MetricTone };

export type RunbookStep = {
  step: string;
  tier: Tier;
  /** done = already executed under Tier 1 authority, held = what the gate is blocking. */
  state: "done" | "held" | "pending";
};

export type Gate = {
  /** Approval-queue record this gate corresponds to. */
  approvalId: string;
  title: string;
  runbook: RunbookStep[];
  note: string;
  /** Shown once approved, in place of the runbook. */
  approvedBy: string;
  held: string;
};

export type HumanHandoff = {
  owner: string;
  paged: string;
  decisions: string[];
  gave: string;
};

export type PipelineStep = {
  /** Matches a slug in `agents` (src/data/db.ts). */
  agent: string;
  /** Simulated work duration in ms, split across phases. */
  ms: number;
  phases: string[];
  say: string;
  metrics?: StepMetric[];
  find?: string[];
  gate?: Gate;
  human?: HumanHandoff;
  /** Handoff line to the next agent. Null on the final step. */
  hand?: string;
};

export type Scenario = {
  tier: Tier;
  /** Replay rather than first run — the incident already closed. */
  replay?: boolean;
  headline: string;
  steps: PipelineStep[];
  outcome: { kind: "ok" | "human"; title: string; detail: string };
  halted: { title: string; detail: string };
};

export const tierMeta: Record<
  Tier,
  { label: string; blurb: string; tone: "ok" | "warn" | "human" }
> = {
  "Tier 1": {
    label: "Tier 1 · Agent resolves alone",
    blurb:
      "The agents will take this end to end. No human action is required — you are watching, not driving.",
    tone: "ok",
  },
  "Tier 2": {
    label: "Tier 2 · Agent proposes, human approves",
    blurb:
      "The agents will investigate and prepare the fix, then stop and hold for your approval before anything touches production.",
    tone: "warn",
  },
  "Tier 3": {
    label: "Tier 3 · Human owns, agent assists",
    blurb:
      "You own this decision. The agents will assemble the evidence and cost the options, then hand control to a named human.",
    tone: "human",
  },
};

export const scenarios: Record<string, Scenario> = {
  /* ------------------------------------------------------------------ *
   * INC-48213 — Tier 2. The centrepiece: nine agents, one approval gate.
   * ------------------------------------------------------------------ */
  "INC-48213": {
    tier: "Tier 2",
    headline:
      "Nine agents will be engaged in sequence. The pipeline will stop before it touches production.",
    steps: [
      {
        agent: "alert-noise",
        ms: 1900,
        phases: [
          "Receiving task",
          "Ingesting from Datadog, Splunk and ServiceNow",
          "Correlating 4,182 events by topology",
        ],
        say: "A deploy ripples through the estate and monitoring reacts the only way it knows how — everything alarms at once.",
        metrics: [
          { l: "Raw alerts", v: "4,182", tone: "crit" },
          { l: "After dedup", v: "312" },
          { l: "Real incidents", v: "9", tone: "ok" },
          { l: "Critical", v: "1", tone: "crit" },
        ],
        find: [
          "3,870 alerts suppressed as duplicate or downstream echo",
          "8 storms grouped by shared time window and service topology",
          "1 incident promoted to Critical: SAP Order Management order create latency",
          "Paging held 90s pending correlation — no false page sent to APAC L2",
        ],
        hand: "Hands to Service Health — is this actually degrading, or self correcting?",
      },
      {
        agent: "service-health",
        ms: 1800,
        phases: ["Receiving task", "Reading p95 latency and error rate", "Projecting SLA position"],
        say: "Not self correcting. The agent puts a deadline on the incident, which is what turns an alert into a priority.",
        metrics: [
          { l: "p95 latency", v: "11.4s", tone: "crit" },
          { l: "Baseline", v: "482ms" },
          { l: "Order errors", v: "12.4%", tone: "crit" },
          { l: "SLA breach in", v: "52 min", tone: "warn" },
        ],
        find: [
          "Degradation slope steepening — pool waiters climbing, not draining",
          "Order confirmation success 99.3% → 87.6% across 41 NA distribution centres",
          "Predicted full order capture stop in 52 minutes at current slope",
          "Health score 61/100 — escalating for diagnosis at 94% confidence",
        ],
        hand: "Hands to Root Cause Investigation — what changed?",
      },
      {
        agent: "root-cause",
        ms: 2400,
        phases: [
          "Receiving task",
          "Scanning 2.1M log lines",
          "Correlating against change and pipeline records",
          "Building the event timeline",
        ],
        say: "The step that normally costs an engineer two hours of tab switching. One timeline, five sources, 91 seconds.",
        metrics: [
          { l: "Sources", v: "5" },
          { l: "Lines scanned", v: "2.1M" },
          { l: "Time to cause", v: "91s", tone: "ok" },
          { l: "Confidence", v: "94%", tone: "ok" },
        ],
        find: [
          "14:02 UTC — sap-om-api v4.19.2 deployed by pipeline om-prod (CHG-3388)",
          "14:05 UTC — HANA pool at 180/180 connections, request rate flat",
          "14:06 UTC — HikariPool-1 timeouts, 2,411 occurrences in 60s",
          "v4.19.2 diff adds a read connection that is never released on the retry path",
          "Cause: connection pool starvation introduced by CHG-3388 — matches PRB-1042",
        ],
        hand: "Hands to Dependency Impact — who else is affected, and what does it cost?",
      },
      {
        agent: "dependency-impact",
        ms: 1900,
        phases: ["Receiving task", "Walking the service graph", "Costing business impact"],
        say: "Cause is only half the answer. Before anyone decides how urgently to act, they need the blast radius and its price.",
        metrics: [
          { l: "Services hit", v: "4", tone: "warn" },
          { l: "NA DCs affected", v: "41", tone: "warn" },
          { l: "Orders queued", v: "1,847", tone: "crit" },
          { l: "At risk", v: "$310K/hr", tone: "crit" },
        ],
        find: [
          "Warehouse Management (41 NA DCs) — critical, pick/pack/ship confirmations stalling",
          "Beverages e Commerce — degraded, 68% of direct to retailer carts failing at submit",
          "Salesforce Field Sales — degraded, order writeback retrying",
          "Billing & Invoicing — healthy, no shared pool",
        ],
        hand: "Hands to Change Risk — roll back, or fix forward?",
      },
      {
        agent: "change-risk",
        ms: 2000,
        phases: [
          "Receiving task",
          "Scoring rollback against 30 days of history",
          "Evaluating the fix forward path",
        ],
        say: "A judgement call made against history rather than instinct, with the reasoning exposed for the human who has to sign it.",
        metrics: [
          { l: "Recommend", v: "Roll back", tone: "ok" },
          { l: "Rollback risk", v: "Low", tone: "ok" },
          { l: "Fix forward risk", v: "High", tone: "crit" },
          { l: "Est. recovery", v: "6 min" },
        ],
        find: [
          "v4.19.1 ran 26 days with zero related incidents — safe rollback target",
          "No schema migration in v4.19.2 — the rollback is fully reversible",
          "Fix forward needs a code change, review and pipeline run: ~40 minutes",
          "Comparable incidents resolved 6.4x faster by rollback than by patch",
        ],
        hand: "Hands to Incident Resolution — assemble the runbook.",
      },
      {
        agent: "incident-resolution",
        ms: 2100,
        phases: [
          "Receiving task",
          "Assembling runbook SOP-022",
          "Capturing rollback point",
          "Checking authority tier",
        ],
        say: "The agent has everything it needs to act — and stops. One step in the runbook crosses into Tier 2, so the whole runbook holds.",
        metrics: [
          { l: "Runbook", v: "SOP-022" },
          { l: "Steps", v: "4" },
          { l: "Confidence", v: "94%", tone: "ok" },
          { l: "Status", v: "Held", tone: "warn" },
        ],
        gate: {
          approvalId: "APR-771",
          title: "Approval required — runbook SOP-022, Connection pool saturation",
          runbook: [
            {
              step: "Freeze pipeline om-prod and drain traffic from canary pods",
              tier: "Tier 1",
              state: "done",
            },
            {
              step: "Roll back sap-om-api v4.19.2 → v4.19.1 (pinned, verified)",
              tier: "Tier 1",
              state: "done",
            },
            {
              step: "Restart application node sapom-prd-04 to clear the saturated pool",
              tier: "Tier 2",
              state: "held",
            },
            {
              step: "Verify pool utilisation below 70% for 10 minutes, then restore traffic",
              tier: "Tier 1",
              state: "pending",
            },
          ],
          note: "Steps 1 and 2 are Tier 1 and have already executed under policy POL-014 — the rollback is complete and pool utilisation is down to 84%, still above the 70% threshold. Step 3 restarts a production node carrying 18% of order traffic. That is Tier 2, so the agent stops here. It is not unsure; it is not authorised. Blast radius: 1 of 6 app nodes, no data mutation. Rollback: the node is re added to the pool automatically and traffic rebalances in 45 seconds. Last 5 times this action was approved: 5/5 successful, average 2m 10s.",
          approvedBy:
            "Approved by R. Alvarez · IT Ops Manager · 14:12 UTC · written to the accountability ledger",
          held: "held 41s",
        },
        hand: "Approved under APR-771 — executing all four steps.",
      },
      {
        agent: "copilot",
        ms: 1900,
        phases: [
          "Receiving task",
          "Drafting the stakeholder update",
          "Briefing #it-ops-bridge",
          "Writing back to ServiceNow",
        ],
        say: "While the rollback runs, the comms happen by themselves — the part that normally lands on the most senior person awake.",
        metrics: [
          { l: "Ticket", v: "INC-48213" },
          { l: "Updates posted", v: "3" },
          { l: "Stakeholders", v: "14" },
          { l: "Words typed", v: "0", tone: "ok" },
        ],
        find: [
          "Status page: “Order Management degraded — rollback in progress, ETA 6 min”",
          "#it-ops-bridge briefed with cause, action and owner of record",
          "ServiceNow INC-48213 updated with timeline, evidence and the approval record",
          "41 NA distribution centre leads notified, recovery notice queued",
        ],
        hand: "Rollback verified 14:29 UTC. Pool at 38%. Hands to Problem Management.",
      },
      {
        agent: "problem-mgmt",
        ms: 1800,
        phases: [
          "Receiving task",
          "Clustering against 30 days of incidents",
          "Drafting the permanent fix",
        ],
        say: "The incident is closed. The agent notices it has seen this shape seven times and moves to stop the eighth.",
        metrics: [
          { l: "Similar incidents", v: "7", tone: "warn" },
          { l: "Window", v: "30 days" },
          { l: "Lost time", v: "3h 10m", tone: "warn" },
          { l: "Record", v: "PRB-1042", tone: "human" },
        ],
        find: [
          "Clustered with INC-48102 and 5 others — all connection pool regressions on sap-om-api",
          "Common factor: pool sizing hand edited per release, never validated in CI",
          "Permanent fix: pipeline guardrail rejecting pool reductions and unreleased connection diffs",
          "Estimated prevention value $1.4M/yr in avoided order to cash exposure",
        ],
        hand: "Hands to Executive Operations for the 06:40 briefing.",
      },
      {
        agent: "executive",
        ms: 1600,
        phases: ["Receiving task", "Assembling the leadership summary", "Costing business impact"],
        say: "The last agent closes the loop back to the business. Nobody wrote this — it was waiting when the first laptop opened.",
        metrics: [
          { l: "MTTR", v: "27 min", tone: "ok" },
          { l: "Team baseline", v: "3h 40m" },
          { l: "Humans engaged", v: "1", tone: "ok" },
          { l: "SLA", v: "Held", tone: "ok" },
        ],
        find: [
          "1 critical incident resolved in 27 minutes — SLA held with 25 minutes spare",
          "Cause: connection pool regression in sap-om-api v4.19.2, rolled back",
          "Impact: 1,847 orders queued and recovered, no orders lost, $0 written off",
          "Action for you: approve pipeline guardrail PRB-1042",
        ],
      },
    ],
    outcome: {
      kind: "ok",
      title: "Resolved in 27 minutes — one human approval",
      detail:
        "Team baseline for this class of incident is 3h 40m. The human spent 41 seconds ratifying work that was already complete, and the decision is in the accountability ledger under their name.",
    },
    halted: {
      title: "Rejected — pipeline halted, INC-48213 stays with its human owner",
      detail:
        "The agent takes no further action. The full investigation stays attached to the ticket, so nothing that was learned is lost and the next responder starts from the diagnosis rather than from zero.",
    },
  },

  /* ------------------------------------------------------------------ *
   * INC-48211 — Tier 2. Shorter gate: a credential rotation.
   * ------------------------------------------------------------------ */
  "INC-48211": {
    tier: "Tier 2",
    headline:
      "Seven agents will be engaged in sequence. The credential rotation is Tier 2 and will hold for approval.",
    steps: [
      {
        agent: "alert-noise",
        ms: 1700,
        phases: [
          "Receiving task",
          "Ingesting gateway and Salesforce auth events",
          "Grouping by gateway",
        ],
        say: "Eight hundred and sixty identical rejections are one condition, not 860 problems.",
        metrics: [
          { l: "Auth failures", v: "860", tone: "crit" },
          { l: "After grouping", v: "1", tone: "ok" },
          { l: "Gateways", v: "1" },
          { l: "Confidence", v: "98%", tone: "ok" },
        ],
        find: [
          "All failures are invalid_grant on api-gw-latam — single fingerprint",
          "No failures on api-gw-na or api-gw-emea — scoped to one region",
          "4 duplicate pages suppressed before reaching the LatAm on call",
        ],
        hand: "Hands to Service Health — how bad is this for the field?",
      },
      {
        agent: "service-health",
        ms: 1600,
        phases: ["Receiving task", "Reading login success rate", "Scoping affected population"],
        say: "The number that matters is not the error count, it is how many people cannot do their job.",
        metrics: [
          { l: "Login success", v: "62.4%", tone: "crit" },
          { l: "Was", v: "99.1%" },
          { l: "Field reps", v: "2,400", tone: "warn" },
          { l: "SLA breach in", v: "88 min", tone: "warn" },
        ],
        find: [
          "Field Sales login success 99.1% → 62.4% since 13:48 UTC",
          "Order capture still functioning for cached sessions — degrading as tokens expire",
          "LatAm afternoon route completion at risk if unresolved by 16:00 local",
        ],
        hand: "Hands to Root Cause Investigation — what changed at 13:40?",
      },
      {
        agent: "root-cause",
        ms: 2100,
        phases: [
          "Receiving task",
          "Correlating against change records",
          "Inspecting the OAuth token cache",
        ],
        say: "A certificate rotation did exactly what it was asked to do. The cache holding the old thumbprint is what nobody remembered.",
        metrics: [
          { l: "Time to cause", v: "64s", tone: "ok" },
          { l: "Confidence", v: "71%", tone: "warn" },
          { l: "Change", v: "CHG-3386" },
          { l: "Pattern", v: "PRB-1038", tone: "human" },
        ],
        find: [
          "13:40 UTC — cert rotation on api-gw-latam completed successfully (CHG-3386)",
          "13:48 UTC — token refresh rejections begin, 8 minutes after rotation",
          "OAuth token cache still presenting the pre rotation thumbprint",
          "Confidence capped at 71% — the shared integration user has three consumers, so a second cause cannot be ruled out",
        ],
        hand: "Hands to Dependency Impact — what does the shared integration user touch?",
      },
      {
        agent: "dependency-impact",
        ms: 1700,
        phases: ["Receiving task", "Resolving integration consumers", "Costing the blast radius"],
        say: "This is why the action is Tier 2 rather than Tier 1: the credential is not owned by one system.",
        metrics: [
          { l: "Consumers", v: "3", tone: "warn" },
          { l: "Region", v: "LatAm only" },
          { l: "At risk", v: "$95K/hr", tone: "warn" },
          { l: "Data mutation", v: "None", tone: "ok" },
        ],
        find: [
          "Salesforce Field Sales — 2,400 reps, primary consumer",
          "Nightly territory sync job — next run 23:00 local",
          "Pricing feed to Beverages e Commerce — reads only, tolerant of a brief re auth",
          "Rotating affects all three; none of them mutate data during re auth",
        ],
        hand: "Hands to Knowledge Assistant — is there an approved runbook?",
      },
      {
        agent: "knowledge",
        ms: 1500,
        phases: ["Receiving task", "Searching the runbook library", "Matching prior incidents"],
        say: "This situation has an approved runbook and has been handled the same way four times before.",
        metrics: [
          { l: "Runbook", v: "RB-091" },
          { l: "Prior uses", v: "4" },
          { l: "Success rate", v: "100%", tone: "ok" },
          { l: "Sources cited", v: "5" },
        ],
        find: [
          "RB-091: OAuth cache bust after certificate rotation — approved, reversible",
          "Steps: rotate credential in vault, bust the gateway token cache, verify login rate",
          "PRB-1038 already carries the permanent fix: automate cache bust on rotation",
          "Prior credential retained for 24h in all four previous executions",
        ],
        hand: "Hands to Incident Resolution — prepare the action.",
      },
      {
        agent: "incident-resolution",
        ms: 1900,
        phases: [
          "Receiving task",
          "Staging the credential in vault",
          "Capturing the rollback path",
          "Checking authority tier",
        ],
        say: "Low risk is not the same as no risk. A shared credential is above the agent's authority regardless of how confident it is.",
        metrics: [
          { l: "Runbook", v: "RB-091" },
          { l: "Steps", v: "4" },
          { l: "Risk", v: "Low", tone: "ok" },
          { l: "Status", v: "Held", tone: "warn" },
        ],
        gate: {
          approvalId: "APR-770",
          title: "Approval required — rotate the Salesforce integration credential",
          runbook: [
            {
              step: "Stage the replacement credential in vault (previous value retained 24h)",
              tier: "Tier 1",
              state: "done",
            },
            {
              step: "Rotate the shared Salesforce integration credential",
              tier: "Tier 2",
              state: "held",
            },
            {
              step: "Bust the OAuth token cache on api-gw-latam",
              tier: "Tier 2",
              state: "pending",
            },
            {
              step: "Verify Field Sales login success above 98% for 15 minutes",
              tier: "Tier 1",
              state: "pending",
            },
          ],
          note: "The replacement credential is already staged — that part is Tier 1. Rotating it is Tier 2 because the credential is shared by three consumers, not because the fix is uncertain. Blast radius: 1 integration user, 3 dependent jobs, LatAm only. Rollback: the previous credential stays valid for 24 hours and is re attachable in one click. Last 5 times this action was approved: 5/5 successful, average 55s.",
          approvedBy:
            "Approved by R. Alvarez · IT Ops Manager · 14:14 UTC · written to the accountability ledger",
          held: "held 11m",
        },
        hand: "Approved under APR-770 — rotating and busting the cache.",
      },
      {
        agent: "copilot",
        ms: 1600,
        phases: ["Receiving task", "Notifying the field", "Updating ServiceNow"],
        say: "The 2,400 people who could not log in are told before they ask.",
        metrics: [
          { l: "Login success", v: "99.4%", tone: "ok" },
          { l: "Ticket", v: "INC-48211" },
          { l: "Reps notified", v: "2,400" },
          { l: "Duration", v: "38 min" },
        ],
        find: [
          "Login success verified at 99.4% across 15 minutes of samples",
          "Field Sales push notification sent in Spanish and Portuguese",
          "INC-48211 resolved and linked to PRB-1038 for the permanent fix",
          "CHG-3386 annotated: rotation runbook missing the cache bust step",
        ],
      },
    ],
    outcome: {
      kind: "ok",
      title: "Resolved in 38 minutes — one Low risk approval",
      detail:
        "2,400 field reps back to a 99.4% login rate. The permanent fix — automating the cache bust on every rotation — is already drafted on PRB-1038 so this class of incident does not return.",
    },
    halted: {
      title: "Rejected — rotation cancelled, INC-48211 stays with its human owner",
      detail:
        "Nothing was rotated. The diagnosis, the blast radius and the prepared runbook remain on the ticket for whoever picks it up, and the credential is untouched.",
    },
  },

  /* ------------------------------------------------------------------ *
   * INC-48207 — Tier 3. Six agents, then control transfers to a human.
   * ------------------------------------------------------------------ */
  "INC-48207": {
    tier: "Tier 3",
    headline:
      "Six agents will be engaged in sequence. None of them will decide — the pipeline ends with a human handover.",
    steps: [
      {
        agent: "alert-noise",
        ms: 1700,
        phases: [
          "Receiving task",
          "Ingesting portal, gateway and database events",
          "Separating signal from routine load",
        ],
        say: "The volume is real and the pattern is not one the agent has seen before, which is itself the finding.",
        metrics: [
          { l: "Events", v: "1,940" },
          { l: "Unexplained", v: "1", tone: "warn" },
          { l: "Matched to known", v: "1,939" },
          { l: "Confidence", v: "96%", tone: "ok" },
        ],
        find: [
          "1,939 events map to expected ITSM Portal ticket volume for a Monday EMEA morning",
          "1 latency signature matches no known load profile or change record",
          "Onset is gradual, not a step change — rules out a single deploy or config event",
          "Escalated to the incident queue rather than suppressed",
        ],
        hand: "Hands to Service Health — how bad, and how fast?",
      },
      {
        agent: "service-health",
        ms: 1800,
        phases: ["Receiving task", "Reading portal response times", "Projecting SLA position"],
        say: "Bad enough to matter, slow enough that there is time to think — which is exactly when a human should be the one thinking.",
        metrics: [
          { l: "p95 response", v: "6.2s", tone: "crit" },
          { l: "Baseline", v: "1.1s" },
          { l: "Employees", v: "74,000", tone: "warn" },
          { l: "SLA breach in", v: "34 min", tone: "crit" },
        ],
        find: [
          "Portal p95 degrading steadily since 13:31 UTC — no plateau",
          "Ticket intake for 74,000 employees across all four business units",
          "Self service password resets already failing over to the service desk",
          "71% probability of a response time SLA breach inside 48 hours",
        ],
        hand: "Hands to Root Cause Investigation — find the cause.",
      },
      {
        agent: "root-cause",
        ms: 2600,
        phases: [
          "Receiving task",
          "Scanning 3.4M log lines",
          "Correlating against 7 days of change records",
          "Ranking causal hypotheses",
        ],
        say: "The honest answer. Three hypotheses survive the evidence and none of them dominates — so the agent publishes its uncertainty instead of guessing.",
        metrics: [
          { l: "Lines scanned", v: "3.4M" },
          { l: "Hypotheses", v: "3", tone: "warn" },
          { l: "Confidence", v: "38%", tone: "crit" },
          { l: "Autonomy floor", v: "60%", tone: "warn" },
        ],
        find: [
          "Hypothesis A (38%) — index fragmentation on the task table after the weekend archive job",
          "Hypothesis B (31%) — connection contention from the new Snowflake reporting integration",
          "Hypothesis C (24%) — vendor side platform degradation, unconfirmed by ServiceNow status",
          "No change landed in the window that explains the onset shape",
          "Confidence 38% is below the 60% autonomy floor — escalating rather than acting",
        ],
        hand: "Hands to Dependency Impact — what is exposed while this stays open?",
      },
      {
        agent: "dependency-impact",
        ms: 1900,
        phases: ["Receiving task", "Walking the service graph", "Costing the exposure"],
        say: "Scope and cost, computed precisely. This is the input a human needs, not a decision the agent should make.",
        metrics: [
          { l: "Downstream", v: "6", tone: "warn" },
          { l: "Employees", v: "74,000", tone: "warn" },
          { l: "Open tickets", v: "6,240" },
          { l: "Criticality", v: "Tier 0", tone: "crit" },
        ],
        find: [
          "ITSM Portal is the intake path for every other incident in the estate",
          "Change approval workflow blocked — 3 CAB items cannot progress",
          "Major incident bridge tooling depends on portal auth",
          "Degrading the portal degrades the platform's own ability to respond",
        ],
        hand: "Hands to Knowledge Assistant — has anything like this happened before?",
      },
      {
        agent: "knowledge",
        ms: 1600,
        phases: [
          "Receiving task",
          "Searching runbooks and 14,260 past incidents",
          "Checking for prior art",
        ],
        say: "It searches, finds nothing that fits, and says so. A confident answer here would be worse than no answer.",
        metrics: [
          { l: "Sources searched", v: "14,956" },
          { l: "Runbook match", v: "None", tone: "warn" },
          { l: "Closest prior", v: "62%", tone: "warn" },
          { l: "Novel signature", v: "Yes", tone: "warn" },
        ],
        find: [
          "No runbook covers gradual onset portal latency with no correlated change",
          "Closest prior incident INC-47905 was resolved by a vendor side fix, not by us",
          "Novel signatures are always Tier 3 under the autonomy policy, regardless of confidence",
          "Vendor contact path and escalation terms retrieved and attached",
        ],
        hand: "Hands to Incident Resolution — cost the options, do not choose.",
      },
      {
        agent: "incident-resolution",
        ms: 2000,
        phases: [
          "Receiving task",
          "Drafting containment options",
          "Scoring the blast radius of each",
        ],
        say: "Three options, each with its cost stated. The agent presents; it does not choose.",
        metrics: [
          { l: "Options", v: "3" },
          { l: "Recommended", v: "None", tone: "warn" },
          { l: "Tier", v: "Tier 3", tone: "human" },
          { l: "Elapsed", v: "14 min", tone: "ok" },
        ],
        find: [
          "Option A — rebuild the task table indexes now: 12 min portal outage, tests hypothesis A directly",
          "Option B — throttle the Snowflake reporting integration: no outage, delays overnight analytics, tests hypothesis B",
          "Option C — raise a Sev-2 with the vendor and hold: no disruption, no progress for up to 4 hours",
          "Trade off is a deliberate outage against a slower path — a business judgement, not a technical one",
        ],
        human: {
          owner: "J. Kim — Platform Engineer, EMEA on call",
          paged: "13:52 UTC, acknowledged 13:54 UTC",
          decisions: [
            "Is a 12-minute deliberate portal outage acceptable to test the leading hypothesis?",
            "Does the Snowflake reporting integration get throttled during a promo reporting window?",
            "Do we escalate to the vendor now, and at what contractual severity?",
            "Who tells 74,000 employees that ticket intake is degraded, and in what words?",
          ],
          gave: "Full event timeline across 3.4M log lines, three ranked hypotheses with their evidence, precise downstream exposure, vendor escalation terms and three costed containment options — assembled in 14 minutes, with the confidence of each conclusion stated rather than implied.",
        },
        hand: "Control transfers to the human owner.",
      },
    ],
    outcome: {
      kind: "human",
      title: "Agents complete in 14 minutes — the decision now sits with a human",
      detail:
        "The platform did not pick a hypothesis, take a production outage, or open a vendor severity. It made sure the person who must decide has everything in front of them, and it said plainly that it did not know.",
    },
    halted: {
      title: "Handover cancelled",
      detail: "The investigation remains attached to INC-48207.",
    },
  },

  /* ------------------------------------------------------------------ *
   * INC-48198 — Tier 1. Runs end to end, nobody is paged.
   * ------------------------------------------------------------------ */
  "INC-48198": {
    tier: "Tier 1",
    replay: true,
    headline:
      "Six agents ran this end to end at 13:04 UTC with no human involvement. Replay the pipeline that closed it.",
    steps: [
      {
        agent: "alert-noise",
        ms: 1700,
        phases: [
          "Receiving task",
          "Pulling events from Datadog and Snowflake",
          "Grouping by warehouse",
        ],
        say: "Fourteen alerts across three monitors, all describing one warehouse behaving exactly as it was configured to.",
        metrics: [
          { l: "Raw alerts", v: "14" },
          { l: "After grouping", v: "1", tone: "ok" },
          { l: "Warehouses", v: "1" },
          { l: "Confidence", v: "99%", tone: "ok" },
        ],
        find: [
          "11 alerts are downstream echoes of a single query queue threshold breach",
          "3 duplicate pages suppressed before reaching on call",
          "No paging triggered — below the Critical threshold, analytics only",
        ],
        hand: "Hands to Service Health — is this urgent, or can it wait for business hours?",
      },
      {
        agent: "service-health",
        ms: 1600,
        phases: [
          "Receiving task",
          "Reading queue depth, 14-day window",
          "Projecting time to impact",
        ],
        say: "Growth is linear and predictable. There is time, but not much — this misses the 06:00 reporting SLA if left alone.",
        metrics: [
          { l: "Queue depth", v: "312", tone: "warn" },
          { l: "Baseline", v: "< 20" },
          { l: "SLA miss in", v: "4h 10m", tone: "warn" },
          { l: "Business impact", v: "Reporting only" },
        ],
        find: [
          "WH_BEVERAGES query queue growing 38 jobs/hr since 12:10 UTC",
          "No customer facing impact — Q3 promo reporting freshness only",
          "Would miss the 06:00 UTC Beverages analytics SLA at the current slope",
        ],
        hand: "Hands to Root Cause Investigation — why now?",
      },
      {
        agent: "root-cause",
        ms: 2000,
        phases: [
          "Receiving task",
          "Inspecting warehouse configuration",
          "Correlating against change records",
        ],
        say: "Not a load problem, a configuration mistake. Auto suspend was tightened for a cost test and never put back.",
        metrics: [
          { l: "Time to cause", v: "41s", tone: "ok" },
          { l: "Confidence", v: "96%", tone: "ok" },
          { l: "Change", v: "CFG-2188" },
          { l: "Cold starts", v: "212", tone: "warn" },
        ],
        find: [
          "WH_BEVERAGES auto suspend set to 60s at 11:20 UTC under cost test CFG-2188",
          "CFG-2188 was a 2-hour window that closed at 13:20 — the setting was never reverted",
          "Batch jobs arrive every 90s, so the warehouse cold starts on almost every job",
          "212 cold starts in 90 minutes against a normal baseline of 4",
        ],
        hand: "Hands to Knowledge Assistant — is there an approved runbook for this?",
      },
      {
        agent: "knowledge",
        ms: 1400,
        phases: [
          "Receiving task",
          "Searching the runbook library",
          "Matching against 3 prior incidents",
        ],
        say: "This exact situation has an approved runbook and has been handled the same way three times before.",
        metrics: [
          { l: "Runbook", v: "RB-118" },
          { l: "Prior uses", v: "3" },
          { l: "Success rate", v: "100%", tone: "ok" },
          { l: "Tier", v: "Tier 1", tone: "ok" },
        ],
        find: [
          "RB-118: Restore warehouse auto suspend policy for batch windows — approved, unattended",
          "Steps: restore the 600s policy, drain the queue, verify freshness",
          "Classified Tier 1 — reversible, analytics only, no data loss risk, cost delta under $5K/mo",
        ],
        hand: "Hands to Incident Resolution — authority confirmed, execute.",
      },
      {
        agent: "incident-resolution",
        ms: 2400,
        phases: [
          "Receiving task",
          "Restoring auto suspend to 600s",
          "Draining the query queue",
          "Verifying reporting freshness",
        ],
        say: "Inside its authority, so it simply acts. No approval requested, nobody woken.",
        metrics: [
          { l: "Steps run", v: "3" },
          { l: "Queue now", v: "6", tone: "ok" },
          { l: "Cold starts", v: "0", tone: "ok" },
          { l: "Duration", v: "2m 04s" },
        ],
        find: [
          "Auto suspend restored to 600s for the batch window — verified against policy",
          "Query queue drained 312 → 6 in 94 seconds",
          "Reporting freshness back inside SLA with 3h 40m to spare",
          "Rollback point captured before execution; cost impact +$180/mo, within policy",
        ],
        hand: "Hands to Operations Copilot — close it out.",
      },
      {
        agent: "copilot",
        ms: 1500,
        phases: ["Receiving task", "Writing resolution notes", "Updating ServiceNow"],
        say: "The paperwork writes itself, with the full evidence chain attached.",
        metrics: [
          { l: "Ticket", v: "INC-48198" },
          { l: "Status", v: "Resolved", tone: "ok" },
          { l: "Human time", v: "0m", tone: "ok" },
          { l: "Pages sent", v: "0", tone: "ok" },
        ],
        find: [
          "INC-48198 resolved with cause, actions and verification attached",
          "CFG-2188 annotated: auto suspend not reverted at window close",
          "Suggested guardrail logged for Problem Management review",
          "Owner of record: S. Rahman under policy POL-009 — accountability unchanged",
        ],
      },
    ],
    outcome: {
      kind: "ok",
      title: "Resolved autonomously in 9m 12s — zero human involvement",
      detail:
        "Tier 1 end to end. Nobody was paged, nobody woke up, and the ticket closed itself with a full evidence chain. The only human in the record is the owner the policy names.",
    },
    halted: { title: "Pipeline halted", detail: "No further agent action." },
  },

  /* ------------------------------------------------------------------ *
   * INC-48190 — Tier 1. The loop deciding that nothing needs doing.
   * ------------------------------------------------------------------ */
  "INC-48190": {
    tier: "Tier 1",
    replay: true,
    headline:
      "Five agents ran this at 12:11 UTC and concluded that the correct action was no action. Replay the pipeline.",
    steps: [
      {
        agent: "alert-noise",
        ms: 1600,
        phases: [
          "Receiving task",
          "Ingesting Workday and gateway events",
          "Checking the maintenance calendar",
        ],
        say: "Most availability dips are somebody else's planned work. The agent checks the calendar before it checks anything else.",
        metrics: [
          { l: "Raw alerts", v: "96" },
          { l: "After grouping", v: "1", tone: "ok" },
          { l: "Calendar match", v: "Yes", tone: "ok" },
          { l: "Confidence", v: "97%", tone: "ok" },
        ],
        find: [
          "94 alerts are health check failures against the same Workday tenant",
          "Window overlaps vendor maintenance WD-MNT-4471, 01:00–03:00 APAC",
          "2 duplicate pages suppressed — no on call engaged",
        ],
        hand: "Hands to Service Health — did users actually feel it?",
      },
      {
        agent: "service-health",
        ms: 1500,
        phases: ["Receiving task", "Reading availability and session data", "Scoping user impact"],
        say: "The distinction that matters: an alert fired, but no person was affected.",
        metrics: [
          { l: "Availability", v: "99.1%", tone: "ok" },
          { l: "Failed sessions", v: "0", tone: "ok" },
          { l: "Window", v: "18 min" },
          { l: "Region", v: "APAC only" },
        ],
        find: [
          "Self service unavailable for 18 minutes inside the agreed maintenance window",
          "Zero user sessions attempted in the window — 02:41 local, no APAC HR traffic",
          "Payroll change cutoff is Friday; no cutoff risk from an 18-minute dip",
        ],
        hand: "Hands to Root Cause Investigation — confirm it was the maintenance.",
      },
      {
        agent: "root-cause",
        ms: 1800,
        phases: [
          "Receiving task",
          "Correlating against vendor notices",
          "Verifying recovery signature",
        ],
        say: "Confirmed benign. The agent still writes down why, because a benign finding with no evidence is just a guess.",
        metrics: [
          { l: "Confidence", v: "91%", tone: "ok" },
          { l: "Vendor notice", v: "WD-MNT-4471" },
          { l: "Recovery", v: "Clean", tone: "ok" },
          { l: "Residual risk", v: "None", tone: "ok" },
        ],
        find: [
          "Vendor notice WD-MNT-4471 was received 6 days ago and matches the window exactly",
          "Recovery signature is a clean restart, not a crash loop — no residual instability",
          "Our monitors were never suppressed for the window, which is the actual defect here",
        ],
        hand: "Hands to Incident Resolution — decide whether anything needs doing.",
      },
      {
        agent: "incident-resolution",
        ms: 1700,
        phases: [
          "Receiving task",
          "Evaluating candidate actions",
          "Adding a maintenance suppression rule",
        ],
        say: "The right action was no action on the service, and one small fix to the monitoring that cried wolf.",
        metrics: [
          { l: "Service actions", v: "0", tone: "ok" },
          { l: "Monitoring fixes", v: "1", tone: "ok" },
          { l: "Future noise", v: "−96/mo", tone: "ok" },
          { l: "Duration", v: "41s" },
        ],
        find: [
          "No remediation applied — the service recovered on its own, as expected",
          "Suppression rule added: mute Workday health checks during vendor notified windows",
          "Rule is scoped, replayable for 30 days, and cannot suppress a Critical pattern",
          "Prevents an estimated 96 pointless alerts per month",
        ],
        hand: "Hands to Operations Copilot — close it out.",
      },
      {
        agent: "copilot",
        ms: 1400,
        phases: ["Receiving task", "Writing resolution notes", "Updating ServiceNow"],
        say: "Closed as expected behaviour, with the monitoring gap recorded so the same false alarm is not re investigated next month.",
        metrics: [
          { l: "Ticket", v: "INC-48190" },
          { l: "Status", v: "Resolved", tone: "ok" },
          { l: "Human time", v: "0m", tone: "ok" },
          { l: "Pages sent", v: "0", tone: "ok" },
        ],
        find: [
          "INC-48190 closed as expected behaviour during vendor maintenance",
          "Monitoring gap logged for the Alert Noise Reduction Agent's weekly tuning pass",
          "Vendor Performance Agent notified — window was honoured, no SLA credit due",
        ],
      },
    ],
    outcome: {
      kind: "ok",
      title: "Closed autonomously in 4m 38s — correct action was no action",
      detail:
        "Not every incident needs a fix. The agents confirmed the dip was vendor maintenance, took nothing down, and closed the monitoring gap that raised 96 alerts nobody needed.",
    },
    halted: { title: "Pipeline halted", detail: "No further agent action." },
  },
};
