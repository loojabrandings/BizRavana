import type { PostMeta } from "../types";

export const meta: PostMeta = {
  slug: "hello-bizravana",
  title: "Welcome to BizRavana",
  date: "2026-08-12",
  category: "Updates",
  excerpt:
    "BizRavana is here — one connected workspace for orders, customers, inventory, expenses, deliveries and reports. Here's what we're building and why.",
  minutes: 3,
};

export default function HelloBizravana() {
  return (
    <>
      <p>
        If you run a growing business in Sri Lanka, you already know the
        feeling: orders coming in on WhatsApp, stock tracked in a notebook,
        waybills handwritten at midnight, and profit that only makes sense at
        the end of the month — if then.
      </p>
      <p>
        That&rsquo;s the mess BizRavana is built to clear away. We&rsquo;re
        building one workspace that brings the day-to-day of your business
        together — orders, quotations, invoices, customers, inventory,
        expenses, deliveries and reports — so everything stays connected
        automatically.
      </p>

      <h2>What you can do today</h2>
      <p>
        The core workspace is live, and it covers the flow every order travels:
      </p>
      <ul>
        <li>
          <strong>Orders, quotations &amp; invoices</strong> with automatic
          numbering, professional templates and one-click quotation-to-order
          conversion
        </li>
        <li>
          <strong>Customers</strong> with order history, lifetime spend and
          pending balances
        </li>
        <li>
          <strong>Products, inventory &amp; suppliers</strong>, including bulk
          import from XLSX and CSV
        </li>
        <li>
          <strong>Expenses</strong> that link back to inventory purchases and
          feed your reports
        </li>
        <li>
          <strong>Courier dispatch</strong> for Royal Express and Koombiyo,
          with waybills and bulk dispatch
        </li>
        <li>
          <strong>WhatsApp messaging</strong> for order confirmations,
          quotations and invoices
        </li>
      </ul>

      <h2>What&rsquo;s next</h2>
      <p>
        We&rsquo;re working toward a smarter platform — automation, better
        insights and AI that help you spend less time managing operations and
        more time making decisions. This blog will track our progress and,
        more importantly, share practical advice for running a business
        better.
      </p>
      <blockquote>
        Every business deserves the same clarity big companies have — without
        the enterprise software headache.
      </blockquote>
      <p>
        New here? Start with the{" "}
        <a href="/getting-started">5-step setup</a> — most businesses are
        fully set up in an afternoon. Questions?{" "}
        <a href="/help-center">We&rsquo;re one message away</a>.
      </p>
    </>
  );
}
