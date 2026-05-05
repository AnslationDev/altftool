"use client";

import { injectIds } from "./BlogTableOfContents";

export default function BlogContent({ content }) {
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

  return (
    <div
      className="ckeditor-content"
      dangerouslySetInnerHTML={{ __html: cleanedContent }}
    />
  );
}