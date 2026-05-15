import assert from "node:assert/strict";
import test from "node:test";
import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";

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

function collectionDocuments(path) {
  if (path.endsWith("/extensions")) {
    return [
      firestoreDocument(`${path}/extension-one`, {
        name: "Extension One",
        slug: "extension-one",
        chromeUrl: "https://chrome.google.com/webstore/detail/extension-one",
        rating: 5,
      }),
    ];
  }

  if (path.endsWith("/academy")) {
    return [
      firestoreDocument(`${path}/academy-one`, {
        name: "Academy One",
        academyUrl: "https://example.com/academy",
        rating: 4,
      }),
    ];
  }

  if (path.endsWith("/trendingvideos")) {
    return [
      firestoreDocument(`${path}/video-one`, {
        name: "Video One",
        type: "shorts",
        videoUrl: "https://www.youtube.com/shorts/demo",
      }),
      firestoreDocument(`${path}/video-two`, {
        name: "Video Two",
        type: "video",
        videoUrl: "",
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
    return [
      firestoreDocument(`${path}/brand-one`, { name: "Brand One", status: "active", rating: 5 }),
    ];
  }

  return [];
}

function createFirestoreFetchStub({ failPath } = {}) {
  const requests = [];

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

    if (failPath && firestorePath.includes(failPath)) {
      return jsonResponse({ error: { message: "permission-denied" } }, 403);
    }

    if (options.method === "POST" && firestorePath === "projects/altftool:runQuery") {
      return jsonResponse([
        {
          document: firestoreDocument("projects/altftool/blogs/blog-one", {
            heading: "Blog One",
            slug: "blog-one",
            status: "published",
            createdAt: "2026-05-15T00:00:00.000Z",
          }),
        },
      ]);
    }

    if (firestorePath.startsWith("projects/altftool/buySmart/")) {
      const docId = firestorePath.split("/").pop();
      const arrayField = docId === "featurebrand" ? "features" : "banner";

      return jsonResponse(
        firestoreDocument(firestorePath, {
          [arrayField]: [`${docId}-one`, `${docId}-two`],
        }),
      );
    }

    return jsonResponse({
      documents: collectionDocuments(firestorePath),
    });
  }

  return { fetchImpl, requests };
}

const testEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
};

test("Firebase live-data report aggregates Firestore samples without secrets", async () => {
  const { fetchImpl, requests } = createFirestoreFetchStub();
  const report = await createFirebaseLiveDataReport({
    env: testEnv,
    fetchImpl,
    timeoutMs: 1000,
  });

  assert.equal(report.ok, true);
  assert.equal(report.status, "live");
  assert.equal(report.score, 100);
  assert.equal(report.projectId, "test-project");
  assert.equal(report.failures.length, 0);
  assert.equal(report.checks.length, 19);
  assert.equal(report.sections.buySmart.hero.itemCount, 2);
  assert.equal(report.sections.blogs.firstSlug, "blog-one");
  assert.equal(report.sections.extensions.displayableCount, 1);
  assert.equal(report.sections.academy.displayableCount, 1);
  assert.equal(report.sections.trendingVideos.displayableCount, 1);
  assert.equal(report.sections.consumerRating.brands.activeCount, 1);
  assert.equal(requests.length, 13);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE KEY-----/);
});

test("Firebase live-data report isolates one failed section", async () => {
  const { fetchImpl } = createFirestoreFetchStub({ failPath: "/extensions" });
  const report = await createFirebaseLiveDataReport({
    env: testEnv,
    fetchImpl,
    timeoutMs: 1000,
  });

  assert.equal(report.ok, false);
  assert.equal(report.status, "partial");
  assert.ok(report.score >= 60);
  assert.match(report.failures.join("\n"), /Extensions live data/);
  assert.equal(report.sections.extensions.firstPageCount, undefined);
  assert.equal(report.sections.buySmart.hero.itemCount, 2);
  assert.equal(report.sections.consumerRating.brands.activeCount, 1);
});
