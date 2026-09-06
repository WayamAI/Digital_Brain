import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "../components/ui/sonner";
import { THEME_INIT_SCRIPT } from "../lib/theme";
import { useAuth } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-display-4xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-primary">Page not found</h2>
        <p className="mt-2 text-sm text-tertiary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-primary">This page didn't load</h1>
        <p className="mt-2 text-sm text-tertiary">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-default bg-page px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Digital Brain — Agentic IT Operations" },
      {
        name: "description",
        content:
          "Digital Brain is an agentic IT operations console — a demo of AI agents that watch a company's IT systems, catch problems, figure out what's wrong, and fix them automatically where safe, asking a human to approve anything risky. It covers the whole workflow: cutting noisy alerts down to real incidents, diagnosing root causes, weighing risk before acting, executing or proposing fixes, and reporting results to leadership. Built as a realistic demo with synthetic data across twenty five screens, branded for Wayam AI with a simple email and password demo login.",
      },
      { name: "author", content: "Wayam AI" },
      { property: "og:title", content: "Digital Brain — Agentic IT Operations" },
      {
        property: "og:description",
        content:
          "Digital Brain is an agentic IT operations console — a demo of AI agents that watch a company's IT systems, catch problems, figure out what's wrong, and fix them automatically where safe, asking a human to approve anything risky. It covers the whole workflow: cutting noisy alerts down to real incidents, diagnosing root causes, weighing risk before acting, executing or proposing fixes, and reporting results to leadership. Built as a realistic demo with synthetic data across twenty five screens, branded for Wayam AI with a simple email and password demo login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Michroma&family=Geist:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below sets the `dark` class
    // on <html> before React hydrates, so server and client markup differ here
    // by design.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Resolve the theme before first paint — no flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AuthGate>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}

/**
 * Demo route guard. Every route except /login requires a demo session
 * (see ../lib/auth). Runs on every route change, not just on first load, so
 * navigating back into the app after logout — including via the browser
 * back button — re checks auth and bounces to /login instead of restoring
 * the protected page.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isAuthenticated, ready } = useAuth();
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (ready && !isLoginRoute && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [ready, isLoginRoute, isAuthenticated, navigate]);

  if (isLoginRoute) return <>{children}</>;
  // Not ready yet (session not read from localStorage) or known unauthenticated:
  // render nothing rather than flash protected content before the redirect fires.
  if (!ready || !isAuthenticated) return null;
  return <>{children}</>;
}
