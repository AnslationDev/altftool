// Node test runner: `node --test src/platform/seo/citationFormats.test.mjs`
//
// These lock the two things a citation block can get wrong in a way nobody
// notices: the date, and the attribution. A page with no data date must not
// acquire one, and the document a figure was originally read from must survive
// into the reference.
import { test } from "node:test";
import assert from "node:assert/strict";

import { bibtexKey, buildCitations, escapeLatex, formatCitationDay } from "./citationFormats.js";

/** The real /exam-photo/ssc-cgl record, as the page passes it. */
const EXAM = {
  title: "SSC CGL photo and signature size",
  url: "https://www.altftool.com/exam-photo/ssc-cgl",
  asOf: "2026-07-29",
  asOfLabel: "Notification read on",
  sources: [
    {
      title:
        "SSC CGL 2026 Notice (F. No. HQ-C11018/1/2026-C-1), paras 9.3 to 9.6 and Annexure-IV",
      urls: [
        "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf",
      ],
      issued: "2026-05-21",
    },
  ],
};

test("APA and MLA carry the page's own data date, not a build date", () => {
  const { apa, mla } = buildCitations(EXAM);
  assert.equal(
    apa,
    "AltFTool. (2026, July 29). SSC CGL photo and signature size. https://www.altftool.com/exam-photo/ssc-cgl",
  );
  assert.equal(
    mla,
    '"SSC CGL photo and signature size." AltFTool, 29 July 2026, www.altftool.com/exam-photo/ssc-cgl.',
  );
});

test("BibTeX names the notification, its issue date and its URL", () => {
  const { bibtex } = buildCitations(EXAM);
  assert.match(bibtex, /^@misc\{altftool-exam-photo-ssc-cgl,$/m);
  assert.match(bibtex, /author\s+= \{\{AltFTool\}\}/);
  assert.match(bibtex, /year\s+= \{2026\}/);
  assert.match(bibtex, /month\s+= \{jul\}/);
  assert.ok(bibtex.includes("Notification read on 2026-07-29."));
  assert.ok(bibtex.includes("(issued 2026-05-21)"));
  assert.ok(bibtex.includes("\\url{https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf}"));
});

test("a record with no data date gets no date, in any format", () => {
  const { apa, mla, bibtex } = buildCitations({
    title: "A page with no data date",
    url: "https://www.altftool.com/example",
  });
  assert.equal(
    apa,
    "AltFTool. (n.d.). A page with no data date. https://www.altftool.com/example",
  );
  assert.equal(mla, '"A page with no data date." AltFTool, www.altftool.com/example.');
  assert.ok(!/year|month|note/.test(bibtex));
  // The guard that matters: no digits anywhere except the ones in the URL.
  assert.ok(!/\d/.test(bibtex.replace(/https?:\/\/\S+/g, "")));
});

test("an unparseable date is treated as absent rather than repaired", () => {
  for (const asOf of ["2026-07", "29-07-2026", "2026-13-01", "today", null, undefined]) {
    assert.ok(buildCitations({ title: "T", url: "https://x.test/p", asOf }).apa.includes("(n.d.)"));
  }
  assert.equal(formatCitationDay("2026-13-01"), "");
});

test("a source read earlier than the page date says so; one read the same day does not", () => {
  const base = {
    title: "Background Remover: what you'd pay elsewhere",
    url: "https://www.altftool.com/deals/bg-remover",
    asOf: "2026-07-28",
    asOfLabel: "Prices checked",
  };
  const { bibtex } = buildCitations({
    ...base,
    sources: [
      { title: "remove.bg", urls: ["https://www.remove.bg/pricing"], checked: "2026-07-25" },
      {
        title: "Adobe Photoshop",
        urls: ["https://www.adobe.com/products/photoshop/plans.html"],
        checked: "2026-07-28",
      },
    ],
  });
  assert.ok(bibtex.includes("remove.bg (read 2026-07-25)"));
  assert.ok(!bibtex.includes("Adobe Photoshop (read"));
});

test("LaTeX specials in a document title cannot break the .bib", () => {
  assert.equal(
    escapeLatex("Instructions for Uploading the Photo & Signature"),
    "Instructions for Uploading the Photo \\& Signature",
  );
  assert.equal(escapeLatex("100% of {x}_y"), "100\\% of \\{x\\}\\_y");
});

test("BibTeX keys come from the canonical path, so they cannot collide", () => {
  assert.equal(bibtexKey("https://www.altftool.com/deals/bg-remover"), "altftool-deals-bg-remover");
  assert.equal(
    bibtexKey("https://www.altftool.com/alternatives/ilovepdf?utm=x"),
    "altftool-alternatives-ilovepdf",
  );
  assert.equal(bibtexKey("https://www.altftool.com/"), "altftool-page");
});
