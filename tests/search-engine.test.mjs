import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeSearchResults,
  performSmartSearch,
} from "../altftoolweb/src/app/search-eng/lib/searchEngine.js";

test("search cache refreshes when progressive Firebase data replaces the dataset", () => {
  const query = "iPhone 18";
  const initialDataset = [];
  const firebaseDataset = [
    {
      id: "managed__iphone-18",
      title: "iPhone 18",
      url: "https://example.com/iphone-18",
      description: "A managed search directory result.",
      category: "Blog",
      tags: ["iphone", "apple"],
    },
  ];

  assert.equal(performSmartSearch(initialDataset, query).metadata.total, 0);

  const refreshed = performSmartSearch(firebaseDataset, query);
  assert.equal(refreshed.metadata.total, 1);
  assert.equal(refreshed.items[0].title, "iPhone 18");
});

test("managed and native results lead web results without duplicate destinations", () => {
  const local = [
    { id: "tool__calculator", title: "Calculator", url: "/tools/all/calculator" },
    { id: "managed__iphone", title: "iPhone 18", url: "https://example.com/iphone" },
  ];
  const web = [
    { id: "web-duplicate", title: "iPhone", url: "https://example.com/iphone" },
    { id: "web-unique", title: "Apple News", url: "https://example.com/news" },
  ];

  const merged = mergeSearchResults(local, web);

  assert.deepEqual(
    merged.map((item) => item.id),
    ["managed__iphone", "tool__calculator", "web-unique"],
  );
});

test("numeric search tokens do not partially match larger numbers", () => {
  const dataset = [
    {
      id: "periodic-table",
      title: "Periodic Table Explorer",
      url: "/tools/all/periodic-table-explorer",
      description: "Explore all 118 elements.",
      category: "Science",
      tags: ["chemistry"],
    },
  ];

  assert.equal(performSmartSearch(dataset, "iPhone 18").metadata.total, 0);
});
