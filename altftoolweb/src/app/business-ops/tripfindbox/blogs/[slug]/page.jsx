import { ArrowLeft, CalendarDays, Clock3, ExternalLink, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/app/business-ops/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/business-ops/tripfindbox/components/ResultsHeader";
import MobileResultsCallBar from "@/app/business-ops/tripfindbox/components/MobileResultsCallBar";
import { buildBlogSections, fetchBlogPosts, getBlogPost, getRelatedBlogs } from "@/app/business-ops/tripfindbox/lib/blogData";
import { getTripFindBoxContactInfo } from "@/app/business-ops/tripfindbox/lib/contactInfo";
import { tfbPath } from "@/app/business-ops/tripfindbox/lib/tfbLink";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return createPageMetadata({
      title: "Blog Not Found | TripFindBox",
      path: `/business-ops/tripfindbox/blogs/${slug}`,
    });
  }

  return createPageMetadata({
    title: `${post.title} | TripFindBox Blog`,
    description: post.description,
    path: `/business-ops/tripfindbox/blogs/${slug}`,
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
        <Link href="/business-ops/tripfindbox/blogs" className="blog-back-link">
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
