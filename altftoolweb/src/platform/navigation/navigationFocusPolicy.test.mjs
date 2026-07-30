import assert from "node:assert/strict";
import test from "node:test";

import {
  isVisibleFocusable,
  shouldRestoreDesktopMenuFocus,
} from "./navigationFocusPolicy.js";

test("Escape refocuses only when focus is inside the open menu", () => {
  const option = {};
  const trigger = {
    parentElement: {
      contains: (element) => element === trigger || element === option,
    },
  };

  assert.equal(shouldRestoreDesktopMenuFocus(trigger, option), true);
  assert.equal(shouldRestoreDesktopMenuFocus(trigger, trigger), false);
  assert.equal(shouldRestoreDesktopMenuFocus(trigger, {}), false);
});

test("focus-trap filtering honors browser visibility over stale client rects", () => {
  const collapsedDetailsLink = {
    hasAttribute: () => false,
    getAttribute: () => null,
    checkVisibility: () => false,
    getClientRects: () => [{ width: 332, height: 44 }],
  };
  const legacyVisibleLink = {
    hasAttribute: () => false,
    getAttribute: () => null,
    getClientRects: () => [{ width: 44, height: 44 }],
  };

  assert.equal(isVisibleFocusable(collapsedDetailsLink), false);
  assert.equal(isVisibleFocusable(legacyVisibleLink), true);
});
