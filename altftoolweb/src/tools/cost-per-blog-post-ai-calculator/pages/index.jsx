"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "posts", label: "Posts per month", placeholder: "20", inputMode: "decimal" },
  { key: "aiCost", label: "Monthly AI/tool cost", placeholder: "99", inputMode: "decimal" },
  { key: "editMinutes", label: "Editing minutes/post", placeholder: "45", inputMode: "decimal" },
  { key: "hourlyRate", label: "Editor hourly rate", placeholder: "25", inputMode: "decimal" },
];

const defaults = {
  posts: "20",
  aiCost: "99",
  editMinutes: "45",
  hourlyRate: "25",
};

function money(value) {
  return `$${value.toFixed(2)}`;
}

function buildOutput(values) {
  const posts = Math.max(1, Number(values.posts) || 0);
  const aiCost = Math.max(0, Number(values.aiCost) || 0);
  const editMinutes = Math.max(0, Number(values.editMinutes) || 0);
  const hourlyRate = Math.max(0, Number(values.hourlyRate) || 0);
  const editing = (posts * editMinutes * hourlyRate) / 60;
  const total = aiCost + editing;

  return [
    "AI blog post cost estimate",
    `Posts/month: ${posts}`,
    `AI/tool cost: ${money(aiCost)}`,
    `Editing cost: ${money(editing)}`,
    `Total monthly content cost: ${money(total)}`,
    `Cost per post: ${money(total / posts)}`,
    "",
    "Quality note: budget time for fact-checking, internal links, screenshots, and SEO title/meta review.",
  ].join("\n");
}

export default function CostPerBlogPostAiCalculatorPage() {
  return (
    <QuickToolPage
      title="Cost Per Blog Post AI Calculator"
      description="Estimate AI tool plus human editing cost per blog post."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Blog cost breakdown"
    />
  );
}
