import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary";

type CommonProps = {
  /** "primary" (solid, theme-inverting) is the default; "secondary" is the outlined ghost. */
  variant?: Variant;
  /** "sm" — compact pill for navbars/toolbars; default is the standard CTA size. */
  size?: "sm";
  /** Extra classes appended to `btn btn--<variant>` (e.g. layout tweaks). */
  className?: string;
  children: ReactNode;
};

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsAnchor | ButtonAsButton;

/**
 * Reusable button. Renders an `<a>` when `href` is given (for in-page
 * anchors / routes), otherwise a `<button type="button">` — override `type`
 * by passing it explicitly. Styling lives in the `.btn` / `.btn--*` classes
 * in globals.css; anything else (onClick, aria-*, etc.) forwards through.
 */
export default function Button({
  variant = "primary",
  size,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size ? `btn--${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
