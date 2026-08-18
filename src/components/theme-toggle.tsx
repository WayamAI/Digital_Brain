import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Flips between light and dark. Before the first click the app follows the OS
 * setting; clicking stores an explicit choice that survives a reload.
 */
export function ThemeToggle({ className }: { className?: string | undefined }) {
  const { theme, resolved, toggle } = useTheme();
  const goingDark = resolved === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={goingDark ? "Switch to dark mode" : "Switch to light mode"}
      title={
        theme === "system"
          ? `Following your system setting (${resolved}) — click for ${goingDark ? "dark" : "light"}`
          : `${resolved === "dark" ? "Dark" : "Light"} mode — click for ${goingDark ? "dark" : "light"}`
      }
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      {goingDark ? (
        <Moon className="h-4 w-4" strokeWidth={1.9} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.9} />
      )}
    </button>
  );
}
