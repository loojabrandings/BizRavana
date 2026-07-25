import Link from "next/link";
import { SparklesIcon } from "lucide-react";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <img
                src="/darkmode-logo.png"
                alt="BizRavana"
                className="h-7 w-auto object-contain"
              />
              BizRavana
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Run your entire business from one smart platform. Manage orders,
              customers, inventory, expenses, deliveries and reports — all in one place.
            </p>
          </div>

          {/* Nav groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold">{group.title}</h4>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground md:flex-row">
          <p className="text-center">
            &copy; {new Date().getFullYear()} BizRavana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
