"use client";

import { useMemo, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";

/** One searchable help article. */
type HelpArticle = {
  title: string;
  category: string;
  snippet: string;
  /** Real route (page or docs anchor) the result opens. */
  href: string;
};

/** The searchable index — curated pointers into the docs and contact routes. */
const ARTICLES: HelpArticle[] = [
  {
    title: "Start your free trial",
    category: "Getting Started",
    snippet: "Sign up with your email for a 3-day free trial — no credit card required.",
    href: "/getting-started",
  },
  {
    title: "Set up your business profile",
    category: "Getting Started",
    snippet: "Add your business name, logo, currency (LKR) and theme in Settings.",
    href: "/getting-started",
  },
  {
    title: "Add products to your catalog",
    category: "Getting Started",
    snippet: "Create products one by one, or import your catalog from XLSX or CSV.",
    href: "/getting-started",
  },
  {
    title: "Create an order",
    category: "Sales",
    snippet: "Add your customer and items, choose a payment method, and save.",
    href: "/documentation#docs-sales",
  },
  {
    title: "Create a quotation",
    category: "Sales",
    snippet: "Build a quotation from a template and track it from draft to accepted.",
    href: "/documentation#docs-sales",
  },
  {
    title: "Convert a quotation to an order",
    category: "Sales",
    snippet: "One click carries the customer and items into a new order.",
    href: "/documentation#docs-sales",
  },
  {
    title: "Generate and send invoices",
    category: "Sales",
    snippet: "Create an invoice from an order and send it on WhatsApp or print it.",
    href: "/documentation#docs-sales",
  },
  {
    title: "Record payments",
    category: "Sales",
    snippet: "COD, credit or bank transfer — with full and partial payments.",
    href: "/documentation#docs-sales",
  },
  {
    title: "Track stock levels",
    category: "Inventory",
    snippet: "Stock moves with your orders automatically, with low-stock alerts.",
    href: "/documentation#docs-inventory",
  },
  {
    title: "Record an expense",
    category: "Inventory",
    snippet: "Add a categorized expense and link inventory purchases to costs.",
    href: "/documentation#docs-inventory",
  },
  {
    title: "Import products from Excel",
    category: "Inventory",
    snippet: "Bulk import from an XLSX or CSV file, mapping your columns to fields.",
    href: "/documentation#docs-inventory",
  },
  {
    title: "Manage suppliers",
    category: "Inventory",
    snippet: "Keep track of who you buy from, and what you buy from them.",
    href: "/documentation#docs-inventory",
  },
  {
    title: "Read your profit & loss report",
    category: "Reports",
    snippet: "Revenue, costs and expenses — calculated automatically.",
    href: "/documentation#docs-reports",
  },
  {
    title: "Understand your dashboard metrics",
    category: "Reports",
    snippet: "Orders, revenue, profit, pending payments and low stock at a glance.",
    href: "/documentation#docs-reports",
  },
  {
    title: "Connect Royal Express or Koombiyo",
    category: "Courier",
    snippet: "Link your courier account in Settings to start dispatching.",
    href: "/documentation#docs-courier",
  },
  {
    title: "Generate a waybill",
    category: "Courier",
    snippet: "Create a waybill from an order with the details already filled in.",
    href: "/documentation#docs-courier",
  },
  {
    title: "Dispatch orders in bulk",
    category: "Courier",
    snippet: "Select ready orders and send them to the courier together.",
    href: "/documentation#docs-courier",
  },
  {
    title: "Track a shipment",
    category: "Courier",
    snippet: "Follow delivery status updates from the courier, on the order.",
    href: "/documentation#docs-courier",
  },
  {
    title: "Customize WhatsApp templates",
    category: "WhatsApp",
    snippet: "Edit the messages for orders, quotations and invoices.",
    href: "/documentation#docs-whatsapp",
  },
  {
    title: "Control when WhatsApp messages are sent",
    category: "WhatsApp",
    snippet: "Choose automatic or manual notifications for each event.",
    href: "/documentation#docs-whatsapp",
  },
  {
    title: "Invite team members",
    category: "Team",
    snippet: "Invite by email and assign Owner, Business Manager or Member.",
    href: "/documentation#docs-team",
  },
  {
    title: "What can each team role do?",
    category: "Team",
    snippet: "Owners manage billing; managers run operations; members get assigned access.",
    href: "/documentation#docs-team",
  },
  {
    title: "Export or restore a backup",
    category: "Team",
    snippet: "Export your business data as JSON, and restore from a backup.",
    href: "/documentation#docs-team",
  },
  {
    title: "Choose or change your plan",
    category: "Billing",
    snippet: "Compare plans on the Pricing page and upgrade anytime.",
    href: "/pricing",
  },
  {
    title: "Pay by bank transfer",
    category: "Billing",
    snippet: "Upload your payment proof from the subscription page.",
    href: "/documentation#docs-billing",
  },
  {
    title: "See your billing history",
    category: "Billing",
    snippet: "Invoices and payment records, kept in one place.",
    href: "/documentation#docs-billing",
  },
  {
    title: "Reset your password",
    category: "Account",
    snippet: "Use \"Forgot password\" on the login page to get a reset link.",
    href: "/login",
  },
  {
    title: "Report a bug",
    category: "Troubleshooting",
    snippet: "Tell us what went wrong and we'll take a look.",
    href: "/contact",
  },
  {
    title: "Contact support",
    category: "Troubleshooting",
    snippet: "Message us on WhatsApp or email — we respond within a few hours.",
    href: "/contact",
  },
];

/** Chips shown before the visitor types — one tap starts a search. */
const POPULAR = [
  "waybill",
  "quotation",
  "whatsapp",
  "backup",
  "plan",
  "invoice",
];

/**
 * Help search — a client-side index over the help articles. Typing filters
 * the list live (title, category and snippet), with a one-tap popular-search
 * chip row before any input. Results are real links into the docs and
 * contact routes, so every hit goes somewhere useful.
 */
export default function HelpSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ARTICLES.filter((a) =>
      [a.title, a.category, a.snippet].some((field) =>
        field.toLowerCase().includes(q)
      )
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="help-search">
      <div className="help-search__box">
        <Search
          className="help-search__icon"
          size={18}
          strokeWidth={2}
          aria-hidden="true"
        />
        <label htmlFor="help-search-input" className="help-search__label">
          Search for help
        </label>
        <input
          id="help-search-input"
          type="search"
          className="help-search__input"
          placeholder="Try “waybill”, “quotation” or “plan”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            type="button"
            className="help-search__clear"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            ×
          </button>
        ) : null}
      </div>

      {!query ? (
        <div className="help-search__popular">
          <span className="help-search__popular-label">Popular:</span>
          <ul className="help-search__chips">
            {POPULAR.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  className="help-search__chip"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length > 0 ? (
        <ul className="help-search__results" aria-label="Search results">
          {results.map(({ title, category, snippet, href }) => (
            <li key={`${category}-${title}`}>
              <a className="help-search__result" href={href}>
                <span className="help-search__result-main">
                  <span className="help-search__result-title">{title}</span>
                  <span className="help-search__result-snippet">{snippet}</span>
                </span>
                <span className="help-search__result-meta">
                  <span className="help-search__result-category">{category}</span>
                  <CornerDownLeft
                    className="help-search__result-open"
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="help-search__empty">
          No results for “{query.trim()}”. Try a different word, or{" "}
          <a href="/contact">contact us</a> and we&rsquo;ll point you the right
          way.
        </p>
      )}
    </div>
  );
}
