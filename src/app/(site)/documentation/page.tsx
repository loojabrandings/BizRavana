import type { Metadata } from "next";
import {
  Rocket,
  ReceiptText,
  Warehouse,
  BarChart3,
  Truck,
  MessageCircle,
  UsersRound,
  CreditCard,
  Wrench,
  Headset,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Card from "@/components/card";
import Reveal from "@/components/reveal";
import FaqList, { type FaqItem } from "@/components/faq-list";

export const metadata: Metadata = {
  title: "Documentation — BizRavana",
  description:
    "Learn how to use BizRavana — orders, invoices & quotations, inventory, expenses, reports, courier & WhatsApp integrations, team collaboration, billing and troubleshooting.",
};

/** Hero copy — one centered statement, matching the Features/Contact rhythm. */
const HERO = {
  eyebrow: "Documentation",
  title: "Everything you need to know",
  desc: "Short, practical answers for every part of BizRavana — organized by module so you can find what you need fast. Start with the category that matches what you're doing.",
};

/** A browse category — a card linking to its section on this page. */
type Category = {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

/** The browse grid — one card per documentation section. */
const CATEGORIES: Category[] = [
  {
    id: "docs-getting-started",
    icon: Rocket,
    title: "Getting Started",
    desc: "Account, trial, profile and setup.",
  },
  {
    id: "docs-sales",
    icon: ReceiptText,
    title: "Orders, Invoices & Quotations",
    desc: "The sales flow, from quote to payment.",
  },
  {
    id: "docs-inventory",
    icon: Warehouse,
    title: "Inventory, Products & Expenses",
    desc: "Stock, catalog, suppliers and costs.",
  },
  {
    id: "docs-reports",
    icon: BarChart3,
    title: "Reports & Analytics",
    desc: "Dashboard, P&L, sales and expenses.",
  },
  {
    id: "docs-courier",
    icon: Truck,
    title: "Courier & Deliveries",
    desc: "Waybills, bulk dispatch and tracking.",
  },
  {
    id: "docs-whatsapp",
    icon: MessageCircle,
    title: "WhatsApp Integration",
    desc: "Templates and customer messaging.",
  },
  {
    id: "docs-team",
    icon: UsersRound,
    title: "Team & Settings",
    desc: "Roles, activity, tasks and preferences.",
  },
  {
    id: "docs-billing",
    icon: CreditCard,
    title: "Billing & Subscription",
    desc: "Plans, payments and usage limits.",
  },
  {
    id: "docs-troubleshooting",
    icon: Wrench,
    title: "Troubleshooting",
    desc: "Quick fixes for common issues.",
  },
];

/** One documentation section — a heading block over an accordion of entries. */
type DocsSection = {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  entries: FaqItem[];
};

const SECTIONS: DocsSection[] = [
  {
    id: "docs-getting-started",
    eyebrow: "Getting Started",
    title: "Start here",
    desc: "From your free trial to your first order — the basics in a few minutes.",
    entries: [
      {
        question: "How do I start my free trial?",
        answer:
          "Sign up with your email and you'll get a 3-day free trial with full access — no credit card required. When you choose a plan, your data carries over automatically.",
      },
      {
        question: "How do I set up my business profile?",
        answer:
          "Go to Settings → Business Profile to add your business name and logo, currency (LKR), date format and theme. Your logo appears on every invoice and quotation you send.",
      },
      {
        question: "How do I add my products?",
        answer:
          "Create products one by one, or import your catalog in bulk from an XLSX or CSV file. Set categories, size variants, selling price and cost so profit margins are tracked automatically.",
      },
      {
        question: "How do order numbers work?",
        answer:
          "Orders, quotations and invoices use automatic numbering. You can customize the prefixes and starting numbers in Settings.",
      },
    ],
  },
  {
    id: "docs-sales",
    eyebrow: "Orders, Invoices & Quotations",
    title: "Run your sales flow",
    desc: "From the first quotation to the final payment — everything connected.",
    entries: [
      {
        question: "How do I create an order?",
        answer:
          "Go to Orders → New Order, add your customer and items, choose the payment method (COD, credit or bank transfer) and save. The order gets a number automatically.",
      },
      {
        question: "How do I create a quotation?",
        answer:
          "Create a quotation from a ready-to-use template, add the items and send it to the customer. Track its status from draft to accepted or converted.",
      },
      {
        question: "How do I convert a quotation to an order?",
        answer:
          "Open the quotation and choose \"Convert to order\" — the customer and items carry over, so the order starts with everything already filled in.",
      },
      {
        question: "How do I generate an invoice?",
        answer:
          "Open the order and generate its invoice with one click. You can send it to the customer on WhatsApp or print it for a paper copy.",
      },
      {
        question: "How do I record a payment?",
        answer:
          "Open the order and record the payment. BizRavana supports full and partial payments, and unpaid balances stay visible until they're cleared.",
      },
    ],
  },
  {
    id: "docs-inventory",
    eyebrow: "Inventory, Products & Expenses",
    title: "Know what you have, and what it costs",
    desc: "Stock moves with your orders, and costs stay connected to your reports.",
    entries: [
      {
        question: "How do I track stock levels?",
        answer:
          "Every order that includes a product reduces its stock automatically, and stock-ins increase it. Low-stock alerts on the dashboard warn you when levels get low.",
      },
      {
        question: "How do I record a stock adjustment?",
        answer:
          "Use a stock-in or stock-out transaction to correct levels — for example stock takes, breakage or returns. Every movement is kept in the product's history.",
      },
      {
        question: "How do I manage suppliers?",
        answer:
          "Add suppliers in Inventory and link purchases to them, so you can see what you buy, from whom and when.",
      },
      {
        question: "How do I record an expense?",
        answer:
          "Add the expense with a category and payment status. Expenses can be linked to inventory purchases so your costs stay connected.",
      },
      {
        question: "How do I import products from Excel?",
        answer:
          "Use the bulk import on the Products page with an XLSX or CSV file. Map your columns to product fields and review everything before importing.",
      },
    ],
  },
  {
    id: "docs-reports",
    eyebrow: "Reports & Analytics",
    title: "See how your business is doing",
    desc: "Clear, automatic reports — no spreadsheets required.",
    entries: [
      {
        question: "What does the dashboard show?",
        answer:
          "The dashboard gives a real-time view of your business — orders, revenue, profit, pending payments, deliveries and low-stock alerts at a glance.",
      },
      {
        question: "How do I see my profit and loss?",
        answer:
          "Open Reports → Profit & Loss for a summary of revenue, costs and expenses. It's calculated automatically from your orders and expenses.",
      },
      {
        question: "How do I view order analytics?",
        answer:
          "Reports → Orders shows sales performance, order counts and trends, so you can see what's selling and when.",
      },
      {
        question: "How do I read expense reports?",
        answer:
          "Expense reports summarize your spending by category and payment status, helping you see exactly where your money is going.",
      },
    ],
  },
  {
    id: "docs-courier",
    eyebrow: "Courier & Deliveries",
    title: "Ship without switching platforms",
    desc: "Waybills, bulk dispatch and tracking — from inside BizRavana.",
    entries: [
      {
        question: "How do I connect a courier service?",
        answer:
          "Go to Settings → Courier and connect your Royal Express or Koombiyo account. Once connected, your service appears in dispatch.",
      },
      {
        question: "How do I generate a waybill?",
        answer:
          "Select an order for delivery and generate its waybill — the details are pulled from the order automatically.",
      },
      {
        question: "How do I dispatch orders in bulk?",
        answer:
          "Select multiple ready orders and dispatch them together. BizRavana generates the waybills and hands them to the courier in one step.",
      },
      {
        question: "How do I track a shipment?",
        answer:
          "Orders carry delivery status updates from the courier, so you and your customer can see where a shipment is.",
      },
    ],
  },
  {
    id: "docs-whatsapp",
    eyebrow: "WhatsApp Integration",
    title: "Meet customers where they already are",
    desc: "Order confirmations, quotations and invoices — sent straight to WhatsApp.",
    entries: [
      {
        question: "How do WhatsApp messages work?",
        answer:
          "BizRavana sends order confirmations, quotations and invoices using customizable message templates — so your customers get the details on WhatsApp, the way they expect.",
      },
      {
        question: "How do I customize templates?",
        answer:
          "Open Settings → WhatsApp Templates to edit the messages for orders, quotations and invoices, including placeholders for the customer, items and totals.",
      },
      {
        question: "Can I control when messages are sent?",
        answer:
          "Yes — choose whether notifications go out automatically on each event, like an order confirmation, or when you trigger them yourself.",
      },
    ],
  },
  {
    id: "docs-team",
    eyebrow: "Team & Settings",
    title: "Work together, with control",
    desc: "Roles, activity and the preferences that make BizRavana yours.",
    entries: [
      {
        question: "How do I invite team members?",
        answer:
          "Go to Settings → Team and invite by email. Choose a role — Owner, Business Manager or Member — and your teammate gets access right away.",
      },
      {
        question: "What can each role do?",
        answer:
          "Owners manage billing and everything else; Business Managers run day-to-day operations; Members get access to the areas you assign to them.",
      },
      {
        question: "Where can I see what my team did?",
        answer:
          "The activity log records actions across the workspace, so you always know who did what.",
      },
      {
        question: "How do I back up my data?",
        answer:
          "Settings → Backup lets you export your business data as a JSON file, and restore from a previous backup if you ever need to.",
      },
    ],
  },
  {
    id: "docs-billing",
    eyebrow: "Billing & Subscription",
    title: "Plans, payments and limits",
    desc: "Pick a plan, pay your way, and keep track of your billing history.",
    entries: [
      {
        question: "Which plan should I choose?",
        answer:
          "All plans include the core BizRavana workspace. Compare limits and features on the Pricing page and pick what fits — you can upgrade at any time.",
      },
      {
        question: "How do I pay?",
        answer:
          "Pay by bank transfer and upload your payment proof from the subscription page. Your payment is applied to your account once it's confirmed.",
      },
      {
        question: "How do I see my billing history?",
        answer:
          "The subscription page keeps your billing history — invoices and payment records — in one place.",
      },
      {
        question: "How do I cancel or change my plan?",
        answer:
          "Change or cancel your plan from the subscription page. Your subscription stays active until the end of the current period, and you can always restart.",
      },
    ],
  },
  {
    id: "docs-troubleshooting",
    eyebrow: "Troubleshooting",
    title: "Quick fixes for common issues",
    desc: "The most common problems, and how to solve them in a minute.",
    entries: [
      {
        question: "I can't log in",
        answer:
          "Use the \"Forgot password\" link to reset your password, and make sure you've verified your email address after signing up.",
      },
      {
        question: "My quotation or invoice looks wrong",
        answer:
          "Check your business profile (name, logo, address) and the numbering settings — everything that prints on a document is controlled there.",
      },
      {
        question: "My courier connection failed",
        answer:
          "Re-check your courier account credentials in Settings → Courier, and make sure your account is active with the courier service.",
      },
      {
        question: "A page isn't loading or looks broken",
        answer:
          "Refresh the page and try again. If it keeps happening, send us a bug report from the Contact page with details of what you were doing.",
      },
      {
        question: "I need more help",
        answer:
          "Message us on WhatsApp or email from the Contact page — we typically respond within a few hours during business hours.",
      },
    ],
  },
];

/**
 * Documentation page — a centered statement over the ambient blob backdrop,
 * a browse grid of category cards, then one accordion section per category.
 * Shares the editorial structure of Features (hero + sections), the FAQ
 * accordion from the landing page and the shared Card/Reveal/Button system.
 */
export default function DocumentationPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          other editorial pages, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="docs-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="docs-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
            <div className="feat-hero__actions">
              <Button href="#docs-getting-started" variant="secondary">
                Jump to a topic ↓
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Browse by category — cards linking to the sections below. */}
      <section className="about-section docs-cats" aria-label="Browse documentation">
        <div className="about-section__inner about-section__inner--wide">
          <ul className="docs-cats__grid">
            {CATEGORIES.map(({ id, icon, title, desc }, i) => (
              <li key={id}>
                <Reveal className="docs-cats__cell" delay={(i % 3) * 90}>
                  <a className="docs-cats__link" href={`#${id}`}>
                    <Card
                      className="docs-cats__card"
                      icon={icon}
                      title={title}
                      description={desc}
                    />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. One section per category — heading over an accordion of entries. */}
      {SECTIONS.map((section, si) => (
        <section
          key={section.id}
          id={section.id}
          className="about-section docs-section"
          aria-labelledby={`${section.id}-heading`}
        >
          <div className="about-section__inner about-section__inner--center">
            <Reveal>
              <p className="about-eyebrow">{section.eyebrow}</p>
              <h2 id={`${section.id}-heading`} className="about-lead">
                {section.title}
              </h2>
              <p className="about-body">{section.desc}</p>
            </Reveal>
            <Reveal delay={120}>
              <FaqList
                items={section.entries}
                idPrefix={`docs-${si}`}
                className="docs-faq"
              />
            </Reveal>
          </div>
        </section>
      ))}

      {/* 4. Help band — one message away if the docs aren't enough. */}
      <section className="about-section docs-help" aria-labelledby="docs-help-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <Card
              icon={Headset}
              title="Still need help?"
              description="The documentation covers the day-to-day, but every business is different. Message the team and we'll help you figure it out."
              className="docs-help__card"
            >
              <div className="docs-help__actions">
                <Button href="/contact" variant="primary">
                  Contact Support
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
