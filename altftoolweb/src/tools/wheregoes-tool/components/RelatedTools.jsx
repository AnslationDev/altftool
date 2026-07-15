"use client";

import {
  ArrowRight,
  FileCode2,
  Globe,
  Link2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD, CARD_HOVER, FOCUS_RING, SectionHeading } from "./ui.jsx";

const RELATED_TOOLS = [
  {
    slug: "http-status-code-explainer",
    name: "HTTP Status Code Checker",
    description: "Check HTTP status codes",
    icon: FileCode2,
    tone: "primary",
  },
  {
    slug: "domain-checker",
    name: "Domain Checker",
    description: "Verify domain availability",
    icon: ShieldCheck,
    tone: "success",
  },
  {
    slug: "ip-geolocation-lookup",
    name: "IP Geolocation Lookup",
    description: "Locate any IP address",
    icon: MapPin,
    tone: "warning",
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    description: "Encode or decode URLs",
    icon: Globe,
    tone: "danger",
  },
  {
    slug: "link-preview-generator",
    name: "Link Preview Generator",
    description: "Preview link metadata",
    icon: Link2,
    tone: "info",
  },
];

export default function RelatedTools() {
  return (
    <section aria-label="Related SEO and web tools">
      <SectionHeading
        eyebrow="Keep going"
        title="Related SEO & Web Tools"
        aside={
          <a
            href="/tools/all"
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] px-3.5 text-xs font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95 ${FOCUS_RING}`}
            style={{ background: "var(--anslation-ds-cta-gradient)" }}
          >
            View all tools
            <ArrowRight size={13} aria-hidden="true" />
          </a>
        }
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {RELATED_TOOLS.map((tool) => (
          <li key={tool.slug}>
            <a
              href={`/tools/all/${tool.slug}`}
              className={`group ${CARD} ${CARD_HOVER} flex h-full items-center gap-3 p-3.5 ${FOCUS_RING}`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                style={toneStyle(tool.tone)}
              >
                <tool.icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-[13px] font-bold leading-snug text-(--foreground) group-hover:text-(--primary-hover) dark:group-hover:text-(--primary)">
                  {tool.name}
                </span>
                <span className="block truncate text-[11px] font-medium text-(--muted-foreground)">
                  {tool.description}
                </span>
              </span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="shrink-0 text-(--muted-foreground) transition group-hover:translate-x-0.5 group-hover:text-(--primary-hover) dark:group-hover:text-(--primary)"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
