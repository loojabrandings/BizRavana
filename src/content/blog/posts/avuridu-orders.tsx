import type { PostMeta } from "../types";

export const meta: PostMeta = {
  slug: "avuridu-orders",
  title: "Get your orders ready for the Avurudu rush",
  date: "2026-04-03",
  category: "Business Tips",
  excerpt:
    "The weeks before Avurudu are the busiest of the year. A short pre-season checklist — stock, couriers and dispatch — keeps the rush from turning into chaos.",
  minutes: 4,
};

export default function AvuriduOrders() {
  return (
    <>
      <p>
        For most retailers, the Avurudu season means double the orders in
        half the time — and it&rsquo;s also when small mistakes get expensive:
        a stockout on your bestseller, a waybill written for the wrong
        district, a payment left uncollected because nobody had time to
        follow up.
      </p>
      <p>
        The businesses that handle the season well don&rsquo;t work harder
        during it. They set up before it. Here&rsquo;s a short checklist to
        run in the weeks before the rush.
      </p>

      <h2>1. Sort your stock early</h2>
      <p>
        Reorder the products you know will move, and clear the ones that
        won&rsquo;t. Use low-stock alerts to catch problems before they
        become &ldquo;sorry, we&rsquo;re out&rdquo; messages to customers.
      </p>

      <h2>2. Make dispatch one action, not a ceremony</h2>
      <p>
        During the rush, hand-written waybills are a bottleneck. Connect your
        courier account in BizRavana, and dispatch becomes: select the ready
        orders, generate the waybills, hand them over.{" "}
        <a href="/documentation#docs-courier">Bulk dispatch</a> turns what
        used to take an evening into a few minutes.
      </p>

      <h2>3. Decide your payment rules now</h2>
      <p>
        Will you take advance payments this season? How long is credit valid
        for? Set the expectation before orders come in, and mark each order
        with its payment method and status as it lands — pending balances stay
        visible, so nothing gets forgotten in the noise.
      </p>

      <h2>4. Pre-write the messages you&rsquo;ll send</h2>
      <p>
        Customers expect an order confirmation the moment they buy. Set up
        your WhatsApp templates for order confirmations and invoices before
        the season, so every order gets the same clear message automatically.
      </p>
      <blockquote>
        The rush rewards preparation, not panic.
      </blockquote>
      <p>
        A busy season is a good problem to have. A little setup now means it
        stays one. Ready to prepare?{" "}
        <a href="/getting-started">Start your free trial</a> and set up your
        products, couriers and templates in an afternoon.
      </p>
    </>
  );
}
