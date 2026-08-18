import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type Tone = "ok" | "warn" | "crit" | "info" | "muted" | "human";

const TONE_CLASS: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok border-ok/25",
  warn: "bg-warn-soft text-warn-ink border-warn/30",
  crit: "bg-crit-soft text-crit border-crit/25",
  info: "bg-info-soft text-info border-info/25",
  muted: "bg-muted text-muted-foreground border-border",
  human: "bg-human-soft text-human border-human/25",
};

export function toneFor(v: string): Tone {
  const s = v.toLowerCase();
  // Tier 3 is human owned; it gets its own colour everywhere it appears.
  if (s.includes("tier 3")) return "human";
  if (/(critical|breach|disconnected|escalated|open exception|reschedule|degraded|high|failed)/.test(s))
    return s.includes("high") || s.includes("degraded") || s.includes("reschedule") ? "warn" : "crit";
  if (/(awaiting|pending|warning|medium|remediating|in progress|paused|elevated|add rollback)/.test(s))
    return "warn";
  if (/(healthy|resolved|active|success|ok|low|proceed|fix shipped|no action|nominal)/.test(s))
    return "ok";
  if (/(executing|running|tier 1|tier 2|tier 3)/.test(s)) return "info";
  return "muted";
}

export function Pill({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: Tone | undefined;
  className?: string | undefined;
}) {
  const t = tone ?? (typeof children === "string" ? toneFor(children) : "muted");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASS[t],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", `bg-current`)} />
      {children}
    </span>
  );
}

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
    <section className={cn("card-surface flex flex-col", className)}>
      {(title || right) && (
        <header className="flex items-start gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>}
            {desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>}
          </div>
          {right && <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>}
        </header>
      )}
      <div className={cn("min-w-0 flex-1", pad && "p-4")}>{children}</div>
    </section>
  );
}

const TREND_CLASS: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn-ink",
  crit: "text-crit",
  info: "text-accent",
  muted: "text-muted-foreground",
  human: "text-human",
};

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
  const bar: Record<Tone, string> = {
    ok: "bg-ok",
    warn: "bg-warn",
    crit: "bg-crit",
    info: "bg-accent",
    muted: "bg-border",
    human: "bg-human",
  };
  return (
    <div className="card-surface relative overflow-hidden p-3.5">
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", bar[tone])} />
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="num mt-1.5 text-[26px] font-bold leading-none">{value}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
        {trend && (
          <span className={cn("ml-auto text-[11px] font-medium", TREND_CLASS[tone])}>{trend}</span>
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
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            {cols.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "select-none px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                  c.align === "right" && "text-right",
                )}
              >
                <button
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() =>
                    setSort((s) =>
                      s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 },
                    )
                  }
                >
                  {c.header}
                  {sort?.key === c.key ? (
                    sort.dir === 1 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ChevronsUpDown className="h-3 w-3 opacity-40" />
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
                  "border-b border-border/70 last:border-0",
                  onRow && "cursor-pointer",
                  "hover:bg-muted/70",
                  activeKey && activeKey === k && "bg-info-soft hover:bg-info-soft",
                )}
              >
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 align-top",
                      dense ? "py-1.5" : "py-2.5",
                      c.align === "right" && "text-right num",
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
  variant?: "default" | "outline" | "ghost" | "ok" | "danger" | "accent" | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
  size?: "sm" | "md" | undefined;
  type?: "button" | "submit" | undefined;
  disabled?: boolean | undefined;
}) {
  const styles: Record<string, string> = {
    default: "bg-brand text-brand-foreground hover:bg-brand/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    ok: "bg-ok text-primary-foreground hover:bg-ok/90",
    danger: "bg-crit text-primary-foreground hover:bg-crit/90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

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
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {groups.map((g) => (
        <label key={g.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {g.label}
          <select
            value={state[g.key] ?? "All"}
            onChange={(e) => onChange(g.key, e.target.value)}
            className="rounded-md border border-border bg-card px-2 py-1 text-[12px] text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          >
            {["All", ...g.options].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      ))}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function ExportBtn({ label = "Export CSV" }: { label?: string }) {
  return (
    <Btn
      variant="outline"
      size="sm"
      onClick={() => toast.success(`${label} complete`, { description: "File ready in your downloads." })}
    >
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
  const bar: Record<Tone, string> = {
    ok: "bg-ok",
    warn: "bg-warn",
    crit: "bg-crit",
    info: "bg-accent",
    muted: "bg-border",
    human: "bg-human",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", bar[tone])} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="num text-[12px] text-muted-foreground">{value}%</span>
    </div>
  );
}

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
      <div className="absolute inset-0 bg-foreground/25" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-card shadow-xl">
        <div className="sticky top-0 flex items-start gap-3 border-b border-border bg-card px-5 py-3.5">
          <div>
            <h3 className="text-[14px] font-semibold">{title}</h3>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <Btn variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
            Close
          </Btn>
        </div>
        <div className="space-y-4 px-5 py-4 text-[13px]">{children}</div>
      </div>
    </div>
  );
}

export function KeyVals({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[12px]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-foreground">{v}</dd>
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
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: 11 },
} as const;
