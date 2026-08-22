import { redirect } from "next/navigation";
import SupportClient from "../SupportClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { isKnownSupportSettingPath } from "@/platform/navigation/exactRouteManifest";
// ../data/routes pulls in all four platform catalogues (~2 MB). The lightweight
// exact-route manifest validates the URL before routeShape turns its verified
// segments into client state; the client loads catalogues through dynamic
// imports. See ../data/routeShape.js.
import { resolveSlugShape, describeSlugShape } from "../data/routeShape";
// serverArticle loads each catalogue through its own dynamic import (one
// separate server chunk per platform, loaded per request) so the resolved
// record's article can be server-rendered without statically bundling the
// catalogues into this route. See ./serverArticle.jsx.
import {
  describeSupportRecord,
  recordFaqs,
  recordSteps,
  resolveSupportRecord,
  SupportSettingArticle,
} from "./serverArticle";

/**
 * Catch-all deep-link route for every Support Settings destination that
 * isn't the bare home page — one Windows/macOS/Android/iOS setting, one
 * device guide, a device's landing page, a Help & Tools page, or an AI
 * Tools page. See ../data/routes.js for the full URL scheme and why a
 * single catch-all (rather than a page per content type) is what keeps
 * every one of the 700+ OS settings and 150+ device settings linkable
 * without a hand-maintained route per id.
 *
 * This route renders the exact same <SupportClient /> the plain
 * /supportsetting page does — it isn't a different page, just the same
 * app told what to open on load via initialActiveId /
 * initialPlatformOverride. What this route adds on top is the crawlable
 * substance: the resolved record's article is rendered on the server (see
 * ./serverArticle.jsx) and handed to SupportClient, which shows it until
 * the interactive app hydrates and then takes over. Everything past that
 * (sidebar, search, master-detail navigation) is unchanged; SupportClient
 * keeps the URL in sync with whatever the visitor clicks next.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const segments = slug || [];
  const path = `/supportsetting/${segments.join("/")}`;
  const known = isKnownSupportSettingPath(path);
  const record = known ? await resolveSupportRecord(segments) : null;
  const described = describeSupportRecord(record) || describeSlugShape(segments);
  return createPageMetadata({
    title: described.title,
    description: described.description || describeSlugShape(segments).description,
    path,
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
    noindex: !known,
  });
}

export default async function SupportSettingSlugPage({ params }) {
  const { slug } = await params;
  const segments = slug || [];
  const path = `/supportsetting/${segments.join("/")}`;

  // The proxy rejects unknown paths before rendering. Keep this lightweight
  // server-side fallback for direct component execution or a future matcher
  // change; never *statically* import the multi-megabyte Support Settings
  // catalogues here — serverArticle's per-platform dynamic imports are the
  // only sanctioned way this route touches them.
  if (!isKnownSupportSettingPath(path)) {
    redirect("/supportsetting");
  }

  const { activeId, platformOverride } = resolveSlugShape(segments);
  const record = await resolveSupportRecord(segments);

  // Schema is only emitted for content that is actually in the server HTML:
  // recordFaqs/recordSteps return exactly what SupportSettingArticle renders.
  const faqs = recordFaqs(record);
  const steps = recordSteps(record);
  const jsonLd = [
    faqs.length
      ? createFaqJsonLd({
          path,
          questions: faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
        })
      : null,
    steps.length && record?.setting
      ? createHowToJsonLd({
          path,
          name: record.setting.heading || record.setting.title,
          description: record.setting.description,
          steps,
        })
      : null,
  ].filter(Boolean);

  return (
    <>
      {jsonLd.length > 0 && <JsonLd data={jsonLd} />}
      <SupportClient
        initialActiveId={activeId}
        initialPlatformOverride={platformOverride}
        serverArticle={record ? <SupportSettingArticle record={record} /> : null}
      />
    </>
  );
}
