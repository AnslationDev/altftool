"use client";

import {
  Columns3,
  LayoutList,
  Lightbulb,
  ListChecks,
  Scale,
  Wrench,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTopic(formData = {}) {
  return formData.heading?.trim() || formData.category?.trim() || "this workflow";
}

function getSummary(formData = {}) {
  const fallback = `Use this section to make ${getTopic(formData).toLowerCase()} easier to compare, scan, and apply.`;
  const text = formData.seoDescription?.trim() || stripHtml(formData.description || "");
  if (!text) return fallback;
  return text.length > 145 ? `${text.slice(0, 145).replace(/\s+\S*$/, "")}.` : text;
}

const blockBuilders = [
  {
    id: "checklist",
    label: "Checklist",
    caption: "Scannable action list",
    icon: ListChecks,
    build: (formData) => `<h2>Quick checklist</h2>
<ul class="BLOG_CHECKLIST">
  <li>Confirm the main goal for ${escapeHtml(getTopic(formData).toLowerCase())}.</li>
  <li>Compare the available options before choosing one workflow.</li>
  <li>Use the related AltFTool utilities to finish the task faster.</li>
</ul>`,
  },
  {
    id: "steps",
    label: "Step-by-step",
    caption: "Process block",
    icon: LayoutList,
    build: (formData) => `<h2>How to use this guide</h2>
<ol class="BLOG_STEPS">
  <li><strong>Start with the outcome.</strong> Decide what you need from ${escapeHtml(getTopic(formData).toLowerCase())}.</li>
  <li><strong>Check the important details.</strong> Review the examples, warnings, and linked resources.</li>
  <li><strong>Take action.</strong> Apply the best option and save the result for later use.</li>
</ol>`,
  },
  {
    id: "pros-cons",
    label: "Pros / cons",
    caption: "Balanced decision box",
    icon: Scale,
    build: (formData) => `<div class="BLOG_PROS_CONS">
  <div>
    <h3>Best for</h3>
    <ul>
      <li>Quick decisions around ${escapeHtml(getTopic(formData).toLowerCase())}.</li>
      <li>Readers who want a simple workflow.</li>
      <li>Comparing practical options without extra setup.</li>
    </ul>
  </div>
  <div>
    <h3>Keep in mind</h3>
    <ul>
      <li>Always check the final result before sharing.</li>
      <li>Use updated sources when details can change.</li>
      <li>Match the tool choice to your actual task.</li>
    </ul>
  </div>
</div>`,
  },
  {
    id: "comparison",
    label: "Comparison table",
    caption: "Option matrix",
    icon: Columns3,
    build: () => `<h2>Quick comparison</h2>
<table class="BLOG_COMPARE">
  <thead>
    <tr><th>Option</th><th>Best use</th><th>What to check</th></tr>
  </thead>
  <tbody>
    <tr><td>Fast method</td><td>Quick one-time tasks</td><td>Accuracy and output quality</td></tr>
    <tr><td>Advanced method</td><td>Repeatable workflows</td><td>Settings, limits, and saved results</td></tr>
  </tbody>
</table>`,
  },
  {
    id: "tip",
    label: "Tip callout",
    caption: "Highlighted advice",
    icon: Lightbulb,
    build: (formData) => `<aside class="BLOG_CALLOUT BLOG_CALLOUT_TIP">
  <strong>Practical tip</strong>
  <p>${escapeHtml(getSummary(formData))}</p>
</aside>`,
  },
  {
    id: "tool-cta",
    label: "Tool CTA",
    caption: "Drive readers to tools",
    icon: Wrench,
    build: (formData) => `<div class="BLOG_TOOL_CTA">
  <div>
    <strong>Need a faster way?</strong>
    <p>Open the related AltFTool microtools and complete this workflow directly in your browser.</p>
  </div>
  <a href="/tools/all?search=${encodeURIComponent(formData.category || formData.heading || "tools")}">Explore related tools</a>
</div>`,
  },
];

export default function BlogContentBlocks({ formData = {}, onInsert }) {
  const handleInsert = (block) => {
    onInsert?.(block.build(formData));
    emitAlert({ type: "success", message: `${block.label} block inserted.` });
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {blockBuilders.map((block) => {
        const Icon = block.icon;
        return (
          <button
            key={block.id}
            type="button"
            onClick={() => handleInsert(block)}
            className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-700">{block.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-500">{block.caption}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
