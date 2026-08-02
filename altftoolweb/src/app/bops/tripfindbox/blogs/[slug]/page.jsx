import { ArrowLeft, CalendarDays, Clock3, ExternalLink, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/app/bops/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/bops/tripfindbox/components/ResultsHeader";
import MobileResultsCallBar from "@/app/bops/tripfindbox/components/MobileResultsCallBar";
import { buildBlogSections, fetchBlogPosts, getBlogPost, getRelatedBlogs } from "@/app/bops/tripfindbox/lib/blogData";
import { getTripFindBoxContactInfo } from "@/app/bops/tripfindbox/lib/contactInfo";
import { tfbPath } from "@/app/bops/tripfindbox/lib/tfbLink";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

// tripfindbox/layout.jsx sets a plain `title`, which consumes the root layout's
// "%s | AltFTool" template for this subtree — nothing is appended below it, so
// whatever generateMetadata returns IS the rendered <title>. Feed headlines run
// to 110 characters and the old `${title} | TripFindBox Blog` shipped titles of
// 74-116 chars (measured live). Clamp to 60 on a word boundary, and keep the
// brand suffix only when it still fits.
function blogDocumentTitle(headline) {
  const base = String(headline || "").trim();
  const withBrand = `${base} | TripFindBox`;

  if (withBrand.length <= 60) return withBrand;
  if (base.length <= 60) return base;

  const clipped = base.slice(0, 61);
  const boundary = clipped.lastIndexOf(" ");
  const compact = boundary >= 40 ? clipped.slice(0, boundary) : base.slice(0, 60);

  return compact.replace(/[\s,:;|\-–—]+$/g, "").trim();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    // Without noindex this page asks to be indexed, and it is reachable at any
    // slug: these routes are statically generated, so notFound() is served with
    // a 200 rather than a 404 (verified live across /tools, /blogs, /apps and
    // /alternatives). Every unknown slug is therefore an indexable soft 404.
    return createPageMetadata({
      title: "Blog Not Found | TripFindBox",
      path: `/bops/tripfindbox/blogs/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: blogDocumentTitle(post.title),
    description: post.description,
    path: `/bops/tripfindbox/blogs/${slug}`,
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const [post, contact] = await Promise.all([
    getBlogPost(slug),
    getTripFindBoxContactInfo(),
  ]);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchBlogPosts(90);
  const sections = buildBlogSections(post);
  const relatedPosts = getRelatedBlogs(post, allPosts, 4);

  return (
    <main className="site-route-page tripnest-blog-page blog-detail-page">
      <ResultsHeader initialContact={contact} />
      <section className="blog-detail-hero">
        <Link href="/bops/tripfindbox/blogs" className="blog-back-link">
          <ArrowLeft size={18} />
          Back to Blogs
        </Link>
        <span className="blog-detail-category">{post.category}</span>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="blog-detail-meta">
          <span>
            <UserRound size={16} />
            {post.author}
          </span>
          <span>
            <CalendarDays size={16} />
            {post.date}
          </span>
          <span>
            <Clock3 size={16} />
            {post.readingTime}
          </span>
        </div>
      </section>

      <section className="blog-detail-cover">
        <img src={post.image} alt="" />
      </section>

      <section className="blog-detail-layout">
        <aside className="blog-toc" aria-label="Table of contents">
          <h2>Table of Contents</h2>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.heading}
            </a>
          ))}
          <a href={post.sourceUrl} target="_blank" rel="noreferrer">
            Original source
          </a>
        </aside>

        <article className="blog-article">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="blog-source-link">
            Read the full story on {post.sourceName}
            <ExternalLink size={17} />
          </a>
        </article>
      </section>

      <section className="blog-section blog-related-section">
        <div className="blog-section-heading">
          <span>Keep Reading</span>
          <h2>Related travel guides</h2>
          <p>More TripFindBox stories connected to this topic.</p>
        </div>
        <div className="blog-related-grid">
          {relatedPosts.map((related) => (
            <article key={related.slug} className="blog-card">
              <Link href={tfbPath(`/blogs/${related.slug}`)} className="blog-card-image">
                <img src={related.image} alt="" loading="lazy" />
                <span>{related.category}</span>
              </Link>
              <div className="blog-card-body">
                <div className="blog-meta-row">
                  <span>{related.date}</span>
                  <span>{related.readingTime}</span>
                </div>
                <h3>
                  <Link href={tfbPath(`/blogs/${related.slug}`)}>{related.title}</Link>
                </h3>
                <p>{related.description}</p>
                <Link href={tfbPath(`/blogs/${related.slug}`)} className="blog-read-more">
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <MobileResultsCallBar initialContact={contact} />

      <Footer />
    </main>
  );
}
