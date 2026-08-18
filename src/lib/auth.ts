import { useEffect, useState } from "react";

/**
 * Demo authentication layer.
 *
 * This app has no real backend, so "signing in" accepts any syntactically
 * valid email address paired with any non-empty password — the point is to
 * demonstrate a real login → protected app → logout flow, not to gate
 * access with real credentials. Session state is a plain localStorage
 * record; swapping this module for a real auth provider later means
 * changing `login`/`logout`/`getSession` here without touching any route.
 */

const KEY = "db.auth";

export interface DemoSession {
  email: string;
  loginAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoSession;
    return parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/** Returns an error message on failure, or null on success. */
export function login(email: string, password: string): string | null {
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (password.trim().length === 0) return "Password can't be empty.";
  const session: DemoSession = { email: email.trim(), loginAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("db-auth-change"));
  return null;
}

export function logout() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("db-auth-change"));
}

export function useAuth() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    const onChange = () => setSession(getSession());
    window.addEventListener("db-auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("db-auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { session, ready, isAuthenticated: session !== null };
}
