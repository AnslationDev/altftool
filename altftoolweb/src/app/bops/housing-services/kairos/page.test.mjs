import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (name) => readFile(new URL(name, import.meta.url), "utf8");

test("Kairos remains a truthful, non-operational preview without PII collection", async () => {
  const [page, estimateForm, newsletterForm, layout] = await Promise.all([
    readSource("./page.jsx"),
    readSource("./EstimateForm.jsx"),
    readSource("./NewsletterForm.jsx"),
    readSource("./termites-pest-control/layout.jsx"),
  ]);
  const combined = [page, estimateForm, newsletterForm, layout].join("\n");

  assert.match(page, /fictional, non-operational|Fictional UI Preview/i);
  assert.match(estimateForm, /Demo Form Disabled/);
  assert.match(newsletterForm, /Signup disabled/);
  assert.match(layout, /noindex:\s*true/);
  assert.doesNotMatch(combined, /kairos_leads|320\+|certified and licensed|Licensed & Insured/i);
  assert.doesNotMatch(combined, /localStorage|type=["'](?:email|tel)["']|<form\b/i);
  assert.doesNotMatch(combined, /subscribed successfully|request (?:an )?inspection|call now/i);
});
