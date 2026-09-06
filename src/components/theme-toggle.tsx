import { IconButton } from "@/components/icon-button";
import { useTheme } from "@/lib/theme";

/**
 * Flips between light and dark. Before the first click the app follows the OS
 * setting; clicking stores an explicit choice that survives a reload.
 */
export function ThemeToggle({ className }: { className?: string | undefined }) {
  const { theme, resolved, toggle } = useTheme();
  const goingDark = resolved === "light";

  return (
    <IconButton
      icon="theme"
      label={goingDark ? "Switch to dark mode" : "Switch to light mode"}
      variant="subtle"
      size="md"
      onClick={toggle}
      title={
        theme === "system"
          ? `Following your system setting (${resolved}) — click for ${goingDark ? "dark" : "light"}`
          : `${resolved === "dark" ? "Dark" : "Light"} mode — click for ${goingDark ? "dark" : "light"}`
      }
      {...(className ? { className } : {})}
    />
  );
}
