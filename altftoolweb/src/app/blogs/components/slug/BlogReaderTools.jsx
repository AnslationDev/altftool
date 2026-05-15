"use client";

import { ArrowUp, Check, Copy, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const input = document.createElement("input");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  return copied;
}

export default function BlogReaderTools() {
  const [copiedPage, setCopiedPage] = useState(false);
  const [copiedSection, setCopiedSection] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const article = document.querySelector(".blog-article-content");
    if (!article) return undefined;

    const headings = [...article.querySelectorAll("h2[id], h3[id]")];
    const buttons = headings.map((heading) => {
      if (heading.querySelector(".blog-heading-copy")) return null;

      heading.classList.add("blog-copy-heading");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "blog-heading-copy";
      button.setAttribute("aria-label", "Copy link to this section");
      button.textContent = "#";

      const copyHeadingLink = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
        await copyText(url);
        setCopiedSection(true);
        window.setTimeout(() => setCopiedSection(false), 1600);
      };

      button.addEventListener("click", copyHeadingLink);
      heading.appendChild(button);

      return { button, heading, copyHeadingLink };
    });

    return () => {
      buttons.filter(Boolean).forEach(({ button, heading, copyHeadingLink }) => {
        button.removeEventListener("click", copyHeadingLink);
        button.remove();
        heading.classList.remove("blog-copy-heading");
      });
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyPage = async () => {
    await copyText(window.location.href);
    setCopiedPage(true);
    window.setTimeout(() => setCopiedPage(false), 1600);
  };

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 sm:bottom-5 sm:right-5">
      {copiedSection ? (
        <div className="rounded-[6px] border border-(--border) bg-(--card) px-3 py-2 text-xs font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-md)]">
          Section link copied
        </div>
      ) : null}
      <button
        type="button"
        onClick={copyPage}
        className="flex h-11 w-11 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) text-(--foreground) shadow-[var(--anslation-ds-shadow-md)] transition hover:border-(--primary) hover:text-(--primary)"
        aria-label="Copy article link"
        title="Copy article link"
      >
        {copiedPage ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={backToTop}
        className={`flex h-11 w-11 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) text-(--foreground) shadow-[var(--anslation-ds-shadow-md)] transition hover:border-(--primary) hover:text-(--primary) ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <div className="hidden h-11 w-11 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) text-(--muted-foreground) shadow-[var(--anslation-ds-shadow-md)] lg:flex" title="Copy section links from article headings">
        <Link2 className="h-4 w-4" />
      </div>
    </div>
  );
}
