"use client";

import {
  ClipboardCheck,
  Code2,
  Globe,
  KeyRound,
  Map,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Single and Bulk Lookup",
    description:
      "Check one IP quickly or paste a batch of addresses and domains for a compact table.",
  },
  {
    icon: Globe,
    title: "IPv4, IPv6 and Domains",
    description:
      "Validate IPs directly and resolve domains to public A or AAAA records before lookup.",
  },
  {
    icon: Network,
    title: "ISP and ASN Details",
    description:
      "See provider, organization, ASN, hostname, postal code, country, and timezone.",
  },
  {
    icon: Map,
    title: "Map Links",
    description:
      "Open coordinates in Google Maps or OpenStreetMap without loading heavy map scripts.",
  },
  {
    icon: ShieldCheck,
    title: "Network Signals",
    description:
      "Highlights hosting, cloud, anycast, and private/reserved address signals where detectable.",
  },
  {
    icon: KeyRound,
    title: "Optional API Token",
    description:
      "Use free no-key lookup, or add an IPinfo token when you want token-backed results.",
  },
  {
    icon: Code2,
    title: "Raw JSON View",
    description:
      "Inspect provider response data and copy it for debugging or developer workflows.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy Friendly",
    description:
      "Copy IP, coordinates, ISP, timezone, and full JSON output with one click.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This IP Geolocation Lookup?</h2>
        <p className="description mt-3">
          A fuller IP intelligence view for debugging, security review, and location checks.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-(--card) border border-(--border) rounded-lg p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
