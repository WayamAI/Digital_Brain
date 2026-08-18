import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ROLES } from "@/data/db";
import { setRole, type RoleId } from "@/lib/role";
import { login } from "@/lib/auth";
import { Btn } from "@/components/kit";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Digital Brain" },
      {
        name: "description",
        content: "Sign in to Digital Brain, the Wayam AI agentic IT operations command center.",
      },
      { property: "og:title", content: "Sign in — Digital Brain" },
      {
        property: "og:description",
        content: "Sign in to enter the Digital Brain control tower.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const [step, setStep] = useState<"credentials" | "role">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sel, setSel] = useState<RoleId>("manager");
  const navigate = useNavigate();

  function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // Simulated network latency so the loading state is visible in the demo.
    window.setTimeout(() => {
      const err = login(email, password);
      setSubmitting(false);
      if (err) {
        setError(err);
        return;
      }
      setStep("role");
    }, 400);
  }

  function handleEnter() {
    setRole(sel);
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between bg-ink px-12 py-12 lg:flex">
        <div className="flex items-center gap-4">
          {/* Dark ground variant of the Wayam mark — renders untouched, no plate needed. */}
          <img src="/wayam-logo-dark.svg" alt="Wayam AI" className="h-11 w-auto object-contain" />
          <div>
            <div className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-ink-foreground">
              Digital Brain
            </div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Agentic IT Operations
            </div>
          </div>
        </div>

        <div className="max-w-lg">
          <h2 className="text-3xl font-bold leading-tight text-ink-foreground">
            Observe. Understand. Decide. Act. Learn.
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            A closed loop fleet of 15 specialised agents watching the PepsiCo IT estate across
            Beverages, Frito Lay, Quaker and Global Business Services — resolving what it can,
            escalating what it should.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-6">
            {[
              ["92.5%", "alert noise suppressed"],
              ["27 min", "median MTTR"],
              ["0%", "accountability transferred"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="num text-2xl font-bold text-ink-foreground">{v}</dt>
                <dd className="mt-1 text-[11px] leading-snug text-ink-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="flex items-center gap-2 text-[11px] text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          Demo environment — synthetic data only. No production credentials or real incident
          records.
        </p>
      </div>

      <div className="flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>

          {step === "credentials" ? (
            <>
              <h1 className="text-[22px] font-semibold tracking-tight">Sign in to Digital Brain</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Demo access: any valid email address and password will work.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleCredentials} noValidate>
                <div>
                  <label htmlFor="email" className="block text-[12px] font-medium text-foreground">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[12px] font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-md border border-crit/25 bg-crit-soft px-3 py-2 text-[12px] text-crit">
                    {error}
                  </p>
                )}

                <Btn type="submit" className="w-full py-2.5 text-[13px]" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Btn>
              </form>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Demo environment · any syntactically valid email and non empty password
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[22px] font-semibold tracking-tight">Choose your role</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Single sign on determines this in production. Select a role for this demo
                session.
              </p>

              <div className="mt-6 space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSel(r.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      sel === r.id
                        ? "border-accent bg-info-soft"
                        : "border-border hover:border-accent/50 hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                        sel === r.id ? "border-accent bg-accent" : "border-border",
                      )}
                    />
                    <span>
                      <span className="block text-[13px] font-medium">{r.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{r.desc}</span>
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{r.who}</span>
                  </button>
                ))}
              </div>

              <Btn className="mt-6 w-full py-2.5 text-[13px]" onClick={handleEnter}>
                Enter Control Tower
              </Btn>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Default role: IT Ops Manager · Session scoped to PepsiCo Global IT (demo tenant)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
