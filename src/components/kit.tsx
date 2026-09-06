import { useMemo, useState, type ReactNode } from "react";
import { AppIcon } from "@/components/app-icon";
import type { IconName } from "@/components/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Tone is the product's status vocabulary. Every tone resolves to a
 * feedback.* token group — nothing in this file reaches for a raw colour.
 *
 *   ok    -> feedback.success      warn  -> feedback.warning
 *   crit  -> feedback.error        info  -> feedback.info
 *   muted -> feedback.neutral      human -> Tier 3, human owned (indigo)
 */
export type Tone = "ok" | "warn" | "crit" | "info" | "muted" | "human";

const TONE_CLASS: Record<Tone, string> = {
  ok: "bg-success-bg text-success-content border-success-stroke",
  warn: "bg-warning-bg text-warning-content border-warning-stroke",
  crit: "bg-error-bg text-error-content border-error-stroke",
  info: "bg-info-bg text-info-content border-info-stroke",
  muted: "bg-neutral-bg text-neutral-content border-neutral-stroke",
  human: "bg-human-soft text-human border-human/25",
};

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-success",
  warn: "text-warning",
  crit: "text-error",
  info: "text-info",
  muted: "text-quaternary",
  human: "text-human",
};

const TONE_FILL: Record<Tone, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  crit: "bg-error",
  info: "bg-info",
  muted: "bg-neutral",
  human: "bg-human",
};

export function toneFor(v: string): Tone {
  const s = v.toLowerCase();
  // Tier 3 is human owned; it gets its own colour everywhere it appears.
  if (s.includes("tier 3")) return "human";
  if (
    /(critical|breach|disconnected|escalated|open exception|reschedule|degraded|high|failed)/.test(
      s,
    )
  )
    return s.includes("high") || s.includes("degraded") || s.includes("reschedule")
      ? "warn"
      : "crit";
  if (
    /(awaiting|pending|warning|medium|remediating|in progress|paused|elevated|add rollback)/.test(s)
  )
    return "warn";
  if (/(healthy|resolved|active|success|ok|low|proceed|fix shipped|no action|nominal)/.test(s))
    return "ok";
  if (/(executing|running|tier 1|tier 2|tier 3)/.test(s)) return "info";
  return "muted";
}

/**
 * The canonical status chip. Colour comes entirely from feedback.* tokens, so
 * a "critical" badge reads identically in a table, on a card and in a header.
 */
export function StatusBadge({
  children,
  tone,
  dot = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone | undefined;
  dot?: boolean | undefined;
  className?: string | undefined;
}) {
  const t = tone ?? (typeof children === "string" ? toneFor(children) : "muted");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 type-caption font-medium",
        TONE_CLASS[t],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Historic name for StatusBadge. Kept so the 25 screens don't churn. */
export const Pill = StatusBadge;

export function Panel({
  title,
  desc,
  right,
  children,
  className,
  pad = true,
}: {
  title?: string | undefined;
  desc?: string | undefined;
  right?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
  pad?: boolean | undefined;
}) {
  return (
    <section className={cn("card-surface flex h-full flex-col", className)}>
      {(title || right) && (
        <header className="flex items-start gap-3 border-b border-muted px-4 py-2.5">
          <div className="min-w-0">
            {title && <h2 className="type-heading-md text-primary">{title}</h2>}
            {desc && <p className="mt-0.5 type-caption text-tertiary">{desc}</p>}
          </div>
          {right && <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>}
        </header>
      )}
      <div className={cn("min-w-0 flex-1", pad && "p-4")}>{children}</div>
    </section>
  );
}

/**
 * Trend strings arrive in several shapes — "↑ 0.8%", "↓ 88%", "→ 0",
 * "+1 vs. yesterday", "SLA 15 min". Parse the direction off the front so the
 * tile can draw one real arrow icon instead of shipping a glyph in the copy
 * (and rendering two arrows side by side).
 */
function readTrend(trend: string): { icon: IconName | null; text: string } {
  const t = trend.trim();
  if (t.startsWith("\u2191")) return { icon: "arrowUp", text: t.slice(1).trim() };
  if (t.startsWith("\u2193")) return { icon: "arrowDown", text: t.slice(1).trim() };
  if (t.startsWith("\u2192")) return { icon: "arrowRight", text: t.slice(1).trim() };
  if (t.startsWith("+")) return { icon: "arrowUp", text: t };
  if (t.startsWith("-")) return { icon: "arrowDown", text: t };
  return { icon: null, text: t };
}

/**
 * A KPI tile. The value is the only Michroma on the card; everything else is
 * Geist. The bar under the label is segmented rather than solid — it reads as
 * a gauge, which is the point, and it survives being small.
 */
export function Kpi({
  label,
  value,
  sub,
  tone = "info",
  trend,
}: {
  label: string;
  value: string;
  sub?: string | undefined;
  tone?: Tone | undefined;
  trend?: string | undefined;
}) {
  const lit = { ok: 5, info: 4, warn: 3, human: 3, crit: 2, muted: 1 }[tone];
  const t = trend ? readTrend(trend) : null;
  return (
    <div className="card-surface transition-ui flex h-full flex-col p-3.5 hover:border-active">
      {/* Two lines are reserved for the label whether or not it needs them.
          Without this a one-line label lifts its metric above its neighbours
          and the row of tiles reads as ragged. */}
      <span className="line-clamp-2 min-h-[2.1em] type-label-sm text-quaternary">{label}</span>
      <div className="mt-1.5 type-display-metric text-primary">{value}</div>
      {/* Segmented status bar — five steps, lit according to tone. */}
      <div className="mt-3 flex gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-[3px] flex-1 rounded-full", i < lit ? TONE_FILL[tone] : "bg-action")}
          />
        ))}
      </div>
      {/* Pinned to the bottom edge, so every footer in the row shares a line. */}
      <div className="mt-auto flex items-end gap-2 pt-2.5">
        {sub && <span className="type-caption text-tertiary">{sub}</span>}
        {t && (
          <span
            className={cn(
              "num ml-auto inline-flex shrink-0 items-center gap-1 type-caption font-medium",
              TONE_TEXT[tone],
            )}
          >
            {t.icon && <AppIcon name={t.icon} size="xs" />}
            {t.text}
          </span>
        )}
      </div>
    </div>
  );
}

export type Col<T> = {
  key: string;
  header: string;
  cell?: (row: T) => ReactNode;
  value?: (row: T) => string | number;
  align?: "right";
  width?: string;
};

export function DataTable<T extends object>({
  cols,
  rows,
  onRow,
  activeKey,
  rowKey,
  dense,
}: {
  cols: Col<T>[];
  rows: T[];
  onRow?: ((row: T) => void) | undefined;
  activeKey?: string | undefined;
  rowKey?: ((row: T) => string) | undefined;
  dense?: boolean | undefined;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = cols.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = (r: T) =>
      col.value ? col.value(r) : ((r as Record<string, unknown>)[col.key] as string | number);
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      if (typeof x === "number" && typeof y === "number") return (x - y) * sort.dir;
      return String(x).localeCompare(String(y)) * sort.dir;
    });
  }, [rows, sort, cols]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse type-body-md">
        {/* Sticky-header ready: the thead sits at the top of any scroll parent. */}
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-default bg-raised-2">
            {cols.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "select-none px-3 py-2 text-left type-label-sm text-quaternary",
                  c.align === "right" && "text-right",
                )}
              >
                <button
                  className="transition-ui inline-flex items-center gap-1 hover:text-secondary"
                  onClick={() =>
                    setSort((s) =>
                      s?.key === c.key
                        ? { key: c.key, dir: s.dir === 1 ? -1 : 1 }
                        : { key: c.key, dir: 1 },
                    )
                  }
                >
                  {c.header}
                  {sort?.key === c.key ? (
                    <AppIcon name={sort.dir === 1 ? "arrowUp" : "arrowDown"} size="xs" />
                  ) : (
                    <AppIcon name="sort" size="xs" className="text-icon-quaternary opacity-50" />
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const k = rowKey?.(r) ?? String(i);
            return (
              <tr
                key={k}
                onClick={() => onRow?.(r)}
                className={cn(
                  "transition-ui border-b border-muted last:border-0",
                  onRow && "cursor-pointer",
                  "hover:bg-raised-2",
                  activeKey && activeKey === k && "bg-info-bg hover:bg-info-bg",
                )}
              >
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 align-top text-secondary",
                      dense ? "py-1.5" : "py-2",
                      c.align === "right" && "num text-right",
                    )}
                  >
                    {c.cell ? c.cell(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Btn({
  children,
  variant = "default",
  onClick,
  className,
  size = "md",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "ok" | "danger" | "accent" | "primary" | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
  size?: "sm" | "md" | undefined;
  type?: "button" | "submit" | undefined;
  disabled?: boolean | undefined;
}) {
  const styles: Record<string, string> = {
    // The one inverse CTA per screen: near-white plate, near-black content.
    primary: "bg-action-primary text-action-primary-content hover:bg-action-primary-hover",
    default: "bg-brand text-brand-foreground hover:bg-brand/90",
    accent: "bg-info text-on-color hover:bg-info/90",
    outline: "border border-default bg-action text-secondary hover:bg-raised hover:text-primary",
    ghost: "bg-action-tertiary text-tertiary hover:bg-action-tertiary-hover hover:text-primary",
    ok: "bg-success text-on-color hover:bg-success/90",
    danger: "bg-error text-on-color hover:bg-error/90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "transition-ui inline-flex items-center justify-center gap-1.5 rounded-lg font-medium outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "px-2.5 py-1 type-caption" : "px-3 py-1.5 type-label-md",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * A filter pill. Dark plate, hairline stroke, compact — and never a generic
 * blue when selected; selected rides action-surface.primary like every other
 * "this one is chosen" state in the app.
 */
export function FilterChip({
  children,
  selected,
  onClick,
  className,
}: {
  children: ReactNode;
  selected?: boolean | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "transition-ui inline-flex h-7 items-center whitespace-nowrap rounded-full border px-2.5 type-caption font-medium outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/40",
        selected
          ? "border-transparent bg-action-primary text-action-primary-content"
          : "border-default bg-action text-tertiary hover:bg-raised hover:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Filter bar. Small option sets render as chips — faster to scan and to hit
 * than a select; anything longer stays a select so the bar cannot run away.
 */
export function Filters({
  groups,
  state,
  onChange,
  right,
}: {
  groups: { key: string; label: string; options: string[] }[];
  state: Record<string, string>;
  onChange: (key: string, value: string) => void;
  right?: ReactNode;
}) {
  const CHIP_LIMIT = 5;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {groups.map((g) => {
        const current = state[g.key] ?? "All";
        const options = ["All", ...g.options];
        return (
          <div key={g.key} className="flex flex-wrap items-center gap-1.5">
            <span className="type-label-sm text-quaternary">{g.label}</span>
            {options.length <= CHIP_LIMIT ? (
              options.map((o) => (
                <FilterChip key={o} selected={current === o} onClick={() => onChange(g.key, o)}>
                  {o}
                </FilterChip>
              ))
            ) : (
              <select
                aria-label={g.label}
                value={current}
                onChange={(e) => onChange(g.key, e.target.value)}
                className="transition-ui h-7 rounded-full border border-default bg-action px-2.5 type-caption text-secondary outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function ExportBtn({ label = "Export CSV" }: { label?: string }) {
  return (
    <Btn
      variant="outline"
      size="sm"
      onClick={() =>
        toast.success(`${label} complete`, { description: "File ready in your downloads." })
      }
    >
      <AppIcon name="export" size="sm" />
      {label}
    </Btn>
  );
}

export function useRunAction(ms = 2200) {
  const [running, setRunning] = useState(false);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const run = (message: string) => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setRanAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      toast.success(message);
    }, ms);
  };
  return { running, ranAt, run };
}

export function Meter({ value, tone = "info" }: { value: number; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-action">
        <div
          className={cn("h-full rounded-full", TONE_FILL[tone])}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="num type-caption text-tertiary">{value}%</span>
    </div>
  );
}

/**
 * The record detail panel. On desktop it is a fixed 340px column pinned to the
 * shell's right edge — it reads as part of the chrome, not as a modal. Below
 * lg it becomes a full-width overlay drawer.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-page/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-default bg-container shadow-raised lg:max-w-[340px]">
        <div className="sticky top-0 flex items-start gap-3 border-b border-muted bg-container px-4 py-3">
          <div className="min-w-0">
            <h3 className="type-heading-lg text-primary">{title}</h3>
            {subtitle && <p className="type-caption text-tertiary">{subtitle}</p>}
          </div>
          <div className="ml-auto">
            <Btn variant="ghost" size="sm" onClick={onClose}>
              Close
            </Btn>
          </div>
        </div>
        <div className="space-y-4 px-4 py-4 type-body-md text-secondary">{children}</div>
      </div>
    </div>
  );
}

export function KeyVals({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 type-body-sm">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-tertiary">{k}</dt>
          <dd className="text-primary">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export const axisProps = {
  stroke: "var(--text-quaternary)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyle = {
  contentStyle: {
    background: "var(--surface-raised-x2)",
    border: "1px solid var(--stroke-default)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--text-primary)",
  },
  labelStyle: { color: "var(--text-tertiary)", fontSize: 11 },
} as const;
