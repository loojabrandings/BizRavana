import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Reveal from "@/components/reveal";
import JsonLd from "@/components/json-ld";
import { SITE_URL } from "@/config/site";
import { POSTS, getPost } from "@/content/blog";

function formatDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy");
}

type Params = { slug: string };

/** Prerender every post at build time; unknown slugs fall through to 404. */
export function generateStaticParams() {
  return POSTS.map(({ meta }) => ({ slug: meta.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };

  const postUrl = `${SITE_URL}/blog/${post.meta.slug}`;

  return {
    title: `${post.meta.title} — BizRavana Blog`,
    description: post.meta.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.excerpt,
      url: postUrl,
      publishedTime: post.meta.date,
      authors: ["BizRavana"],
      siteName: "BizRavana",
      locale: "en_LK",
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { meta, Body } = post;
  const index = POSTS.findIndex((p) => p.meta.slug === meta.slug);
  const newer = index > 0 ? POSTS[index - 1] : undefined;
  const older = index < POSTS.length - 1 ? POSTS[index + 1] : undefined;

  const postUrl = `${SITE_URL}/blog/${meta.slug}`;

  return (
    <main>
      {/* Structured data — article + breadcrumbs for this post. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: meta.title,
          description: meta.excerpt,
          datePublished: meta.date,
          dateModified: meta.date,
          mainEntityOfPage: postUrl,
          author: { "@type": "Organization", name: "BizRavana", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "BizRavana",
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512x512.png` },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: meta.title,
              item: postUrl,
            },
          ],
        }}
      />

      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          other editorial pages. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Post header — category, title and meta, centered. */}
      <header className="blog-post-hero" aria-labelledby="blog-post-title">
        <div className="blog-post-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{meta.category}</p>
            <h1 id="blog-post-title" className="blog-post-hero__title">
              {meta.title}
            </h1>
            <p className="blog-post-hero__meta">
              {formatDate(meta.date)} · {meta.minutes} min read
            </p>
          </Reveal>
        </div>
      </header>

      {/* 2. Article — the post body in a readable centered column. */}
      <article className="about-section blog-article">
        <div className="about-section__inner">
          <div className="blog-post">
            <Reveal>
              <Body />
            </Reveal>
          </div>
        </div>
      </article>

      {/* 3. Post navigation — newer/older, plus back to the listing. */}
      <nav className="blog-post__nav" aria-label="Post navigation">
        <div className="about-section__inner blog-post__nav-inner">
          {older ? (
            <Link className="blog-post__nav-link" href={`/blog/${older.meta.slug}`}>
              <span className="blog-post__nav-label">Older</span>
              <span className="blog-post__nav-title">{older.meta.title}</span>
            </Link>
          ) : (
            <span />
          )}
          <Link className="blog-post__nav-link blog-post__nav-all" href="/blog">
            All posts
          </Link>
          {newer ? (
            <Link
              className="blog-post__nav-link blog-post__nav-link--right"
              href={`/blog/${newer.meta.slug}`}
            >
              <span className="blog-post__nav-label">Newer</span>
              <span className="blog-post__nav-title">{newer.meta.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>

      <Footer />
    </main>
  );
}
