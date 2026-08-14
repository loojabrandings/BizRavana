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
