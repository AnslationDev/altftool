import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPreviewBlogModel,
  sanitizeBlogPreviewHtml,
} from "../altftoolwebadmin/src/projects/altftool/modules/blogs/components/blogPreviewUtils.js";
import {
  getWordCount,
  normalizeBlogExportRow,
  rowsToCsv,
} from "../altftoolwebadmin/src/projects/altftool/modules/blogs/components/blogExportUtils.js";

test("sanitizeBlogPreviewHtml removes executable preview content while preserving formatting", () => {
  const html = sanitizeBlogPreviewHtml(`
    <h2 onclick="alert(1)">Title</h2>
    <p><strong>Safe</strong> copy</p>
    <script>alert("bad")</script>
    <a href="javascript:alert(1)">bad link</a>
  `);

  assert.match(html, /<strong>Safe<\/strong>/);
  assert.doesNotMatch(html, /script/i);
  assert.doesNotMatch(html, /onclick/i);
  assert.doesNotMatch(html, /javascript:/i);
});

test("buildPreviewBlogModel creates a WYSIWYG preview model from unsaved form state", () => {
  const model = buildPreviewBlogModel({
    formData: {
      author: "Editor",
      category: "Tools",
      description: "<p>Unsaved content</p>",
      heading: "Draft Preview Title",
      tags: "productivity, writing",
    },
    imageAlt: "Preview image",
    imagePreview: "blob:http://local/image",
  });

  assert.equal(model.heading, "Draft Preview Title");
  assert.equal(model.status, "preview");
  assert.deepEqual(model.tags, ["productivity", "writing"]);
  assert.match(model.description, /Unsaved content/);
});

test("blog export rows include required CSV fields and Excel-compatible output", () => {
  const row = normalizeBlogExportRow({
    id: "blog-1",
    heading: "Export Me",
    slug: "export-me",
    status: "published",
    description: "<p>Hello export world</p>",
  });
  const csv = rowsToCsv([row]);

  assert.equal(getWordCount("<p>Hello export world</p>"), 3);
  assert.equal(row.title, "Export Me");
  assert.equal(row.word_count, 3);
  assert.ok(csv.charCodeAt(0) === 0xfeff);
  assert.match(csv, /id,title,slug,author,category,status,created_at,updated_at,published_at,word_count,content_html/);
  assert.match(csv, /"blog-1","Export Me","export-me"/);
});
