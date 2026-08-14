import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Changelog — BizRavana",
  description:
    "What's new in BizRavana — every release in plain words, grouped by new features, improvements and fixes.",
};

/** Hero copy — one centered statement, matching the other editorial pages. */
const HERO = {
  eyebrow: "Changelog",
  title: "What's new in BizRavana",
  desc: "Every release, in plain words — new features, improvements and fixes. No jargon, no filler.",
};

/** One change line — optionally linking into the docs for the detail. */
type Change = {
  text: string;
  /** Route to the relevant guide (docs section, page) when there's one. */
  href?: string;
};

/** A change group — the standard Added / Improved / Fixed buckets. */
type ChangeGroup = {
  type: "Added" | "Improved" | "Fixed";
  items: Change[];
};

/** One release — newest first. */
type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  groups: ChangeGroup[];
};

const RELEASES: Release[] = [
  {
    version: "v0.4.0",
    date: "August 2026",
    title: "A new website and a faster start",
    summary:
      "The landing site was rebuilt from the ground up, and every new visitor now has a clear path from signup to their first order.",
    groups: [
      {
        type: "Added",
        items: [
          {
            text: "Landing site redesign with an interactive 3D laptop scene",
          },
          {
            text: "New pages: Features, Pricing, About, Contact, Documentation, Help Center, Getting Started and this Changelog",
            href: "/getting-started",
          },
          { text: "Site-wide navbar and footer", href: "/features" },
        ],
      },
      {
        type: "Improved",
        items: [
          {
            text: "All \u201cfeatures\u201d buttons now lead to the dedicated Features page",
            href: "/features",
          },
          {
            text: "Refreshed login flow so new sessions start cleanly",
            href: "/login",
          },
        ],
      },
      {
        type: "Fixed",
        items: [
          {
            text: "Fixed the login error caused by an empty redirect after sign-in",
          },
        ],
      },
    ],
  },
  {
    version: "v0.3.0",
    date: "July 2026",
    title: "Security, team access and a more consistent app",
    summary:
      "A security-focused release that adds team collaboration with safe boundaries, protects the API against abuse, and tightens up the UI across the app.",
    groups: [
      {
        type: "Added",
        items: [
          {
            text: "Team collaboration with role-based access — Owner, Business Manager and Member",
            href: "/documentation#docs-team",
          },
          { text: "Rate limiting on sensitive API routes" },
          {
            text: "Secure file uploads with strict type and size boundaries",
          },
        ],
      },
      {
        type: "Improved",
        items: [
          {
            text: "UI/UX consistency pass across buttons, cards and tables",
          },
          {
            text: "Tighter login, registration and password reset experience",
            href: "/login",
          },
        ],
      },
      {
        type: "Fixed",
        items: [
          { text: "Various login and session edge cases" },
        ],
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "June 2026",
    title: "Couriers you can rely on",
    summary:
      "A release focused on delivery: a calmer, clearer dispatch experience and live courier data right in the dashboard.",
    groups: [
      {
        type: "Added",
        items: [
          {
            text: "Courier dashboard with live data from your courier service",
            href: "/documentation#docs-courier",
          },
          {
            text: "Progress feedback while courier data loads, so you always know what's happening",
          },
        ],
      },
      {
        type: "Improved",
        items: [
          {
            text: "Unified WhatsApp order templates — one message flow for orders and previews",
            href: "/documentation#docs-whatsapp",
          },
          {
            text: "Courier provider reliability and error handling",
          },
        ],
      },
      {
        type: "Fixed",
        items: [
          { text: "Fixed an animation issue in the courier dashboard" },
        ],
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "May 2026",
    title: "The first release",
    summary:
      "BizRavana launched with the core workspace: everything a growing Sri Lankan business needs to run sales, stock and money in one place.",
    groups: [
      {
        type: "Added",
        items: [
          { text: "Orders, quotations and invoices with automatic numbering" },
          { text: "Customers with order history and balances" },
          { text: "Products, inventory and supplier tracking" },
          { text: "Expenses, categories and cost tracking" },
          { text: "Business dashboard with real-time metrics" },
          { text: "Reports — profit & loss, sales and expense summaries" },
          { text: "WhatsApp integration for order and quotation messages" },
          { text: "3-day free trial with no credit card required" },
        ],
      },
    ],
  },
];

/** The type badge — Added (accent), Improved (neutral), Fixed (alert). */
const TYPE_CLASS: Record<ChangeGroup["type"], string> = {
  Added: "chg-type--added",
  Improved: "chg-type--improved",
  Fixed: "chg-type--fixed",
};

/**
 * Changelog page — a centered statement over the ambient blob backdrop, then
 * one hairline-divided entry per release, newest first. Each release lists
 * its changes under the standard Added / Improved / Fixed buckets, with
 * links into the Documentation and Getting Started pages where a guide
 * exists. Same editorial structure as the other site pages.
 */
export default function ChangelogPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          other editorial pages, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="chg-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="chg-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Releases — newest first, each grouped by change type. */}
      <section className="about-section chg-section" aria-label="Release history">
        <div className="about-section__inner about-section__inner--center">
          <ol className="chg-list">
            {RELEASES.map((release, ri) => (
              <li key={release.version}>
                <Reveal delay={ri * 60}>
                  <article className="chg-release">
                    <header className="chg-release__head">
                      {ri === 0 ? (
                        <span className="chg-latest">Latest</span>
                      ) : null}
                      <h2 className="chg-release__version">{release.version}</h2>
                      <span className="chg-release__date">{release.date}</span>
                    </header>
                    <h3 className="chg-release__title">{release.title}</h3>
                    <p className="chg-release__summary">{release.summary}</p>
                    {release.groups.map((group) => (
                      <div key={group.type} className="chg-group">
                        <p className={`chg-type ${TYPE_CLASS[group.type]}`}>
                          {group.type}
                        </p>
                        <ul className="chg-group__items">
                          {group.items.map(({ text, href }) => (
                            <li key={text} className="chg-item">
                              {href ? (
                                <a className="chg-item__link" href={href}>
                                  {text}
                                </a>
                              ) : (
                                text
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={120}>
            <p className="chg-note">
              Questions about a release, or something not working as
              expected?{" "}
              <a className="chg-note__link" href="/contact">
                Let us know
              </a>{" "}
              — and watch this page for what&rsquo;s next.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
