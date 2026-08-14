import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional content below the header — omit for title+description-only cards. */
  children?: ReactNode;
  /** Optional lucide icon rendered in an accent badge at the top of the card. */
  icon?: LucideIcon;
  /** Optional display-face title under the icon badge. */
  title?: string;
  /** Optional secondary description under the title. */
  description?: string;
};

/**
 * Reusable glass card with an accent glow, shimmer sweep and bottom line.
 *
 * The card is the frosted glass panel; `.card__glow` washes the corner in
 * the single brand accent, `.card__shimmer` sweeps a soft band across the
 * surface on hover/focus, and `.card__line` grows a hairline accent line
 * along the bottom edge. Optional `icon` / `title` / `description` render
 * the card's header (an accent icon badge, display-face title and secondary
 * copy); anything else (children, className, id, aria-*, onClick) forwards
 * through. Styling lives in the `.card` / `.card__*` classes in globals.css.
 */
export default function Card({
  children,
  className = "",
  icon: Icon,
  title,
  description,
  ...rest
}: CardProps) {
  const classes = ["card", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      <div className="card__glow" aria-hidden="true" />
      <div className="card__shimmer" aria-hidden="true" />
      <div className="card__line" aria-hidden="true" />
      {Icon && (
        <span className="card__badge">
          <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
        </span>
      )}
      {(title || description) && (
        <div className="card__text">
          {title && <h3 className="card__title">{title}</h3>}
          {description && <p className="card__desc">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
