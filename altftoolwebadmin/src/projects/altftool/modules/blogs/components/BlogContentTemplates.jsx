"use client";

import {
  FileText,
  HelpCircle,
  ListOrdered,
  Medal,
  Scale,
  Wrench,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { parseBlogTags } from "./BlogSeoChecklist";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function titleCase(value = "") {
  return String(value || "AltFTool guide")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTopic(formData = {}) {
  return formData.heading?.trim() || formData.category?.trim() || "AltFTool workflow";
}

function getLowerTopic(formData = {}) {
  return getTopic(formData).toLowerCase();
}

function buildSeoDescription(formData = {}, templateName = "guide") {
  const topic = getLowerTopic(formData);
  return `Use this ${templateName} to understand ${topic}, compare practical options, avoid common mistakes, and move to the right AltFTool workflow faster.`;
}

function buildFields(formData = {}, templateName = "guide") {
  const topic = getTopic(formData);
  const category = formData.category?.trim();
  const tags = parseBlogTags(formData.tags || "");

  return {
    seoTitle: `${titleCase(topic)} | AltFTool Guide`.slice(0, 60),
    seoDescription: buildSeoDescription(formData, templateName).slice(0, 158),
    tags: [...new Set([category, templateName, ...tags].filter(Boolean))].slice(0, 6).join(", "),
    authorRole: formData.authorRole || (category ? `${category} Guide Editor` : "AltFTool Editorial"),
    reviewedBy: formData.reviewedBy || "AltFTool Editorial Team",
    editorialNote:
      formData.editorialNote ||
      "Reviewed for clarity, source quality, practical usefulness, and reader-safe recommendations.",
  };
}

const templates = [
  {
    id: "how-to",
    label: "How-to guide",
    caption: "Problem, steps, checklist, FAQ",
    icon: ListOrdered,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      const lowerTopic = escapeHtml(getLowerTopic(formData));
      return {
        fields: buildFields(formData, "how-to guide"),
        html: `<p><strong>${topic}</strong> is easier when the workflow is broken into clear steps. This guide explains what to check first, how to avoid common mistakes, and where AltFTool can speed up the task.</p>
<h2>Before you start</h2>
<ul class="BLOG_CHECKLIST">
  <li>Define the result you want from ${lowerTopic}.</li>
  <li>Collect the files, links, or details you need before using a tool.</li>
  <li>Check the final output before downloading, sharing, or publishing it.</li>
</ul>
<h2>Step-by-step workflow</h2>
<ol class="BLOG_STEPS">
  <li><strong>Choose the right method.</strong> Match the tool or process to the exact task.</li>
  <li><strong>Review the settings.</strong> Look for quality, format, privacy, and output options.</li>
  <li><strong>Save the result.</strong> Keep the final file or link in a place you can find later.</li>
</ol>
<h2>Final thoughts</h2>
<p>Use this process when you need a fast but careful way to handle ${lowerTopic}. Keep the steps simple, check the source details, and use related AltFTool resources when the task needs a dedicated utility.</p>`,
      };
    },
  },
  {
    id: "tool-review",
    label: "Tool review",
    caption: "Best for, features, verdict",
    icon: Wrench,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      const lowerTopic = escapeHtml(getLowerTopic(formData));
      return {
        fields: buildFields(formData, "tool review"),
        html: `<p>This review looks at <strong>${topic}</strong> from a practical user perspective: what it helps with, where it fits best, and what to check before relying on it.</p>
<h2>Best for</h2>
<ul class="BLOG_CHECKLIST">
  <li>Readers who need a quick workflow for ${lowerTopic}.</li>
  <li>One-time tasks where speed matters more than heavy setup.</li>
  <li>Comparing simple options before choosing a final tool.</li>
</ul>
<h2>Key features to check</h2>
<table class="BLOG_COMPARE">
  <thead><tr><th>Feature</th><th>Why it matters</th><th>What to test</th></tr></thead>
  <tbody>
    <tr><td>Ease of use</td><td>Reduces setup time</td><td>Can a new user finish the task quickly?</td></tr>
    <tr><td>Output quality</td><td>Protects the final result</td><td>Does the result look clean and accurate?</td></tr>
    <tr><td>Privacy</td><td>Keeps sensitive data safer</td><td>Does the workflow require uploads or accounts?</td></tr>
  </tbody>
</table>
<h2>Verdict</h2>
<p>${topic} is most useful when the goal is clear and the result can be checked immediately. For repeat work, save the best settings and pair it with related AltFTool utilities.</p>`,
      };
    },
  },
  {
    id: "comparison",
    label: "Comparison",
    caption: "Option matrix and decision rules",
    icon: Scale,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      return {
        fields: buildFields(formData, "comparison guide"),
        html: `<p><strong>${topic}</strong> often comes down to choosing the right option for the job. Use this comparison to scan the trade-offs before you commit.</p>
<h2>Quick comparison</h2>
<table class="BLOG_COMPARE">
  <thead><tr><th>Option</th><th>Best use</th><th>Watch out for</th></tr></thead>
  <tbody>
    <tr><td>Fast method</td><td>Simple one-time tasks</td><td>Limited control over fine details</td></tr>
    <tr><td>Advanced method</td><td>Repeatable or professional workflows</td><td>More settings to review</td></tr>
    <tr><td>Manual method</td><td>High-control edits</td><td>Slower and easier to repeat mistakes</td></tr>
  </tbody>
</table>
<h2>How to choose</h2>
<ul class="BLOG_CHECKLIST">
  <li>Choose speed when the task is low-risk and easy to verify.</li>
  <li>Choose control when quality, formatting, or privacy matters.</li>
  <li>Choose a reusable workflow when you repeat the same task often.</li>
</ul>
<h2>Bottom line</h2>
<p>Start with the simplest option that produces a result you can trust. Upgrade to a more advanced workflow only when the task needs more control.</p>`,
      };
    },
  },
  {
    id: "listicle",
    label: "Best list",
    caption: "Ranked recommendations",
    icon: Medal,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      return {
        fields: buildFields(formData, "best list"),
        html: `<p>This list highlights practical options for <strong>${topic}</strong>, with a focus on speed, usefulness, and how easy each option is to apply.</p>
<h2>Top picks</h2>
<ol class="BLOG_STEPS">
  <li><strong>Best overall:</strong> Choose this when you want the simplest reliable workflow.</li>
  <li><strong>Best for speed:</strong> Choose this when the task is urgent and low-risk.</li>
  <li><strong>Best for control:</strong> Choose this when formatting, privacy, or accuracy matters most.</li>
</ol>
<h2>Selection criteria</h2>
<ul class="BLOG_CHECKLIST">
  <li>Useful result without unnecessary setup.</li>
  <li>Clear output that readers can check quickly.</li>
  <li>Good fit with related AltFTool tools and guides.</li>
</ul>
<h2>Final recommendation</h2>
<p>Pick the option that matches your task size and risk level. When in doubt, start with the simplest workflow and move up only if you need more control.</p>`,
      };
    },
  },
  {
    id: "faq-article",
    label: "FAQ article",
    caption: "Question-led article",
    icon: HelpCircle,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      const lowerTopic = escapeHtml(getLowerTopic(formData));
      return {
        fields: buildFields(formData, "FAQ guide"),
        html: `<p>This FAQ answers the most common questions about <strong>${topic}</strong> so readers can understand the basics and move to the right next step.</p>
<h2 class="FAQ_HEADING">Frequently asked questions</h2>
<div class="FAQ_WRAPPER" data-icon="plus">
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>What is ${topic}?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>${topic} is a practical workflow or topic that readers can use to complete a specific digital task faster and with fewer mistakes.</p></div>
  </div>
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>Who is ${lowerTopic} best for?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>It is best for readers who want a clear, browser-friendly way to understand the task, compare options, and take action.</p></div>
  </div>
  <div class="FAQ_ITEM">
    <button class="FAQ_Q"><span>What should I check before using it?</span><span class="FAQ_ICON"></span></button>
    <div class="FAQ_A"><p>Check the source details, privacy needs, output quality, and whether a related AltFTool microtool can complete the task directly.</p></div>
  </div>
</div>
<h2>Next step</h2>
<p>Use the related tools and guides to put the answer into action, then save or share the final result after checking it carefully.</p>`,
      };
    },
  },
  {
    id: "editorial-brief",
    label: "Editorial brief",
    caption: "Intro, research, update note",
    icon: FileText,
    build: (formData) => {
      const topic = escapeHtml(getTopic(formData));
      return {
        fields: buildFields(formData, "editorial brief"),
        html: `<p><strong>${topic}</strong> has been reviewed as a practical editorial brief. The goal is to give readers a clear summary, useful checks, and a safe next step.</p>
<h2>What changed</h2>
<aside class="BLOG_CALLOUT BLOG_CALLOUT_REFRESH">
  <strong>Editorial update</strong>
  <p>We reviewed this article for freshness, clearer wording, stronger sources, and better internal links.</p>
</aside>
<h2>Key checks</h2>
<ul class="BLOG_CHECKLIST">
  <li>Claims are written in plain language and avoid overpromising.</li>
  <li>Recommendations point to useful next actions.</li>
  <li>Readers can verify important details through cited sources.</li>
</ul>
<h2>Reader takeaway</h2>
<p>Use this brief as a starting point, then check the linked sources or related AltFTool tools when the final decision depends on current details.</p>`,
      };
    },
  },
];

function TemplateButton({ template, formData, onApplyTemplate }) {
  const Icon = template.icon;
  const apply = () => {
    onApplyTemplate?.({ label: template.label, ...template.build(formData) });
    emitAlert({ type: "success", message: `${template.label} template applied.` });
  };

  return (
    <button
      type="button"
      onClick={apply}
      className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-700">{template.label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{template.caption}</span>
      </span>
    </button>
  );
}

export default function BlogContentTemplates({ formData = {}, onApplyTemplate }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {templates.map((template) => (
        <TemplateButton
          key={template.id}
          template={template}
          formData={formData}
          onApplyTemplate={onApplyTemplate}
        />
      ))}
    </div>
  );
}
