import assert from "node:assert/strict";
import test from "node:test";

import {
  NEWS_TITLE_MAX_LENGTH,
  buildNewsArticleTitle,
  clampHeadline,
} from "./headlineTitle.js";

/**
 * Headlines below were read off production on 2026-08-05, not invented: each
 * one was a live item on https://www.altftool.com/news at the time the clamp
 * was fixed. The first two are the ones that shipped a mid-phrase fragment.
 */
const LIVE_HEADLINES = [
  "Buttler breaks T20 runs record in Super Giants win",
  "PSA: Apple’s Private Relay can leak your real IP address",
  "New Mexico sues justice department for ‘stonewalling’ Epstein investigation",
  "Russian disinformation campaign targets French presidential candidate Gabriel Attal",
  "Woman arrested after four men stabbed in London’s Covent Garden",
  "Russia kills 17 in ballistic missile attacks around Kyiv",
  "Zelenskyy calls for more air defences as Russian attack on Kyiv kills at least 17",
];

test("every live headline fits the mobile SERP budget", () => {
  for (const headline of LIVE_HEADLINES) {
    const title = buildNewsArticleTitle(headline);
    assert.ok(
      title.length <= NEWS_TITLE_MAX_LENGTH,
      `${title} is ${title.length} chars, over ${NEWS_TITLE_MAX_LENGTH}`,
    );
  }
});

test("a clamp never ends inside a phrase its own opener started", () => {
  // "…record in Super" and "…Relay can leak" both shipped on production: the
  // last word is ordinary, but it is the only thing inside a phrase opened by
  // the word before it, so the title stops mid-thought.
  assert.equal(
    clampHeadline("Buttler breaks T20 runs record in Super Giants win"),
    "Buttler breaks T20 runs record",
  );
  assert.equal(
    clampHeadline("PSA: Apple’s Private Relay can leak your real IP address"),
    "PSA: Apple’s Private Relay",
  );
});

test("a complete trailing phrase is kept", () => {
  // Regression guard for the peel: "…in ballistic missile attacks" is a filled
  // phrase, not a stranded opener, and must survive untouched.
  assert.equal(
    clampHeadline("Russia kills 17 in ballistic missile attacks around Kyiv"),
    "Russia kills 17 in ballistic missile attacks",
  );
  assert.equal(
    clampHeadline("Woman arrested after four men stabbed in London’s Covent Garden"),
    "Woman arrested after four men stabbed",
  );
});

test("the pair peel stops at the three-word floor", () => {
  // The fallback here is "Vote on reform": the second-to-last word opens a
  // phrase, so without the floor the peel would strip the pair and leave the
  // single word "Vote". Three words is the shortest a clamp may end on.
  assert.equal(
    clampHeadline("Vote on reform passes in senate today", 15),
    "Vote on reform",
  );
});

test("a headline already inside budget is returned unchanged", () => {
  assert.equal(clampHeadline("Apple ships a fix"), "Apple ships a fix");
});
