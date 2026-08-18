export type NavItem = { label: string; to: string; badge?: string };
export type NavSection = { section: string; items: NavItem[] };

export const navSections: NavSection[] = [
  {
    section: "Operate",
    items: [
      { label: "Incident Queue", to: "/incidents", badge: "5" },
      { label: "Approval Queue", to: "/approvals", badge: "2" },
      { label: "Alert Noise Reduction", to: "/alert-noise" },
      { label: "Problem Management", to: "/problems" },
      { label: "Operations Copilot", to: "/copilot" },
    ],
  },
  {
    section: "Understand",
    items: [
      { label: "Root Cause Investigation", to: "/root-cause" },
      { label: "Dependency Impact Map", to: "/dependencies" },
      { label: "Knowledge Assistant", to: "/knowledge" },
    ],
  },
  {
    section: "Predict & Plan",
    items: [
      { label: "Service Health Monitor", to: "/service-health" },
      { label: "Predictive Operations", to: "/predictive" },
      { label: "Change Risk Advisor", to: "/change-risk" },
      { label: "Capacity Planning", to: "/capacity" },
    ],
  },
  {
    section: "Cost & Vendors",
    items: [
      { label: "Cost Optimization (FinOps)", to: "/cost" },
      { label: "Vendor Performance", to: "/vendors" },
    ],
  },
  {
    section: "Governance",
    items: [
      { label: "Compliance Operations", to: "/compliance", badge: "1" },
      { label: "Executive Operations Briefing", to: "/executive-briefing" },
    ],
  },
  {
    section: "Platform",
    items: [
      { label: "Agent Fleet", to: "/agents" },
      { label: "Autonomy Model & Guardrails", to: "/autonomy" },
      { label: "Integrations", to: "/integrations" },
      { label: "Users & Roles", to: "/users" },
    ],
  },
];
