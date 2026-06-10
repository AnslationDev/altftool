"use client";

import { useEffect } from "react";
import { recordBlogToolClick } from "../../context/views.service";

export default function BlogArticleRuntime({ blogId = "", blogSlug = "" }) {
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
  }, []);

  useEffect(() => {
    if (!blogId) return undefined;

    const handleToolClick = (event) => {
      const link = event.target.closest("[data-blog-tool-click]");
      if (!link) return;

      const toolSlug = link.getAttribute("data-tool-slug");
      const placement = link.getAttribute("data-placement") || "related";
      if (!toolSlug) return;

      recordBlogToolClick({
        blogId,
        blogSlug,
        toolSlug,
        placement,
      });
    };

    document.addEventListener("click", handleToolClick, true);
    return () => document.removeEventListener("click", handleToolClick, true);
  }, [blogId, blogSlug]);

  return null;
}
