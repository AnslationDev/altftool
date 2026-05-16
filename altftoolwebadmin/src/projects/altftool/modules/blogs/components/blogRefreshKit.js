import { parseBlogTags } from "./BlogSeoChecklist";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sentenceCase(value = "") {
  const text = cleanText(value);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function trimToSentence(value = "", maxLength = 158) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "").replace(/[.,;:!?-]+$/, "");
}

function getBlockSignature(block = "") {
  const html = String(block || "");
  if (/FAQ Start|FAQ_WRAPPER|FAQ_ITEM/i.test(html)) return "FAQ Start";
  if (/BLOG_CALLOUT_REFRESH/i.test(html)) return "BLOG_CALLOUT_REFRESH";
  if (/What we checked in this update/i.test(html)) return "What we checked in this update";
  if (/Source check/i.test(html)) return "Source check";
  return cleanText(html.replace(/<[^>]*>/g, " ")).slice(0, 90);
}

export function todayIso() {
  return new Date().toISOString();
}

export function formatToday() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function topicFromForm(formData = {}) {
  return cleanText(formData.heading) || cleanText(formData.category) || "this guide";
}

export function buildMetaTitle(formData = {}) {
  const heading = topicFromForm(formData);
  if (heading.length >= 50 && heading.length <= 60) return heading;

  const withBrand = `${heading} | AltFTool Guide`;
  if (withBrand.length <= 60) return withBrand;
  return trimToSentence(heading, 60);
}

export function buildMetaDescription(formData = {}) {
  const heading = topicFromForm(formData);
  const category = cleanText(formData.category) || "digital tools";

  return trimToSentence(
    `Use this AltFTool guide to understand ${heading.toLowerCase()}, check important details, compare practical options, and move through ${category.toLowerCase()} tasks faster.`,
    158,
  );
}

export function buildTrustFields(formData = {}) {
  const category = cleanText(formData.category);

  return {
    authorRole: cleanText(formData.authorRole) || (category ? `${category} Guide Editor` : "AltFTool Editorial"),
    reviewedBy: cleanText(formData.reviewedBy) || "AltFTool Editorial Team",
    editorialNote:
      cleanText(formData.editorialNote) ||
      "Reviewed for accuracy, freshness, source quality, practical usefulness, and reader-safe recommendations.",
  };
}

export function buildReviewFields(formData = {}) {
  return {
    ...buildTrustFields(formData),
    reviewedAt: todayIso(),
  };
}

export function buildSourceNoteFields(formData = {}) {
  return {
    sourceNotes:
      cleanText(formData.sourceNotes) ||
      "Sources, examples, and recommendation wording were checked during the latest editorial review.",
  };
}

export function buildSeoFixFields(formData = {}) {
  const currentTags = parseBlogTags(formData.tags || "");
  const category = cleanText(formData.category);

  return {
    seoTitle: buildMetaTitle(formData),
    seoDescription: buildMetaDescription(formData),
    tags: [...new Set([category, "guide", "altftool", ...currentTags].filter(Boolean))].slice(0, 6).join(", "),
    ...buildReviewFields(formData),
    ...buildSourceNoteFields(formData),
  };
}

export function buildRefreshNoteBlock(formData = {}) {
  const topic = topicFromForm(formData);
  return `<aside class="BLOG_CALLOUT BLOG_CALLOUT_REFRESH">
  <strong>Updated review note</strong>
  <p>This guide was refreshed on ${formatToday()} to improve clarity, source quality, internal links, and practical next steps for ${escapeHtml(topic.toLowerCase())}.</p>
</aside>`;
}

export function buildRefreshChecklistBlock(formData = {}) {
  const topic = topicFromForm(formData);
  return `<h2>What we checked in this update</h2>
<ul class="BLOG_CHECKLIST">
  <li>Reviewed the main advice for ${escapeHtml(topic.toLowerCase())}.</li>
  <li>Checked source links, examples, and outdated claims.</li>
  <li>Improved reader flow with clearer headings and next steps.</li>
</ul>`;
}

export function buildSourceReminderBlock() {
  return `<aside class="BLOG_CALLOUT">
  <strong>Source check</strong>
  <p>Important details can change over time. Review the linked sources and the latest official guidance before making a final decision.</p>
</aside>`;
}

export function buildFaqBlock(formData = {}) {
  const topic = topicFromForm(formData);
  const escapedTopic = escapeHtml(topic);
  const lowerTopic = escapeHtml(topic.toLowerCase());

  return `<!-- FAQ Start -->
<h2 class="FAQ_HEADING">Frequently asked questions</h2>
<div class="FAQ_WRAPPER" data-icon="plus">
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>What is ${escapedTopic} about?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>${escapedTopic} explains the practical steps, checks, and decisions readers need before using this workflow.</p></div>
  </div>
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>Who should use this guide?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>This guide is useful for readers who want a quick, browser-friendly way to understand ${lowerTopic} and take action without extra setup.</p></div>
  </div>
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>What should I check before relying on it?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>Check the latest sources, review the final output, and use related AltFTool resources when the task needs a dedicated utility.</p></div>
  </div>
</div>
<!-- FAQ End -->`;
}

export function hasFaqBlock(html = "") {
  return /FAQ_ITEM|FAQ_Q|FAQ_A|<!--\s*FAQ Start\s*-->/i.test(String(html || ""));
}

export function buildQuickRefreshPayload(action = "", formData = {}) {
  const normalizedAction = String(action || "").toLowerCase();
  const blocks = [];
  let fields = {};
  let label = "Refresh action";
  let expandSeo = false;

  if (normalizedAction === "review") {
    fields = { ...buildReviewFields(formData), ...buildSourceNoteFields(formData) };
    label = "Review metadata";
  } else if (normalizedAction === "faq") {
    fields = buildReviewFields(formData);
    if (!hasFaqBlock(formData.description)) blocks.push(buildFaqBlock(formData));
    label = "FAQ refresh";
  } else if (normalizedAction === "links") {
    fields = buildReviewFields(formData);
    blocks.push(buildRefreshChecklistBlock(formData));
    label = "Internal link refresh";
  } else if (normalizedAction === "sources") {
    fields = { ...buildReviewFields(formData), ...buildSourceNoteFields(formData) };
    blocks.push(buildSourceReminderBlock());
    label = "Source refresh";
  } else if (normalizedAction === "seo") {
    fields = buildSeoFixFields(formData);
    blocks.push(buildRefreshNoteBlock(formData), buildRefreshChecklistBlock(formData));
    if (!hasFaqBlock(formData.description)) blocks.push(buildFaqBlock(formData));
    label = "SEO fix pack";
    expandSeo = true;
  }

  return {
    blocks,
    fields,
    label,
    expandSeo,
    hasWork: blocks.length > 0 || Object.keys(fields).length > 0,
  };
}

export function appendRefreshBlocks(description = "", blocks = []) {
  const currentDescription = String(description || "");
  const acceptedBlocks = [];

  blocks.filter(Boolean).forEach((block) => {
    const signature = getBlockSignature(block);
    const alreadyInDescription = signature && currentDescription.includes(signature);
    const alreadyAccepted = acceptedBlocks.some((acceptedBlock) => getBlockSignature(acceptedBlock) === signature);
    if (!alreadyInDescription && !alreadyAccepted) acceptedBlocks.push(block);
  });

  if (!acceptedBlocks.length) {
    return {
      description: currentDescription,
      addedCount: 0,
      skippedCount: blocks.filter(Boolean).length,
    };
  }

  return {
    description: `${currentDescription}${currentDescription.trim() ? "\n\n" : ""}${acceptedBlocks.join("\n\n")}`,
    addedCount: acceptedBlocks.length,
    skippedCount: blocks.filter(Boolean).length - acceptedBlocks.length,
  };
}

export function buildConclusionBlock(formData = {}) {
  const topic = topicFromForm(formData);
  return `<h2>Final thoughts</h2><p>${escapeHtml(sentenceCase(topic))} works best when the next step is clear. Review the checklist above, compare the related resources, and keep the workflow simple enough to repeat whenever you need it.</p>`;
}
