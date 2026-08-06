import assert from "node:assert/strict";
import { register } from "node:module";
import { after, test } from "node:test";

register(
  new URL("../../bazaar/data/test-helpers/aliasLoader.mjs", import.meta.url),
);
register(new URL("./test-helpers/jsonLoader.mjs", import.meta.url));

const { fetchFirebaseBlogBySlug } = await import("./firebaseBlogs.js");

const originalFetch = globalThis.fetch;
const firestoreParent =
  "projects/altftool-bca36/databases/(default)/documents/projects/altftool";

after(() => {
  globalThis.fetch = originalFetch;
});

function firestoreValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  return { stringValue: String(value) };
}

function firestoreDocument(id, fields) {
  return {
    name: `${firestoreParent}/blogs/${id}`,
    fields: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        firestoreValue(value),
      ]),
    ),
  };
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function parseRequest(init) {
  return {
    query: JSON.parse(init.body).structuredQuery,
    revalidate: init.next?.revalidate,
  };
}

function filterFieldPaths(where) {
  const filters = where?.compositeFilter?.filters || [where];
  return filters
    .map((filter) => filter?.fieldFilter?.field?.fieldPath)
    .filter(Boolean);
}

test("keeps the stored-slug lookup as the cached fast path", async () => {
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    calls.push(parseRequest(init));
    return jsonResponse([
      {
        document: firestoreDocument("storedSlugDocument", {
          heading: "Stored Slug Article",
          slug: "stored-slug-article",
          status: "published",
          content: "The complete stored-slug article body.",
        }),
      },
    ]);
  };

  const first = await fetchFirebaseBlogBySlug("stored-slug-article");
  const second = await fetchFirebaseBlogBySlug("stored-slug-article");

  assert.match(first?.content || "", /complete stored-slug article body/);
  assert.equal(second?.id, "storedSlugDocument");
  assert.equal(calls.length, 1, "positive detail result should use memory cache");
  assert.deepEqual(filterFieldPaths(calls[0].query.where).sort(), [
    "slug",
    "status",
  ]);
  assert.equal(calls[0].query.limit, 1);
  assert.equal(calls[0].revalidate, 30);
});

test("recovers deep legacy slugs through one bounded metadata index", async () => {
  const legacyArticles = [
    {
      position: 412,
      id: "o1iisd6s4X0br8Mef56X",
      heading: "Easy Photo Editing Tips for Beginners",
      slug: "easy-photo-editing-tips-for-beginners",
    },
    {
      position: 415,
      id: "Jzw4hEs3c85mc3VlmZ7q",
      heading:
        "AI-Powered Software Development: Benefits, Use Cases & Guide",
      slug: "ai-powered-software-development-benefits-use-cases-guide",
    },
    {
      position: 419,
      id: "FenXIevEiQSsS17ZFgDQ",
      heading: "Top Creative Tools Every Content Creator Needs in 2026",
      slug: "top-creative-tools-every-content-creator-needs-in-2026",
      // Models a stale cached-empty exact query after Admin backfilled slug.
      storedSlug: true,
    },
  ];
  const legacyByPosition = new Map(
    legacyArticles.map((article) => [article.position, article]),
  );
  const legacyById = new Map(
    legacyArticles.map((article) => [article.id, article]),
  );
  const collisionHeading = "One Legacy Collision";
  const collisionSlug = "one-legacy-collision";
  const totalPublished = 448;
  const calls = [];

  globalThis.fetch = async (_url, init) => {
    const request = parseRequest(init);
    calls.push(request);
    const fields = filterFieldPaths(request.query.where);

    if (fields.includes("__name__")) {
      const filters = request.query.where.compositeFilter.filters;
      const referenceValue = filters.find(
        (filter) =>
          filter?.fieldFilter?.field?.fieldPath === "__name__",
      )?.fieldFilter?.value?.referenceValue;
      const id = referenceValue?.split("/").pop();
      const article = legacyById.get(id);
      return jsonResponse(
        article
          ? [
              {
                document: firestoreDocument(article.id, {
                  heading: article.heading,
                  ...(article.storedSlug ? { slug: article.slug } : {}),
                  status: "published",
                  category: "Tools",
                  content: `Full body for ${article.slug}`,
                }),
              },
            ]
          : [],
      );
    }

    if (fields.includes("slug")) {
      // These old documents are published but have no stored slug field, so
      // the normal equality lookup is correctly empty.
      return jsonResponse([]);
    }

    const offset = request.query.offset || 0;
    const limit = request.query.limit;
    const length = Math.max(
      0,
      Math.min(limit, totalPublished - offset),
    );
    const rows = Array.from({ length }, (_, pageIndex) => {
      const position = offset + pageIndex;
      const legacy = legacyByPosition.get(position);
      if (legacy) {
        return {
          document: firestoreDocument(legacy.id, {
            heading: legacy.heading,
            ...(legacy.storedSlug ? { slug: legacy.slug } : {}),
          }),
        };
      }
      if (position === 420 || position === 421) {
        return {
          document: firestoreDocument(`collisionDocument${position}`, {
            heading: collisionHeading,
          }),
        };
      }
      return {
        document: firestoreDocument(`publishedDocument${position}`, {
          heading: `Published Article ${position}`,
          slug: `published-article-${position}`,
        }),
      };
    });
    return jsonResponse(rows);
  };

  for (const article of legacyArticles) {
    const blog = await fetchFirebaseBlogBySlug(article.slug);
    assert.equal(blog?.id, article.id);
    assert.equal(blog?.slug, article.slug);
    assert.match(blog?.content || "", new RegExp(`Full body for ${article.slug}`));
  }

  const scanCalls = calls.filter(
    ({ query }) =>
      !filterFieldPaths(query.where).includes("slug") &&
      !filterFieldPaths(query.where).includes("__name__"),
  );
  assert.deepEqual(
    scanCalls.map(({ query }) => query.offset || 0),
    [0, 100, 200, 300, 400],
    "the bounded scan must reach legacy documents after offset 400",
  );
  assert.ok(scanCalls.every(({ query }) => query.limit === 100));
  assert.ok(
    scanCalls.every(({ query }) => {
      const selected = query.select.fields.map(({ fieldPath }) => fieldPath);
      return (
        selected.join(",") === "heading,title,slug" &&
        !selected.includes("content") &&
        !selected.includes("body") &&
        filterFieldPaths(query.where).join(",") === "status"
      );
    }),
    "identity scan must select metadata from published documents only",
  );
  assert.ok(scanCalls.every(({ revalidate }) => revalidate === 300));

  const detailCalls = calls.filter(({ query }) =>
    filterFieldPaths(query.where).includes("__name__"),
  );
  assert.equal(detailCalls.length, 3);
  assert.ok(
    detailCalls.every(
      ({ query, revalidate }) =>
        query.limit === 1 &&
        filterFieldPaths(query.where).includes("status") &&
        revalidate === 30,
    ),
    "detail recovery must re-check published status and use short cache TTL",
  );

  const afterRecoveryCalls = calls.length;
  for (const article of legacyArticles) {
    assert.equal(
      (await fetchFirebaseBlogBySlug(article.slug))?.id,
      article.id,
    );
  }
  assert.equal(
    calls.length,
    afterRecoveryCalls,
    "recovered details should use the normal positive cache",
  );

  assert.equal(await fetchFirebaseBlogBySlug(collisionSlug), null);
  const afterCollisionMiss = calls.length;
  assert.equal(await fetchFirebaseBlogBySlug(collisionSlug), null);
  assert.equal(
    calls.length,
    afterCollisionMiss,
    "ambiguous derived slugs should fail closed and negative-cache",
  );

  assert.equal(await fetchFirebaseBlogBySlug("missing-legacy-article"), null);
  const afterUnknownMiss = calls.length;
  assert.equal(await fetchFirebaseBlogBySlug("missing-legacy-article"), null);
  assert.equal(
    calls.length,
    afterUnknownMiss,
    "unknown canonical slugs should not repeat the shared scan",
  );

  assert.equal(await fetchFirebaseBlogBySlug("../../private-draft"), null);
  const afterUnsafeMiss = calls.length;
  assert.equal(await fetchFirebaseBlogBySlug("../../private-draft"), null);
  assert.equal(
    calls.length,
    afterUnsafeMiss,
    "non-canonical route input must never trigger the legacy scan",
  );

  assert.equal(
    calls.filter(
      ({ query }) =>
        !filterFieldPaths(query.where).includes("slug") &&
        !filterFieldPaths(query.where).includes("__name__"),
    ).length,
    5,
    "all misses must share one five-page legacy index",
  );
});
