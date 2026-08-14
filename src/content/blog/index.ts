import type { BlogPost } from "./types";
import helloBizravana, { meta as helloBizravanaMeta } from "./posts/hello-bizravana";
import pricingForProfit, { meta as pricingForProfitMeta } from "./posts/pricing-for-profit";
import bellaBoutiqueStory, { meta as bellaBoutiqueStoryMeta } from "./posts/bella-boutique-story";
import avuriduOrders, { meta as avuriduOrdersMeta } from "./posts/avuridu-orders";

/**
 * The blog index — every post in the site, newest first.
 *
 * Adding a post: create `src/content/blog/posts/<slug>.tsx` exporting a
 * `meta` object (see PostMeta) and a default body component, then register
 * both here. The post is picked up by the listing page and the /blog/[slug]
 * route automatically.
 */
export const POSTS: BlogPost[] = [
  { meta: helloBizravanaMeta, Body: helloBizravana },
  { meta: pricingForProfitMeta, Body: pricingForProfit },
  { meta: bellaBoutiqueStoryMeta, Body: bellaBoutiqueStory },
  { meta: avuriduOrdersMeta, Body: avuriduOrders },
].sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

/** The most recent post — featured on the listing page. */
export const FEATURED = POSTS[0];

/** Find a post by its slug, for the /blog/[slug] route. */
export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.meta.slug === slug);
}
