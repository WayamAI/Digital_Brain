import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppIcon } from "@/components/app-icon";
import { IconButton } from "@/components/icon-button";
import type { IconName } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { navSections } from "@/lib/nav";
import { useRole } from "@/lib/role";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Route -> icon concept. One glyph per destination, reused wherever that
 *  destination is referenced. */
const ICONS: Record<string, IconName> = {
  "/": "dashboard",
  "/incidents": "incident",
  "/approvals": "approval",
  "/alert-noise": "alertNoise",
  "/problems": "problem",
  "/copilot": "copilot",
  "/root-cause": "rootCause",
  "/dependencies": "dependency",
  "/knowledge": "knowledge",
  "/service-health": "serviceHealth",
  "/predictive": "predictive",
  "/change-risk": "changeRisk",
  "/capacity": "capacity",
  "/cost": "cost",
  "/vendors": "vendor",
  "/compliance": "compliance",
  "/executive-briefing": "briefing",
  "/agents": "agents",
  "/autonomy": "autonomy",
  "/integrations": "integrations",
  "/users": "users",
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

/**
 * One navigation destination.
 *
 *   inactive  surface.action plate (rail only) + icon.tertiary
 *   hover     surface.raised + icon.secondary
 *   active    action-surface.primary (the light plate) + icon.on-color
 *
 * Collapsed, this is the icon rail the design system calls for: a 36px
 * strongly rounded button, no label, aria-label carrying the name. Expanded,
 * it keeps its label because 21 destinations across 6 named groups cannot be
 * navigated by glyph alone.
 */
function SidebarItem({
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
  const icon = ICONS[to] ?? "node";
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "transition-ui group flex items-center text-secondary outline-none",
        "hover:bg-raised hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40",
        // data-status is set by the router; the attribute selector outranks the
        // resting colour above, so active always wins without !important.
        "data-[status=active]:bg-action-primary data-[status=active]:text-action-primary-content",
        "data-[status=active]:hover:bg-action-primary-hover",
        "data-[status=active]:hover:text-action-primary-content",
        collapsed
          ? "mx-auto h-9 w-9 justify-center rounded-full bg-action text-icon-tertiary"
          : "gap-3 rounded-lg px-3 py-2 type-label-md",
      )}
      title={collapsed ? label : undefined}
    >
      <AppIcon name={icon} size="lg" />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && (
        <span
          className={cn(
            "num ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full border px-1.5 text-4xs font-semibold",
            "border-warning-stroke bg-warning-bg text-warning-content",
            // On the light active plate the warning fill has nothing to sit on.
            "group-data-[status=active]:border-transparent",
            "group-data-[status=active]:bg-action-primary-content/12",
            "group-data-[status=active]:text-action-primary-content",
          )}
        >
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = title ?? TITLES[pathname] ?? "Control Tower";
  const section = SECTION_OF[pathname];

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Backdrop for the off canvas sidebar below the md breakpoint. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-page/70 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-muted bg-container transition-transform duration-200 md:relative md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-[68px]" : "w-[244px]",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-2.5 border-b border-muted",
            collapsed ? "px-2 py-4" : "px-4 pb-4 pt-5",
          )}
        >
          {/* Wayam mark. The rail is too narrow for the wordmark, so it falls
              back to the square brand tile — same asset the favicon uses. */}
          {collapsed ? (
            <img src="/favicon.svg" alt="Wayam AI" className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <>
              <img
                src="/wayam-logo-light.svg"
                alt="Wayam AI"
                className="h-[52px] w-auto max-w-[204px] object-contain dark:hidden"
              />
              <img
                src="/wayam-logo-dark.svg"
                alt="Wayam AI"
                className="hidden h-[52px] w-auto max-w-[204px] object-contain dark:block"
              />
            </>
          )}
          {!collapsed && (
            <>
              <div className="h-px w-8 bg-default" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display text-display-base text-primary">Digital Brain</span>
                <span className="type-label-sm text-quaternary">Agentic IT Operations</span>
              </div>
            </>
          )}
        </div>

        <nav className={cn("flex-1 space-y-2 overflow-y-auto py-3", collapsed ? "px-2" : "px-2.5")}>
          <SidebarItem to="/" label="Control Tower" collapsed={collapsed} />
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
                    className="transition-ui flex w-full items-center gap-1.5 px-3 pb-1 pt-3 type-label-sm text-quaternary hover:text-secondary"
                  >
                    {s.section}
                    <AppIcon
                      name="chevronDown"
                      size="xs"
                      className={cn("transition-transform", !open && "-rotate-90")}
                    />
                  </button>
                )}
                {(open || collapsed) && (
                  <div className="space-y-0.5">
                    {s.items.map((i) => (
                      <SidebarItem key={i.to} {...i} collapsed={collapsed} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom utility row — same button treatment as the nav items. */}
        <div
          className={cn(
            "flex items-center gap-2 border-t border-muted px-2.5 py-2.5",
            collapsed && "justify-center px-2",
          )}
        >
          <IconButton
            icon={collapsed ? "chevronRight" : "chevronLeft"}
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            variant="subtle"
            size="sm"
            onClick={() => setCollapsed((c) => !c)}
          />
          {!collapsed && <span className="type-caption text-quaternary">Collapse sidebar</span>}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 shrink-0 border-b border-muted bg-container/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-5 py-2.5">
            <IconButton
              icon="menu"
              label="Open navigation"
              variant="subtle"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 type-caption text-tertiary">
                <Link
                  to="/"
                  aria-label="Control Tower"
                  className="transition-ui inline-flex items-center gap-1.5 hover:text-primary"
                >
                  <AppIcon name="home" size="xs" />
                  Digital Brain
                </Link>
                {section && (
                  <>
                    <span>/</span>
                    <span>{section}</span>
                  </>
                )}
                <span>/</span>
                <span className="text-secondary">{pageTitle}</span>
              </div>
              <h1 className="truncate type-display-page text-primary">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-default bg-action px-2.5 py-1 type-caption text-tertiary lg:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Live · synced {synced}s ago
              </span>
              <span className="hidden items-center gap-1.5 type-caption text-tertiary xl:inline-flex">
                <AppIcon name="cloud" size="sm" className="text-icon-tertiary" /> 10 integrations ·
                1 degraded
              </span>
              <ThemeToggle />
              <div className="flex items-center gap-2 rounded-lg border border-default bg-action px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand type-caption font-semibold text-brand-foreground">
                  {role.who.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className="type-label-md text-primary">{role.who}</div>
                  <div className="type-caption text-tertiary">{role.name}</div>
                </div>
                <Link
                  to="/login"
                  className="transition-ui ml-1 type-caption text-tertiary hover:text-primary"
                >
                  Switch
                </Link>
                <button
                  onClick={handleLogout}
                  className="transition-ui ml-1 flex items-center gap-1 type-caption text-tertiary hover:text-error"
                  aria-label="Log out"
                >
                  <AppIcon name="logout" size="xs" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {(intro || actions) && (
            <div className="mb-4 flex flex-wrap items-start gap-3">
              {intro && <p className="max-w-3xl type-body-md text-secondary">{intro}</p>}
              {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
            </div>
          )}
          {children}
          <footer className="mt-8 flex items-center gap-2 border-t border-muted pt-4 type-caption text-quaternary">
            <AppIcon name="success" size="sm" className="text-success" />
            Demo environment — all systems, tickets, names and figures shown are synthetic and
            illustrative.
            <span className="ml-auto inline-flex items-center gap-1">
              <AppIcon name="chart" size="sm" className="text-icon-quaternary" /> Digital Brain
              v2.8.4 · PepsiCo Global IT
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
