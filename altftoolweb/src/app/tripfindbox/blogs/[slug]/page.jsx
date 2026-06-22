import { ArrowLeft, CalendarDays, Clock3, ExternalLink, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/app/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import FloatingCallIcon from "@/app/tripfindbox/components/FloatingCallIcon";
import { buildBlogSections, fetchBlogPosts, getBlogPost, getRelatedBlogs } from "@/app/tripfindbox/lib/blogData";
import { tfbPath } from "@/app/tripfindbox/lib/tfbLink";

export const revalidate = 1800;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Not Found | TripFindBox",
    };
  }

  return {
    title: `${post.title} | TripFindBox Blog`,
    description: post.description,
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchBlogPosts(90);
  const sections = buildBlogSections(post);
  const relatedPosts = getRelatedBlogs(post, allPosts, 4);

  return (
    <main className="site-route-page tripnest-blog-page blog-detail-page">
      <ResultsHeader />
      <section className="blog-detail-hero">
        <Link href="/tripfindbox/blogs" className="blog-back-link">
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

      <aside className="mobile-results-callbar" aria-label="Call TripFindBox support">
        <a href="tel:+17147827278">
          <span><FloatingCallIcon /></span>
          <strong>Call &amp; Get Unpublished Flight Deals!</strong>
          <b>+1-714-782-7278</b>
        </a>
      </aside>

      <Footer />
    </main>
  );
}
