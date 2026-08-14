/**
 * The public site origin — used by the sitemap, robots.txt, structured data
 * and social metadata. Override via NEXT_PUBLIC_SITE_URL for previews;
 * defaults to the production domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bizravana.com";

/**
 * Site-wide business details — the single source of truth for contact info.
 * The contact page (info column + WhatsApp form) reads from here, so the
 * number/email never drift between places.
 */
export const CONTACT = {
  /** Local display number for the "Phone" channel (also used for tel: links). */
  phone: "0750350109",
  /** Public support email (also used for mailto: links). */
  email: "loojabrandings@gmail.com",
  /** WhatsApp number in international dial format (digits only) for wa.me links. */
  whatsapp: "94750350109",
  /** WhatsApp number as shown to visitors. */
  whatsappDisplay: "+94750350109",
} as const;
