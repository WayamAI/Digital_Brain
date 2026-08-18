import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircuitBoard,
  ClipboardList,
  Cloud,
  DollarSign,
  FileText,
  GitBranch,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  MessagesSquare,
  Plug,
  Radar,
  Search,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { navSections } from "@/lib/nav";
import { useRole } from "@/lib/role";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Activity> = {
  "/": LayoutDashboard,
  "/incidents": AlertTriangle,
  "/approvals": BadgeCheck,
  "/alert-noise": Radar,
  "/problems": ListChecks,
  "/copilot": MessagesSquare,
  "/root-cause": Search,
  "/dependencies": GitBranch,
  "/knowledge": LifeBuoy,
  "/service-health": Activity,
  "/predictive": TrendingUp,
  "/change-risk": ClipboardList,
  "/capacity": Gauge,
  "/cost": DollarSign,
  "/vendors": Building2,
  "/compliance": ShieldCheck,
  "/executive-briefing": FileText,
  "/agents": Boxes,
  "/autonomy": Sliders,
  "/integrations": Plug,
  "/users": Users,
};

const TITLES: Record<string, string> = Object.fromEntries([
  ["/", "Control Tower"],
  ...navSections.flatMap((s) => s.items.map((i) => [i.to, i.label])),
]);

const SECTION_OF: Record<string, string> = Object.fromEntries(
  navSections.flatMap((s) => s.items.map((i) => [i.to, s.section])),
);

export function useSync() {
  const [secs, setSecs] = useState(6);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 40 ? 2 : s + 2)), 2000);
    return () => clearInterval(t);
  }, []);
  return secs;
}

function SidebarLink({
  to,
  label,
  badge,
  collapsed,
}: {
  to: string;
  label: string;
  badge?: string;
  collapsed: boolean;
}) {
  const Icon = ICONS[to] ?? CircuitBoard;
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3.5 py-[9px] text-[13px] font-medium text-nav-muted transition-colors hover:bg-nav-elevated/60 hover:text-nav-foreground",
        collapsed && "justify-center px-0",
      )}
      activeProps={{ className: "bg-nav-elevated text-ok font-bold" }}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && (
        <span className="num ml-auto grid h-[19px] min-w-[19px] place-items-center rounded-full bg-warn px-[5px] text-[10px] font-bold text-[hsl(38_10%_10%)]">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppShell({
  children,
  title,
  intro,
  actions,
}: {
  children: ReactNode;
  title?: string | undefined;
  intro?: string | undefined;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useRole();
  const synced = useSync();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }
  const [closed, setClosed] = useState<string[]>([]);

  const pageTitle = title ?? TITLES[pathname] ?? "Control Tower";
  const section = SECTION_OF[pathname];

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-nav md:flex",
          collapsed ? "w-[64px]" : "w-[244px]",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-2.5 border-b border-sidebar-border",
            collapsed ? "px-2 py-4" : "px-4 pb-[18px] pt-[22px]",
          )}
        >
          {/* Wayam mark — light variant on the light sidebar, dark variant when the sidebar goes dark. */}
          <img
            src="/wayam-logo-light.svg"
            alt="Wayam AI"
            className={cn(
              "w-auto object-contain dark:hidden",
              collapsed ? "h-7 max-w-full" : "h-[52px] max-w-[204px]",
            )}
          />
          <img
            src="/wayam-logo-dark.svg"
            alt="Wayam AI"
            className={cn(
              "hidden w-auto object-contain dark:block",
              collapsed ? "h-7 max-w-full" : "h-[52px] max-w-[204px]",
            )}
          />
          {!collapsed && (
            <>
              <div className="h-px w-[34px] bg-border" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-nav-foreground">
                  Digital Brain
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-nav-muted opacity-75">
                  Agentic IT Operations
                </span>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <SidebarLink to="/" label="Control Tower" collapsed={collapsed} />
          {navSections.map((s) => {
            const open = !closed.includes(s.section);
            return (
              <div key={s.section}>
                {!collapsed && (
                  <button
                    onClick={() =>
                      setClosed((c) =>
                        c.includes(s.section)
                          ? c.filter((x) => x !== s.section)
                          : [...c, s.section],
                      )
                    }
                    className="flex w-full items-center gap-1 px-3.5 pb-1.5 pt-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-nav-muted/60 hover:text-nav-foreground"
                  >
                    {s.section}
                    <ChevronDown
                      className={cn("h-3 w-3 transition-transform", !open && "-rotate-90")}
                    />
                  </button>
                )}
                {(open || collapsed) && (
                  <div className="space-y-px">
                    {s.items.map((i) => (
                      <SidebarLink key={i.to} {...i} collapsed={collapsed} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="border-t border-sidebar-border px-3 py-2.5 text-left text-[11px] text-nav-muted hover:text-nav-foreground"
        >
          {collapsed ? "»" : "« Collapse sidebar"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-5 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Link to="/" className="hover:text-foreground">
                  Digital Brain
                </Link>
                {section && (
                  <>
                    <span>/</span>
                    <span>{section}</span>
                  </>
                )}
                <span>/</span>
                <span className="text-foreground">{pageTitle}</span>
              </div>
              <h1 className="truncate text-[17px] font-semibold tracking-tight">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground lg:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
                </span>
                Live · synced {synced}s ago
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground xl:inline-flex">
                <Cloud className="h-3.5 w-3.5" /> 10 integrations · 1 degraded
              </span>
              <ThemeToggle />
              <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">
                  {role.who.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className="text-[12px] font-medium">{role.who}</div>
                  <div className="text-[10px] text-accent">{role.name}</div>
                </div>
                <Link
                  to="/login"
                  className="ml-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Switch
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-crit"
                  aria-label="Log out"
                >
                  <LogOut className="h-3 w-3" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-5">
          {(intro || actions) && (
            <div className="mb-4 flex flex-wrap items-start gap-3">
              {intro && (
                <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                  {intro}
                </p>
              )}
              {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
            </div>
          )}
          {children}
          <footer className="mt-8 flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-ok" />
            Demo environment — all systems, tickets, names and figures shown are synthetic and
            illustrative.
            <span className="ml-auto inline-flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> Digital Brain v2.8.4 · PepsiCo Global IT
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
