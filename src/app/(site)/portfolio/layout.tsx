import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Web Design Portfolio & Client Work | BizRavana",
  description:
    "Explore our interactive showcase of high-performance websites, eCommerce platforms, and custom web applications engineered for Sri Lankan brands and modern businesses.",
  alternates: {
    canonical: `${SITE_URL}/portfolio`,
  },
  openGraph: {
    title: "Web Design Portfolio & Client Showcase | BizRavana",
    description:
      "Explore our interactive showcase of high-performance websites, eCommerce platforms, and custom web applications engineered for Sri Lankan brands.",
    type: "website",
    url: `${SITE_URL}/portfolio`,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design Portfolio & Client Showcase | BizRavana",
    description:
      "Explore our interactive showcase of high-performance websites, eCommerce platforms, and custom web applications engineered for Sri Lankan brands.",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
