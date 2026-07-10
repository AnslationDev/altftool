import { injectIds } from "../../utils/articleHeadings";
import BlogArticleRuntime from "./BlogArticleRuntime";
import BlogCompletionCta from "./BlogCompletionCta";
import BlogFaqSection from "./BlogFaqSection";
import BlogInlineBlogLinks from "./BlogInlineBlogLinks";
import BlogInlineToolCards from "./BlogInlineToolCards";
import BlogSources from "./BlogSources";
import { enhanceArticleInternalLinks, sanitizeArticleInternalLinks } from "../../utils/internalLinks";

function splitAfterParagraphs(html = "", paragraphCount = 2) {
  const pattern = /<\/p>/gi;
  let match;
  let count = 0;

  while ((match = pattern.exec(html))) {
    count += 1;
    if (count >= paragraphCount) {
      const splitIndex = match.index + match[0].length;
      return [html.slice(0, splitIndex), html.slice(splitIndex)];
    }
  }

  return [html, ""];
}

export default function BlogContent({
  content,
  blog,
  relatedTools = [],
  relatedPosts = [],
  faqItems = [],
}) {
  if (!content) return null;

  let cleanedContent = content;

  // 1. Remove color styles
  cleanedContent = cleanedContent.replace(/color\s*:\s*[^;"]+;?/gi, "");

  // 1b. External links: neutralize javascript: URLs and force new-tab with a
  // safe rel. Internal/altftool links keep default same-tab navigation.
  cleanedContent = cleanedContent
    .replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'href="#"')
    .replace(/<a\b([^>]*href=(["'])https?:\/\/[^"']+\2[^>]*)>/gi, (match, attrs) => {
      if (/https?:\/\/(www\.)?altftool\.com/i.test(match)) return match;
      const cleanedAttrs = attrs
        .replace(/\starget\s*=\s*(["'])[^"']*\1/gi, "")
        .replace(/\srel\s*=\s*(["'])[^"']*\1/gi, "")
        .trim();
      return `<a ${cleanedAttrs} target="_blank" rel="noopener noreferrer nofollow">`;
    });

  // 2. Convert YouTube oembed → iframe
  cleanedContent = cleanedContent.replace(
    /<oembed url="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)[^"]*"><\/oembed>/g,
    (_, videoId) => {
      return `
        <div class="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
  );

  // 3. Inject unique IDs into h1–h4 so TOC anchors work
  cleanedContent = injectIds(cleanedContent);
  cleanedContent = sanitizeArticleInternalLinks(cleanedContent, {
    currentSlug: blog?.slug,
  });
  const linkedContent = enhanceArticleInternalLinks(cleanedContent, {
    blog,
    relatedPosts,
    relatedTools,
  });
  cleanedContent = linkedContent.html;
  const shouldInsertTools = relatedTools.length > 0;
  const shouldInsertBlogLinks = relatedPosts.length > 0;
  const hasInlineFaqBlock = /FAQ_WRAPPER|FAQ_ITEM|FAQ Start/i.test(cleanedContent);
  const shouldInsertFaqs = faqItems.length > 0 && !hasInlineFaqBlock;
  const [introContent, remainingContent] = shouldInsertTools
    ? splitAfterParagraphs(cleanedContent, 2)
    : [cleanedContent, ""];

  return (
    <div className="ckeditor-content blog-article-content">
      <div className="article-copy-block" dangerouslySetInnerHTML={{ __html: introContent }} />
      {shouldInsertTools ? (
        <BlogInlineToolCards
          blog={blog}
          tools={relatedTools}
          placement="inline"
        />
      ) : null}
      {remainingContent ? (
        <div className="article-copy-block" dangerouslySetInnerHTML={{ __html: remainingContent }} />
      ) : null}
      {shouldInsertFaqs ? <BlogFaqSection items={faqItems} /> : null}
      <BlogSources blog={blog} />
      <BlogCompletionCta
        blog={blog}
        relatedTools={relatedTools}
        relatedPosts={relatedPosts}
      />
      {shouldInsertBlogLinks ? (
        <BlogInlineBlogLinks
          blog={blog}
          posts={relatedPosts}
        />
      ) : null}
      <BlogArticleRuntime
        blogId={typeof blog?.id === "string" ? blog.id : ""}
        blogSlug={blog?.slug || ""}
      />
    </div>
  );
}
