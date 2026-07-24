import assert from "node:assert/strict";
import test from "node:test";

import {
  PRIVATE_CHAT_LIMITS,
  buildPrivateChatCountsReport,
  buildPrivateDocumentIndex,
  chunkSectionText,
  retrievePrivateExcerpts,
  tokenizeForRetrieval,
  validatePrivateDocumentSelection,
} from "./privateRetrieval.mjs";

test("validates supported bounded document selections", () => {
  assert.equal(
    validatePrivateDocumentSelection([
      { name: "notes.md", size: 100 },
      { name: "guide.PDF", size: 200 },
    ]).ok,
    true,
  );
  assert.equal(
    validatePrivateDocumentSelection([{ name: "archive.zip", size: 10 }]).ok,
    false,
  );
  assert.equal(
    validatePrivateDocumentSelection([
      { name: "large.txt", size: PRIVATE_CHAT_LIMITS.fileBytes + 1 },
    ]).ok,
    false,
  );
  assert.equal(validatePrivateDocumentSelection([]).ok, false);
});

test("tokenizes Unicode text and removes common question filler", () => {
  assert.deepEqual(tokenizeForRetrieval("What is गोपनीयता policy 2026?"), [
    "गोपनीयता",
    "policy",
    "2026",
  ]);
  assert.deepEqual(
    tokenizeForRetrieval("what is it", { keepStopWords: true }),
    ["what", "is", "it"],
  );
});

test("chunks long sections with bounded overlap and complete tail", () => {
  const text = Array.from(
    { length: 400 },
    (_, index) => `Sentence ${index} has useful material.`,
  ).join(" ");
  const chunks = chunkSectionText(text);
  assert.ok(chunks.length > 3);
  assert.ok(
    chunks.every(
      ({ text: chunk }) =>
        chunk.length > 0 && chunk.length <= PRIVATE_CHAT_LIMITS.chunkCharacters,
    ),
  );
  assert.ok(chunks.at(-1).text.includes("Sentence 399"));
  assert.ok(chunks[1].start < chunks[0].end);
});

test("builds a bounded local index with source labels", () => {
  const index = buildPrivateDocumentIndex([
    {
      label: "Policy.pdf",
      format: "PDF",
      sections: [
        { label: "Page 1", text: "Retention is thirty days." },
        {
          label: "Page 2",
          text: "Deletion happens after the retention period.",
        },
      ],
    },
  ]);
  assert.equal(index.documents.length, 1);
  assert.equal(index.chunks.length, 2);
  assert.equal(index.chunks[0].sectionLabel, "Page 1");
});

test("retrieval ranks the specifically matching source excerpt first", () => {
  const index = buildPrivateDocumentIndex([
    {
      label: "Handbook",
      format: "TXT",
      sections: [
        {
          label: "Travel",
          text: "Employees submit travel expenses within fourteen days.",
        },
        {
          label: "Security",
          text: "Security incidents must be reported within one hour.",
        },
      ],
    },
  ]);
  const response = retrievePrivateExcerpts(
    index,
    "When are security incidents reported?",
  );
  assert.equal(response.ok, true);
  assert.equal(response.results[0].sectionLabel, "Security");
  assert.ok(response.results[0].excerpt.includes("one hour"));
});

test("retrieval returns excerpts rather than a fabricated answer", () => {
  const index = buildPrivateDocumentIndex([
    {
      label: "Notes",
      format: "TXT",
      sections: [{ label: "Only", text: "Apples are stored in room seven." }],
    },
  ]);
  const response = retrievePrivateExcerpts(index, "banana launch schedule");
  assert.equal(response.results.length, 0);
  assert.ok(response.message.includes("No grounded excerpt"));
  assert.ok(response.scope.includes("no generated answer"));
});

test("question bounds and stop-word fallback are deterministic", () => {
  const index = buildPrivateDocumentIndex([
    {
      label: "Tiny",
      format: "TXT",
      sections: [{ label: "S", text: "This is it." }],
    },
  ]);
  assert.equal(retrievePrivateExcerpts(index, "").ok, false);
  assert.equal(
    retrievePrivateExcerpts(
      index,
      "x".repeat(PRIVATE_CHAT_LIMITS.queryCharacters + 1),
    ).ok,
    false,
  );
  assert.equal(retrievePrivateExcerpts(index, "what is it").ok, true);
});

test("rejects excessive extracted characters and section counts", () => {
  assert.throws(
    () =>
      buildPrivateDocumentIndex([
        {
          label: "Huge",
          sections: [
            {
              label: "S",
              text: "x".repeat(PRIVATE_CHAT_LIMITS.documentCharacters + 1),
            },
          ],
        },
      ]),
    /250,000/u,
  );
  assert.throws(
    () =>
      buildPrivateDocumentIndex([
        {
          label: "Many",
          sections: Array.from(
            { length: PRIVATE_CHAT_LIMITS.sections + 1 },
            (_, index) => ({ label: `${index}`, text: "text" }),
          ),
        },
      ]),
    /sections/u,
  );
});

test("counts-only report excludes names, text, excerpts, and questions", () => {
  const index = buildPrivateDocumentIndex([
    {
      label: "Secret Client Falcon.pdf",
      format: "PDF",
      sections: [
        { label: "Page 1", text: "Acquisition price is confidential." },
      ],
    },
  ]);
  const response = retrievePrivateExcerpts(index, "acquisition price");
  const report = buildPrivateChatCountsReport(
    {
      index,
      history: [{ question: "Private acquisition?", response }],
    },
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.documentTextIncluded, false);
  assert.equal(report.scope.questionsIncluded, false);
  assert.equal(report.scope.cloudModelUsed, false);
  assert.ok(!serialized.includes("Falcon"));
  assert.ok(!serialized.includes("acquisition"));
  assert.ok(!serialized.includes("confidential"));
});
