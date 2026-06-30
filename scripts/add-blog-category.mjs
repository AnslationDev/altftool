#!/usr/bin/env node
/**
 * Add a blog/ads category to Firestore so it becomes selectable in BOTH the
 * Ads module (dynamic blog placements: blog_list / blog_detail) and the
 * Add Blog section. Categories live in `projects/altftool/categories` as docs
 * with a `name` field (see altftoolwebadmin/src/config/placements.js).
 *
 * Why this is needed: the "Tools" blog category is rendered on the site
 * (editorial posts) but was never registered as a category document, so it
 * does not appear in the admin category pickers. This script registers it.
 *
 * Usage (uses the same Admin SDK credentials as the admin app):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json node scripts/add-blog-category.mjs "Tools"
 *
 * Idempotent: if a category with the same name already exists it is skipped.
 */

import { getAdminDb } from "../altftoolwebadmin/src/lib/firebaseAdmin.js";

const PROJECT_ID = "altftool";

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const name = (process.argv[2] || "Tools").trim();
  if (!name) {
    console.error("Provide a category name, e.g. node scripts/add-blog-category.mjs \"Tools\"");
    process.exit(1);
  }

  const db = getAdminDb();
  const col = db.collection("projects").doc(PROJECT_ID).collection("categories");

  // Skip if a category with the same (case-insensitive) name already exists.
  const existing = await col.get();
  const dup = existing.docs.find(
    (d) => String(d.data()?.name || "").trim().toLowerCase() === name.toLowerCase(),
  );
  if (dup) {
    console.log(`Category "${name}" already exists (doc id: ${dup.id}). Nothing to do.`);
    return;
  }

  const slug = slugify(name);
  const ref = await col.add({
    name,
    slug,
    createdAt: new Date().toISOString(),
    source: "add-blog-category-script",
  });

  console.log(`Created category "${name}" (slug: ${slug}, doc id: ${ref.id}).`);
  console.log("It will now appear in the Ads module blog placements and the Add Blog section.");
}

main().catch((err) => {
  console.error("Failed to add category:", err?.message || err);
  process.exit(1);
});
