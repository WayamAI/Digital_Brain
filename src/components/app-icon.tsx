import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons, type IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Icon sizes are declared once, in styles.css, as --icon-size-*. Nothing in
 * the app should hardcode a pixel dimension for an icon — pass a size instead.
 *
 * Per context defaults, for reference when picking one:
 *   breadcrumb / status dot ... xs (12) or sm (14)
 *   table row action ......... sm (14)
 *   button ................... md (16)
 *   sidebar .................. lg (18)
 *   search / header .......... md (16) or xl (20)
 *   empty state .............. 2xl (24) or 3xl (28)
 */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type AppIconProps = {
  name: IconName;
  size?: IconSize | undefined;
  className?: string | undefined;
  spin?: boolean | undefined;
} & (
  | { "aria-label": string; "aria-hidden"?: never }
  | { "aria-label"?: undefined; "aria-hidden"?: true | undefined }
);

/**
 * The single way an icon reaches the screen. Colour comes from the caller via
 * a semantic token class (text-icon-secondary, text-warning, …) — never from
 * the icon itself.
 *
 * Icons are decorative by default and hidden from assistive tech. Pass an
 * aria-label when the icon is the only carrier of meaning.
 */
export function AppIcon({
  name,
  size = "md",
  className,
  spin,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: AppIconProps) {
  const decorative = ariaLabel === undefined;
  return (
    <FontAwesomeIcon
      icon={icons[name]}
      // Tailwind's animate-spin rather than Font Awesome's `spin` prop: the
      // prop does not emit fa-spin under react-fontawesome v3 + FA v7.
      className={cn("shrink-0", spin && "animate-spin", className)}
      style={{ width: `var(--icon-size-${size})`, height: `var(--icon-size-${size})` }}
      aria-hidden={decorative ? true : (ariaHidden ?? undefined)}
      {...(decorative ? { role: undefined } : { role: "img", "aria-label": ariaLabel })}
    />
  );
}
