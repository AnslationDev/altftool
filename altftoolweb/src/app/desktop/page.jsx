import DesktopClient from "./DesktopClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top Desktop Software for Windows & Mac",
    description:
      "Discover useful desktop software on AltFTool. Download powerful tools for productivity, utilities, and everyday tasks designed for Windows and Mac users.",
    path: "/desktop",
    keywords: ["desktop software", "Windows tools", "Mac tools", "productivity software"],
  });
}

export default function Page() {
  return (
    <>
      {/*
        The page's single h1. It lives here, in the server component, so it is in
        the initial HTML for every request and is not gated on the "use client"
        subtree below it or on any fetch.
      */}
      {/*
        A plain div, not <header>: the root layout puts {children} in a bare
        <div id="main-content">, so a <header> here would map to a second
        `banner` landmark alongside the site header.
      */}
      <div className="section pb-0">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Desktop Software for Windows &amp; Mac
        </h1>
        <p className="description mt-3 max-w-3xl">
          Browse popular desktop apps and software — communication, media,
          productivity, and creative tools — each linked to the publisher&apos;s
          own site.
        </p>
      </div>
      <DesktopClient />
    </>
  );
}
