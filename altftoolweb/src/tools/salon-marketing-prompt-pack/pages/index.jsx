"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "salonType", label: "Salon type", placeholder: "hair salon, nail studio, spa" },
  { key: "offer", label: "Offer/service", placeholder: "bridal package, hair color refresh" },
  { key: "audience", label: "Audience", placeholder: "local working professionals" },
  { key: "channels", label: "Channels", placeholder: "Instagram, WhatsApp, Google Business" },
];

const defaults = {
  salonType: "hair salon",
  offer: "monsoon hair repair package",
  audience: "local working professionals",
  channels: "Instagram, WhatsApp, Google Business",
};

function buildOutput(values) {
  return [
    "Salon marketing prompt pack",
    "",
    `Business: ${values.salonType || "salon"}`,
    `Offer: ${values.offer || "service offer"}`,
    `Audience: ${values.audience || "local customers"}`,
    `Channels: ${values.channels || "social and local listings"}`,
    "",
    "Prompt 1 — Instagram caption: Write 5 caption options with a clear booking CTA.",
    "Prompt 2 — WhatsApp broadcast: Create a short, non-spammy message with offer details.",
    "Prompt 3 — Google Business post: Write a local-search-friendly update under 120 words.",
    "Prompt 4 — Review reply: Draft warm replies for positive and neutral reviews.",
  ].join("\n");
}

export default function SalonMarketingPromptPackPage() {
  return (
    <QuickToolPage
      title="Salon Marketing Prompt Pack"
      description="Generate practical AI prompts for salon offers, local posts, captions, and review replies."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Prompt pack"
    />
  );
}
