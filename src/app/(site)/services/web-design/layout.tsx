import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import "./web-design.css";

export const metadata: Metadata = {
  title: "Web Design & Development Services | BizRavana",
  description:
    "Custom, sub-second web platforms, landing pages, and web apps engineered for Sri Lankan business leaders and global brands. Zero generic templates, 100% conversion-obsessed Next.js architecture.",
  alternates: {
    canonical: `${SITE_URL}/services/web-design`,
  },
  openGraph: {
    title: "Web Design & Development Services | BizRavana",
    description:
      "Custom, sub-second web platforms, landing pages, and web apps engineered for Sri Lankan business leaders and global brands.",
    type: "website",
    url: `${SITE_URL}/services/web-design`,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design & Development Services | BizRavana",
    description:
      "Custom, sub-second web platforms, landing pages, and web apps engineered for Sri Lankan business leaders and global brands.",
  },
};

export default function WebDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="wd-standalone-root">{children}</div>;
}
