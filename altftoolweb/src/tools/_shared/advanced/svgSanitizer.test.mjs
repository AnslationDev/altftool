import test from "node:test";
import assert from "node:assert/strict";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { sanitizeSvgSource } from "./svgSanitizer.js";

const dom = { DOMParser, XMLSerializer };

test("SVG cleaner removes scripts, animation, CSS and executable references", () => {
  const source = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="run()">
      <style>.x { fill: url(javascript:alert(1)) }</style>
      <script>alert(1)</script>
      <animate attributeName="href" values="#safe;javascript:alert(1)" />
      <a xlink:href="java\nscript:alert(1)"><rect width="10" height="10" /></a>
      <use href="#safe" />
      <path style="fill:url(https://tracker.example/pixel)" fill="url(https://tracker.example/pixel)" />
    </svg>`;

  const { cleaned, stats } = sanitizeSvgSource(source, dom);

  assert.doesNotMatch(cleaned, /script|animate|onload|tracker\.example|java\s*script/i);
  assert.match(cleaned, /href="#safe"/);
  assert.ok(stats.removedElements >= 3);
  assert.ok(stats.removedAttributes >= 3);
});

test("SVG cleaner rejects non-SVG roots, entities and parser errors", () => {
  assert.throws(
    () => sanitizeSvgSource('<html xmlns="http://www.w3.org/1999/xhtml"/>', dom),
    /SVG root element/,
  );
  assert.throws(
    () => sanitizeSvgSource('<!DOCTYPE svg [<!ENTITY x "boom">]><svg xmlns="http://www.w3.org/2000/svg"/>', dom),
    /DOCTYPE or ENTITY/,
  );

  class ErrorParser {
    parseFromString() {
      return new DOMParser().parseFromString("<parsererror/>", "application/xml");
    }
  }
  assert.throws(
    () => sanitizeSvgSource("<svg>", { DOMParser: ErrorParser, XMLSerializer }),
    /well-formed SVG XML/,
  );
});
