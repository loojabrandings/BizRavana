import type { Metadata } from "next";
import {
  LayoutDashboard,
  ReceiptText,
  FileText,
  Users,
  Package,
  Warehouse,
  Wallet,
  BarChart3,
  CreditCard,
  Truck,
  MessageCircle,
  UsersRound,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Card from "@/components/card";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Features — BizRavana",
  description:
    "Explore BizRavana's features — dashboards, orders & invoices, quotations, customers, inventory, expenses, reports, billing, courier & WhatsApp integrations and team collaboration, all in one workspace.",
};

/** The hero — the single statement this page makes. */
const HERO = {
  eyebrow: "Everything you need",
  title: "Powerful features for your business",
  desc: "From orders to inventory, expenses to deliveries — BizRavana brings everything together in one organized workspace. No more juggling between notebooks, spreadsheets and WhatsApp.",
  primary: "Start 3-Day Free Trial",
};

/** A feature group rendered as one card in a section grid. */
type FeatureGroup = {
  icon: LucideIcon;
  heading: string;
  desc: string;
  bullets: string[];
};

/** Core Business Operations — the day-to-day feature groups. */
const OPS_GROUPS: FeatureGroup[] = [
  {
    icon: LayoutDashboard,
    heading: "Dashboard",
    desc: "Get a real-time overview of your entire business. Track orders, revenue, profit, pending payments, deliveries and low stock alerts — all in one live dashboard.",
    bullets: [
      "Revenue & profit tracking",
      "Order & delivery summaries",
      "Low stock alerts",
      "Pending payment indicators",
    ],
  },
  {
    icon: ReceiptText,
    heading: "Orders & Invoices",
    desc: "Create, track and manage orders from quotation to invoice. Support for COD, credit, bank transfer and partial payments — built for Sri Lankan retail and wholesale.",
    bullets: [
      "Order creation with auto-numbering",
      "Invoice generation",
      "Multiple payment methods",
      "Order status tracking",
    ],
  },
  {
    icon: FileText,
    heading: "Quotations",
    desc: "Create professional quotations, convert them to orders instantly, and track their status from draft to accepted or converted.",
    bullets: [
      "Quotation templates",
      "One-click order conversion",
      "Status tracking",
      "Customer history linked",
    ],
  },
  {
    icon: Users,
    heading: "Customers",
    desc: "Maintain a complete customer database with order history, lifetime spend, pending balances and contact information — all in one place.",
    bullets: [
      "Customer profiles with history",
      "Lifetime spend tracking",
      "Pending balance management",
      "Contact & address management",
    ],
  },
];

/** Inventory & Products — stock levels, the product catalog and suppliers. */
const INVENTORY_GROUPS: FeatureGroup[] = [
  {
    icon: Package,
    heading: "Products",
    desc: "Manage your product catalog with categories, size variants, pricing, cost tracking and profit margin calculations.",
    bullets: [
      "Product catalog with categories",
      "Size variant support",
      "Cost & profit tracking",
      "Bulk import via XLSX & CSV",
    ],
  },
  {
    icon: Warehouse,
    heading: "Inventory",
    desc: "Track stock levels in real time, receive low-stock alerts, manage suppliers and automate stock-in/out transactions.",
    bullets: [
      "Real-time stock tracking",
      "Low stock alerts",
      "Supplier management",
      "Stock transaction history",
    ],
  },
];

/** Financial Management — expenses, reports and billing. */
const FINANCE_GROUPS: FeatureGroup[] = [
  {
    icon: Wallet,
    heading: "Expenses",
    desc: "Record and categorize business expenses, track payments and get a clear picture of your costs with automated categorization.",
    bullets: [
      "Expense recording & categorization",
      "Payment status tracking",
      "Inventory-linked expenses",
      "Expense reports",
    ],
  },
  {
    icon: BarChart3,
    heading: "Reports & Analytics",
    desc: "Generate profit & loss reports, view order analytics, expense summaries and business insights — all automatically calculated.",
    bullets: [
      "Profit & loss reports",
      "Order analytics",
      "Expense summaries",
      "Business insights dashboard",
    ],
  },
  {
    icon: CreditCard,
    heading: "Subscription & Billing",
    desc: "Manage your plan, view usage limits, upload payment proofs via bank transfer and track your billing history.",
    bullets: [
      "Plan management",
      "Usage limit tracking",
      "Payment proof upload",
      "Billing history",
    ],
  },
];

/** Integrations & Collaboration — couriers, WhatsApp, team and settings. */
const INTEGRATION_GROUPS: FeatureGroup[] = [
  {
    icon: Truck,
    heading: "Courier & Deliveries",
    desc: "Connect with Courier companies for instant waybill generation, bulk dispatch and live tracking — all from within BizRavana.",
    bullets: [
      "Royal Express & Koombiyo support",
      "Instant waybill generation",
      "Bulk dispatch",
      "Shipment tracking",
    ],
  },
  {
    icon: MessageCircle,
    heading: "WhatsApp Integration",
    desc: "Send order confirmations, quotations and invoice messages directly via WhatsApp using customizable templates.",
    bullets: [
      "WhatsApp template messaging",
      "Order & quotation notifications",
      "Customizable message templates",
    ],
  },
  {
    icon: UsersRound,
    heading: "Team Collaboration",
    desc: "Invite team members with role-based access. Assign tasks, track activity and work together seamlessly.",
    bullets: [
      "Multi-user support",
      "Role-based access (Owner, Business Manager, Member)",
      "Activity log",
      "Task assignment",
    ],
  },
  {
    icon: Settings,
    heading: "Settings & Customization",
    desc: "Customize your business profile, branding, theme preferences and configure courier accounts, WhatsApp templates and more.",
    bullets: [
      "Business profile & branding",
      "Theme customization",
      "Courier account setup",
      "WhatsApp template configuration",
    ],
  },
];

/**
 * One features section — a centered heading block over a card grid of
 * feature groups. Every section on this page shares the same rhythm:
 * eyebrow, lead, description, then the group cards.
 */
function FeatureSection({
  id,
  eyebrow,
  title,
  desc,
  groups,
  cols3 = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  groups: FeatureGroup[];
  /** Three-column grid (for a single row of three groups). */
  cols3?: boolean;
}) {
  return (
    <section className="about-section feat-ops" aria-labelledby={`${id}-heading`}>
      <div className="about-section__inner about-section__inner--center about-section__inner--wide">
        <Reveal>
          <p className="about-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="about-lead">
            {title}
          </h2>
          <p className="about-body">{desc}</p>
        </Reveal>
        <ul
          className={
            cols3 ? "feat-ops__grid feat-ops__grid--3" : "feat-ops__grid"
          }
        >
          {groups.map((group, i) => (
            <li key={group.heading}>
              <Reveal className="feat-ops__cell" delay={i * 90}>
                <Card
                  className="feat-ops__card"
                  icon={group.icon}
                  title={group.heading}
                  description={group.desc}
                >
                  <ul className="about-checks feat-ops__list">
                    {group.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Features page — one centered statement over the landing page's ambient
 * blob backdrop. Deliberately no 3D laptop: that backdrop is the interactive
 * product demo, reserved for the home route. This page keeps only the nav,
 * the hero, the feature sections and the footer, sharing the site's type,
 * token and reveal system.
 */
export default function FeaturesPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the landing page's fixed background layer,
          without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement and one CTA, over the blobs. */}
      <section className="feat-hero" aria-labelledby="feat-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="feat-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
            <div className="feat-hero__actions">
              {/* Placeholder target — swap for the signup route when it exists. */}
              <Button variant="primary">{HERO.primary}</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Core Business Operations — the day-to-day feature groups. */}
      <FeatureSection
        id="feat-ops"
        eyebrow="Features"
        title="Core Business Operations"
        desc="Everything you need to manage day-to-day operations from one place."
        groups={OPS_GROUPS}
      />

      {/* 3. Inventory & Products — catalog and stock. */}
      <FeatureSection
        id="feat-inventory"
        eyebrow="Inventory"
        title="Inventory & Products"
        desc="Keep full control over your stock and product catalog."
        groups={INVENTORY_GROUPS}
      />

      {/* 4. Financial Management — expenses, reports and billing. */}
      <FeatureSection
        id="feat-finance"
        eyebrow="Finance"
        title="Financial Management"
        desc="Track every rupee and make data-driven decisions."
        groups={FINANCE_GROUPS}
        cols3
      />

      {/* 5. Integrations & Collaboration — couriers, WhatsApp, team, settings. */}
      <FeatureSection
        id="feat-integrations"
        eyebrow="Integrations"
        title="Integrations & Collaboration"
        desc="Connect your business tools and work together as a team."
        groups={INTEGRATION_GROUPS}
      />

      <Footer />
    </main>
  );
}
