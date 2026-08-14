import type { PostMeta } from "../types";

export const meta: PostMeta = {
  slug: "pricing-for-profit",
  title: "How to price your products for profit",
  date: "2026-08-05",
  category: "Business Tips",
  excerpt:
    "Most small businesses underprice without realising it. Here's a simple three-step method to price for profit — and how to keep it honest in BizRavana.",
  minutes: 5,
};

export default function PricingForProfit() {
  return (
    <>
      <p>
        Here&rsquo;s a quiet problem most small businesses have: they know
        their prices, but they don&rsquo;t know their costs. A shirt sells for
        Rs 2,500 — but after the supplier, transport and the courier fee, is
        that a profit or a favour to a customer?
      </p>
      <p>
        Pricing for profit doesn&rsquo;t mean charging more than your market
        will bear. It means knowing exactly what a product costs you, so every
        price you set starts from a number you can defend.
      </p>

      <h2>Step 1 — Know your true cost</h2>
      <p>
        Your cost isn&rsquo;t just what you paid the supplier. Add in the
        things that quietly eat your margin:
      </p>
      <ul>
        <li>Transport and delivery to your shop</li>
        <li>Packaging</li>
        <li>Payment gateway or bank fees</li>
        <li>A share of rent, salaries and utilities</li>
      </ul>
      <p>
        In BizRavana, every product stores its cost price alongside the selling
        price — so the margin is calculated for you, and your{" "}
        <a href="/documentation#docs-reports">profit &amp; loss report</a>{" "}
        reflects the real numbers, not rough guesses.
      </p>

      <h2>Step 2 — Pick a margin, not a guess</h2>
      <p>
        A common starting point for retail is a 40–60% gross margin — the
        exact figure depends on your category. The habit that matters is
        deciding on a target margin and applying it consistently, then
        reviewing it every few months as costs change.
      </p>
      <p>
        When a supplier raises prices, the products affected show up in your
        reports. Update their costs in BizRavana and you&rsquo;ll see exactly
        how much margin each one now earns — before the next season, not after
        it.
      </p>

      <h2>Step 3 — Watch it weekly, not yearly</h2>
      <p>
        The businesses that stay profitable check their numbers often. Your
        dashboard shows total orders, revenue, profit and pending payments on
        one screen, so the weekly check takes a minute instead of an
        afternoon with a calculator.
      </p>
      <blockquote>
        Price is a decision. Cost is a fact. Decide with the facts.
      </blockquote>
      <p>
        Want to put this into practice? Add your product costs once and let
        BizRavana do the math —{" "}
        <a href="/getting-started">set up in minutes</a>.
      </p>
    </>
  );
}
