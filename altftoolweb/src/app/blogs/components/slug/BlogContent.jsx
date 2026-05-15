"use client";

import { useEffect } from "react";
import { injectIds } from "./BlogTableOfContents";
import BlogCompletionCta from "./BlogCompletionCta";
import BlogFaqSection from "./BlogFaqSection";
import BlogInlineBlogLinks from "./BlogInlineBlogLinks";
import BlogInlineToolCards from "./BlogInlineToolCards";
import BlogSources from "./BlogSources";
import { enhanceArticleInternalLinks } from "../../utils/internalLinks";

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
  useEffect(() => {
    const article = document.querySelector(".blog-article-content");
    if (!article) return undefined;

    const wrappers = article.querySelectorAll(".FAQ_WRAPPER");
    wrappers.forEach((wrapper, wrapperIndex) => {
      const items = [...wrapper.querySelectorAll(".FAQ_ITEM")];

      items.forEach((item, index) => {
        const button = item.querySelector(".FAQ_Q");
        const answer = item.querySelector(".FAQ_A");
        if (!button || !answer) return;

        const answerId = answer.id || `blog-faq-answer-${wrapperIndex + 1}-${index + 1}`;
        answer.id = answerId;
        button.type = "button";
        button.setAttribute("aria-controls", answerId);

        if (index === 0 && !wrapper.querySelector(".FAQ_OPEN")) {
          item.classList.add("FAQ_OPEN");
        }

        button.setAttribute("aria-expanded", item.classList.contains("FAQ_OPEN") ? "true" : "false");
      });
    });

    const handleFaqClick = (event) => {
      const button = event.target.closest(".FAQ_Q");
      if (!button || !article.contains(button)) return;

      const item = button.closest(".FAQ_ITEM");
      const wrapper = button.closest(".FAQ_WRAPPER");
      if (!item) return;

      wrapper?.querySelectorAll(".FAQ_ITEM").forEach((sibling) => {
        if (sibling !== item) {
          sibling.classList.remove("FAQ_OPEN");
          sibling.querySelector(".FAQ_Q")?.setAttribute("aria-expanded", "false");
        }
      });

      const nextOpen = !item.classList.contains("FAQ_OPEN");
      item.classList.toggle("FAQ_OPEN", nextOpen);
      button.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    };

    article.addEventListener("click", handleFaqClick);
    return () => article.removeEventListener("click", handleFaqClick);
  }, [content]);

  if (!content) return null;

  let cleanedContent = content;

  // 1. Remove color styles
  cleanedContent = cleanedContent.replace(/color\s*:\s*[^;"]+;?/gi, "");

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
      <div dangerouslySetInnerHTML={{ __html: introContent }} />
      {shouldInsertTools ? (
        <BlogInlineToolCards
          blog={blog}
          tools={relatedTools}
          placement="inline"
        />
      ) : null}
      {remainingContent ? <div dangerouslySetInnerHTML={{ __html: remainingContent }} /> : null}
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
    </div>
  );
}
