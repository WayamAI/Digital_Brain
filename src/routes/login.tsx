import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppIcon } from "@/components/app-icon";
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
      <div className="relative hidden flex-col justify-between overflow-hidden brand-hero px-12 py-12 lg:flex">
        <div className="flex flex-col items-start gap-3">
          {/* Dark ground variant of the Wayam mark — renders untouched, no plate needed. */}
          <img
            src="/wayam-logo-dark.svg"
            alt="Wayam AI"
            className="h-32 w-auto object-contain xl:h-40"
          />
          <div>
            <div className="text-sm font-extrabold uppercase tracking-[0.16em] text-ink-foreground">
              Digital Brain
            </div>
            <div className="mt-0.5 text-4xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Agentic IT Operations
            </div>
          </div>
        </div>

        <div className="max-w-lg">
          <h2 className="font-display text-display-3xl text-ink-foreground">
            Observe. Understand. Decide. Act. Learn.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
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
                <dt className="type-display-metric text-ink-foreground">{v}</dt>
                <dd className="mt-1 text-2xs leading-snug text-ink-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="flex items-center gap-2 text-2xs text-ink-muted">
          <AppIcon name="compliance" size="sm" />
          Demo environment — synthetic data only. No production credentials or real incident
          records.
        </p>
      </div>

      <div className="flex items-center justify-center bg-raised px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>

          {step === "credentials" ? (
            <>
              <h1 className="type-display-page">Sign in to Digital Brain</h1>
              <p className="mt-1 text-sm text-tertiary">
                Demo access: any valid email address and password will work.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleCredentials} noValidate>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-primary">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-md border border-default bg-page px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-primary">
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
                      className="w-full rounded-md border border-default bg-page px-3 py-2 pr-9 text-sm text-primary placeholder:text-tertiary focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary"
                    >
                      {showPassword ? (
                        <AppIcon name="hide" size="md" />
                      ) : (
                        <AppIcon name="view" size="md" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-md border border-error/25 bg-error-bg px-3 py-2 text-xs text-error">
                    {error}
                  </p>
                )}

                <Btn type="submit" className="w-full py-2.5 text-sm" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Btn>
              </form>
              <p className="mt-3 text-center text-2xs text-tertiary">
                Demo environment · any syntactically valid email and non empty password
              </p>
            </>
          ) : (
            <>
              <h1 className="type-display-page">Choose your role</h1>
              <p className="mt-1 text-sm text-tertiary">
                Single sign on determines this in production. Select a role for this demo session.
              </p>

              <div className="mt-6 space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSel(r.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      sel === r.id
                        ? "border-info bg-info-bg"
                        : "border-default hover:border-info/50 hover:bg-action",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                        sel === r.id ? "border-info bg-info" : "border-default",
                      )}
                    />
                    <span>
                      <span className="block text-sm font-medium">{r.name}</span>
                      <span className="block text-2xs text-tertiary">{r.desc}</span>
                    </span>
                    <span className="ml-auto text-2xs text-tertiary">{r.who}</span>
                  </button>
                ))}
              </div>

              <Btn className="mt-6 w-full py-2.5 text-sm" onClick={handleEnter}>
                Enter Control Tower
              </Btn>
              <p className="mt-3 text-center text-2xs text-tertiary">
                Default role: IT Ops Manager · Session scoped to PepsiCo Global IT (demo tenant)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
