import type { ComponentType } from "react";

/** Frontmatter-style metadata for one blog post. */
export type PostMeta = {
  /** URL slug — must match the post's filename (used as the route). */
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-08-12". Newest-first ordering uses this. */
  date: string;
  /** One of the blog's category labels. */
  category: string;
  /** One-to-two sentence summary shown on the listing and in SEO meta. */
  excerpt: string;
  /** Approximate reading time in minutes. */
  minutes: number;
};

/** A post: its metadata plus the body component rendered at /blog/[slug]. */
export type BlogPost = {
  meta: PostMeta;
  Body: ComponentType;
};
