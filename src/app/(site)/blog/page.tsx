import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Card from "@/components/card";
import Reveal from "@/components/reveal";
import { POSTS, FEATURED } from "@/content/blog";
import type { PostMeta } from "@/content/blog/types";

export const metadata: Metadata = {
  title: "Blog — BizRavana",
  description:
    "Stories and practical advice for growing Sri Lankan businesses — pricing, orders, inventory, couriers and the people behind them.",
};

/** Hero copy — one centered statement, matching the other editorial pages. */
const HERO = {
  eyebrow: "Blog",
  title: "Stories & advice for growing businesses",
  desc: "Practical tips, customer stories and product updates — written for the people who run Sri Lankan businesses day to day.",
};

function formatDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy");
}

/** One post card — the whole card is a link to the post. */
function PostCard({ meta, featured = false }: { meta: PostMeta; featured?: boolean }) {
  return (
    <Link
      className="blog-card__link"
      href={`/blog/${meta.slug}`}
      aria-label={`Read: ${meta.title}`}
    >
      <Card className={`blog-card${featured ? " blog-card--featured" : ""}`}>
        <span className="blog-chip">{meta.category}</span>
        <h3 className="blog-card__title">{meta.title}</h3>
        <p className="blog-card__excerpt">{meta.excerpt}</p>
        <span className="blog-card__meta">
          {formatDate(meta.date)} · {meta.minutes} min read
        </span>
      </Card>
    </Link>
  );
}

/**
 * Blog listing — a centered statement over the ambient blob backdrop, the
 * latest post featured full-width, then the rest as a card grid. Same
 * editorial structure as the other site pages.
 */
export default function BlogPage() {
  const rest = POSTS.filter((post) => post.meta.slug !== FEATURED.meta.slug);

  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          other editorial pages, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="blog-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="blog-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Featured post — the latest, full-width. */}
      <section className="about-section blog-section" aria-label="Latest post">
        <div className="about-section__inner about-section__inner--wide">
          <Reveal>
            <PostCard meta={FEATURED.meta} featured />
          </Reveal>
        </div>
      </section>

      {/* 3. The rest — a card grid. */}
      <section className="about-section blog-section" aria-label="All posts">
        <div className="about-section__inner about-section__inner--wide">
          <ul className="blog-grid">
            {rest.map(({ meta }, i) => (
              <li key={meta.slug}>
                <Reveal className="blog-grid__cell" delay={(i % 2) * 90}>
                  <PostCard meta={meta} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
