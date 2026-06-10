import assert from "node:assert/strict";
import test from "node:test";
import { createFirebaseDataIntegrityReport } from "@altftool/core/firebaseDataIntegrity";
import { renderFirebaseDataIntegrityMarkdown } from "../scripts/check-firebase-data-integrity.mjs";

function firestoreValue(value) {
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(firestoreValue),
      },
    };
  }

  if (value && typeof value === "object") {
    return {
      mapValue: {
        fields: firestoreFields(value),
      },
    };
  }

  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value === null) return { nullValue: null };
  return { stringValue: String(value) };
}

function firestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, firestoreValue(value)]),
  );
}

function firestoreDocument(path, data) {
  return {
    name: `projects/test-project/databases/(default)/documents/${path}`,
    fields: firestoreFields(data),
  };
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function healthyCollectionDocuments(path) {
  if (path.endsWith("/extensions")) {
    return [
      firestoreDocument(`${path}/extension-one`, {
        name: "Extension One",
        slug: "extension-one",
        image: "/extensions/one.png",
        chromeUrl: "https://chrome.google.com/webstore/detail/extension-one",
        status: "active",
      }),
    ];
  }

  if (path.endsWith("/academy")) {
    return [
      firestoreDocument(`${path}/academy-one`, {
        name: "Academy One",
        image: "/academy/one.jpg",
        academyUrl: "https://example.com/academy",
        status: "active",
      }),
    ];
  }

  if (path.endsWith("/trendingvideos")) {
    return [
      firestoreDocument(`${path}/video-one`, {
        name: "Video One",
        thumbnail: "/video/one.jpg",
        type: "shorts",
        videoUrl: "https://www.youtube.com/shorts/demo",
        status: "active",
      }),
    ];
  }

  if (path.endsWith("/consumerrating/data/categories")) {
    return [firestoreDocument(`${path}/category-one`, { name: "Food", status: "active" })];
  }

  if (path.endsWith("/consumerrating/data/subcategories")) {
    return [firestoreDocument(`${path}/subcategory-one`, { name: "Coffee", status: "active" })];
  }

  if (path.endsWith("/consumerrating/data/brands")) {
    return [firestoreDocument(`${path}/brand-one`, { name: "Brand One", status: "active" })];
  }

  return [];
}

function brokenCollectionDocuments(path) {
  if (path.endsWith("/extensions")) {
    return [
      firestoreDocument(`${path}/extension-one`, {
        name: "",
        slug: "same-slug",
        chromeUrl: "chrome-store/not-http",
      }),
      firestoreDocument(`${path}/extension-two`, {
        name: "Extension Two",
        slug: "same-slug",
      }),
    ];
  }

  if (path.endsWith("/academy")) {
    return [firestoreDocument(`${path}/academy-one`, { name: "Academy One" })];
  }

  if (path.endsWith("/trendingvideos")) {
    return [firestoreDocument(`${path}/video-one`, { name: "Video One", videoUrl: "" })];
  }

  if (path.includes("/consumerrating/data/")) {
    return [firestoreDocument(`${path}/missing-name`, { status: "weird" })];
  }

  return [];
}

function createFirestoreFetchStub({ broken = false } = {}) {
  const requests = [];
  const collections = broken ? brokenCollectionDocuments : healthyCollectionDocuments;

  async function fetchImpl(url, options = {}) {
    requests.push({
      url,
      method: options.method || "GET",
      cache: options.cache,
      hasSignal: Boolean(options.signal),
    });

    assert.equal(options.cache, "no-store");
    assert.ok(options.signal);

    const parsedUrl = new URL(url);
    const firestorePath = parsedUrl.pathname.split("/documents/")[1];
    assert.equal(parsedUrl.searchParams.get("key"), "test-key");

    if (options.method === "POST" && firestorePath === "projects/altftool:runQuery") {
      const blogDocs = broken
        ? [
            firestoreDocument("projects/altftool/blogs/blog-one", {
              heading: "Short",
              slug: "same-blog",
              status: "published",
              content: "Thin",
            }),
            firestoreDocument("projects/altftool/blogs/blog-two", {
              heading: "Second Broken Blog",
              slug: "same-blog",
              status: "published",
              content: "Thin",
            }),
          ]
        : [
            firestoreDocument("projects/altftool/blogs/blog-one", {
              heading: "Useful Blog Heading",
              slug: "useful-blog-heading",
              status: "published",
              metaDescription: "This is a practical and descriptive meta summary for a healthy sampled blog.",
              content: "A".repeat(180),
            }),
          ];

      return jsonResponse(blogDocs.map((document) => ({ document })));
    }

    if (firestorePath.startsWith("projects/altftool/buySmart/")) {
      const docId = firestorePath.split("/").pop();
      const arrayField = docId === "featurebrand" ? "features" : "banner";

      return jsonResponse(
        firestoreDocument(firestorePath, {
          [arrayField]: broken ? [] : [{ name: `${docId} item`, url: "https://example.com", image: "/banner.jpg" }],
        }),
      );
    }

    return jsonResponse({
      documents: collections(firestorePath),
    });
  }

  return { fetchImpl, requests };
}

const testEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
};

test("Firebase data integrity report validates healthy sampled content without secrets", async () => {
  const { fetchImpl, requests } = createFirestoreFetchStub();
  const report = await createFirebaseDataIntegrityReport({
    env: testEnv,
    fetchImpl,
    sampleLimit: 5,
    timeoutMs: 1000,
  });
  const markdown = renderFirebaseDataIntegrityMarkdown(report);

  assert.equal(report.ok, true);
  assert.equal(report.status, "clean");
  assert.equal(report.score, 100);
  assert.equal(report.totals.failures, 0);
  assert.equal(report.sections.buySmart.hero.itemCount, 1);
  assert.equal(report.sections.blogs.validSlugs, 1);
  assert.equal(requests.length, 13);
  assert.match(markdown, /Firebase Data Integrity Report/);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE KEY-----/);
  assert.doesNotMatch(markdown, /test-key/);
});

test("Firebase data integrity report catches duplicates, empty arrays, and broken public fields", async () => {
  const { fetchImpl } = createFirestoreFetchStub({ broken: true });
  const report = await createFirebaseDataIntegrityReport({
    env: testEnv,
    fetchImpl,
    sampleLimit: 5,
    timeoutMs: 1000,
  });

  assert.equal(report.ok, false);
  assert.ok(report.score < 100);
  assert.ok(report.failures.some((issue) => /duplicate slug/.test(issue.message)));
  assert.ok(report.failures.some((issue) => /BuySmart hero/.test(issue.message)));
  assert.ok(report.warnings.some((issue) => /missing a title or video URL/.test(issue.message)));
  assert.ok(report.warnings.some((issue) => /thin sampled article content/.test(issue.message)));
  assert.ok(report.warnings.some((issue) => /unknown status/.test(issue.message)));
});
