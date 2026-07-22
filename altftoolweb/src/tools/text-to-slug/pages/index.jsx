"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];

const transform = (input) => {
  if (!input?.trim()) return "";

  return input
    .trim()

    // Normalize Unicode characters
    .normalize("NFKD")

    // Remove accent marks
    .replace(/[\u0300-\u036f]/g, "")

    // Common replacements
    .replace(/&/g, " and ")
    .replace(/@/g, " at ")
    .replace(/\+/g, " plus ")

    // Remove apostrophes
    .replace(/['’"]/g, "")

    // Convert all non-alphanumeric characters to hyphens
    .replace(/[^a-zA-Z0-9]+/g, "-")

    // Remove duplicate hyphens
    .replace(/-+/g, "-")

    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, "")

    // Lowercase
    .toLowerCase();
};

export default function Page() {
  return (
    <TextTool
      title="Text to Slug"
      description="Convert titles, headings, filenames, or any text into clean, SEO-friendly URL slugs."
      sample={`10 Best Tools for 2024!
Café & Restaurant Guide
React.js @ Scale`}
      options={options}
      transform={transform}
    />
  );
}