import assert from "node:assert/strict";
import test from "node:test";

import { extractArticleHtml, isAllowedPublisherUrl } from "./articleExtract.js";

test("article extraction accepts only configured HTTPS publisher domains", () => {
  for (const url of [
    "https://economictimes.indiatimes.com/markets/story.cms",
    "https://www.moneycontrol.com/news/story.html",
    "https://finance.yahoo.com/news/story.html",
    "https://www.cnbc.com/2026/08/03/story.html",
  ]) {
    assert.equal(isAllowedPublisherUrl(url), true, url);
  }

  for (const url of [
    "http://www.cnbc.com/story.html",
    "https://cnbc.com.evil.example/story.html",
    "https://127.0.0.1/private",
    "https://169.254.169.254/latest/meta-data",
    "https://user:pass@finance.yahoo.com/story.html",
    "https://www.moneycontrol.com:8443/story.html",
    "not-a-url",
  ]) {
    assert.equal(isAllowedPublisherUrl(url), false, url);
  }
});

test("article extraction refuses an unapproved URL without making a request", async () => {
  assert.equal(await extractArticleHtml("https://127.0.0.1/private"), null);
  assert.equal(await extractArticleHtml("http://www.cnbc.com/story.html"), null);
});
