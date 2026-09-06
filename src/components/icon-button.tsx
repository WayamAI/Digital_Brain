import type { ButtonHTMLAttributes } from "react";
import { AppIcon, type IconSize } from "@/components/app-icon";
import type { IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * ghost   — no plate until hover. Toolbars, table row actions, close buttons.
 * subtle  — resting plate on surface.action, lifts to surface.raised on hover.
 * inverse — the light plate from action-surface.primary. Selected nav, the one
 *           primary action on a screen. Never more than one in view.
 */
export type IconButtonVariant = "ghost" | "subtle" | "inverse";
export type IconButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<IconButtonVariant, string> = {
  ghost:
    "bg-action-tertiary text-action-tertiary-content hover:bg-action-tertiary-hover hover:text-icon-primary",
  subtle: "bg-action text-icon-tertiary hover:bg-raised hover:text-icon-secondary",
  inverse:
    "bg-action-primary text-action-primary-content hover:bg-action-primary-hover hover:text-action-primary-content",
};

const BOX: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const GLYPH: Record<IconButtonSize, IconSize> = { sm: "sm", md: "md", lg: "lg" };

type IconButtonProps = {
  icon: IconName;
  /** Required: an icon-only control has no other accessible name. */
  label: string;
  variant?: IconButtonVariant | undefined;
  size?: IconButtonSize | undefined;
  active?: boolean | undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children">;

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  active,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "transition-ui inline-flex items-center justify-center rounded-lg outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45",
        BOX[size],
        active ? VARIANT.inverse : VARIANT[variant],
        className,
      )}
      {...props}
    >
      <AppIcon name={icon} size={GLYPH[size]} aria-hidden />
    </button>
  );
}
