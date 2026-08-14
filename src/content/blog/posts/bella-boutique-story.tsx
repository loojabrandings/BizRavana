import type { PostMeta } from "../types";

export const meta: PostMeta = {
  slug: "bella-boutique-story",
  title: "How Bella Boutique stopped losing quotations",
  date: "2026-07-22",
  category: "Customer Stories",
  excerpt:
    "A quotation used to take Nadeesha half an hour — and half her customers left before she could send it. Here's what changed at Bella Boutique.",
  minutes: 4,
};

export default function BellaBoutiqueStory() {
  return (
    <>
      <p>
        Bella Boutique, in Colombo 07, sells fashion that moves fast. A
        customer walks in, likes a kurta, asks for a price on a bulk order —
        and Nadeesha, the owner, faces the classic problem: how do you send a
        proper quotation without keeping the customer waiting?
      </p>
      <p>
        Before BizRavana, the answer was: slowly. A quotation meant opening a
        spreadsheet, retyping prices, formatting it, and then trying to get it
        to the customer before they lost interest.
      </p>

      <h2>Half an hour became one click</h2>
      <p>
        Nadeesha now creates a quotation from a ready template, adds the
        items, and sends it to the customer on WhatsApp — in the time it used
        to take to find the spreadsheet.
      </p>
      <blockquote>
        A quotation used to take me half an hour. Now the customer gets it on
        WhatsApp before they&rsquo;ve left the shop.
      </blockquote>
      <p>
        The speed matters more than it sounds. A quotation that arrives while
        the customer is still deciding is a quotation that gets accepted. One
        that arrives the next day gets compared with two competitors.
      </p>

      <h2>Quotations that turn into orders</h2>
      <p>
        When a customer says yes, the quotation converts to an order with one
        click — no retyping, no transcription errors. The order carries the
        customer&rsquo;s details, the items and the agreed price, and from
        there it follows the normal flow: invoice, payment, delivery.
      </p>
      <p>
        Every quotation&rsquo;s status is tracked — draft, accepted, converted
        — so it&rsquo;s easy to see which customers are waiting on a price and
        follow up at the right moment.
      </p>

      <h2>The small habit that adds up</h2>
      <p>
        The quiet win for Bella Boutique is knowing the numbers. Lifetime
        spend per customer, pending balances, which products carry the margin
        — none of it requires extra work. It&rsquo;s just there, because the
        day-to-day is running through one system.
      </p>
      <p>
        Ready to send your next quotation in a minute instead of thirty?{" "}
        <a href="/features">See what BizRavana does</a> or{" "}
        <a href="/getting-started">start your free trial</a>.
      </p>
    </>
  );
}
