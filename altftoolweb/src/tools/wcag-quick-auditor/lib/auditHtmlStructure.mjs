const MAX_HTML_LENGTH = 750_000;
const MAX_LOCATIONS_PER_FINDING = 8;

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const NON_RENDERED_CONTAINERS = new Set([
  "script",
  "style",
  "template",
  "noscript",
]);

const PERSONAL_FIELD_CUE =
  /\b(?:address|bday|birth|card|cc|city|country|email|e-mail|first.?name|full.?name|given.?name|last.?name|family.?name|mobile|name|organization|password|phone|postal|state|street|tel|user.?name|zip)\b/iu;

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function decodeBasicEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: "\u00a0",
    quot: '"',
  };
  return String(value ?? "").replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/giu,
    (match, decimal, hexadecimal, name) => {
      try {
        if (decimal) return String.fromCodePoint(Number(decimal));
        if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
        return named[name.toLowerCase()] ?? match;
      } catch {
        return match;
      }
    },
  );
}

function newlineOffsets(text) {
  const offsets = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") offsets.push(index);
  }
  return offsets;
}

function lineAtIndex(offsets, index) {
  let low = 0;
  let high = offsets.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (offsets[middle] < index) low = middle + 1;
    else high = middle;
  }
  return low + 1;
}

function findTagEnd(text, start) {
  let quote = "";
  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === ">") return index;
  }
  return -1;
}

function parseAttributes(rawTag, tagNameLength) {
  const attributes = new Map();
  let index = tagNameLength;

  while (index < rawTag.length) {
    while (/[\s/]/u.test(rawTag[index] || "")) index += 1;
    if (index >= rawTag.length) break;
    const nameStart = index;
    while (
      index < rawTag.length &&
      !/[\s=/>]/u.test(rawTag[index])
    ) {
      index += 1;
    }
    const name = rawTag.slice(nameStart, index).toLowerCase();
    if (!name) {
      index += 1;
      continue;
    }
    while (/\s/u.test(rawTag[index] || "")) index += 1;
    let value = "";
    if (rawTag[index] === "=") {
      index += 1;
      while (/\s/u.test(rawTag[index] || "")) index += 1;
      const quote = rawTag[index] === '"' || rawTag[index] === "'" ? rawTag[index] : "";
      if (quote) {
        index += 1;
        const valueStart = index;
        while (index < rawTag.length && rawTag[index] !== quote) index += 1;
        value = rawTag.slice(valueStart, index);
        if (rawTag[index] === quote) index += 1;
      } else {
        const valueStart = index;
        while (
          index < rawTag.length &&
          !/[\s>]/u.test(rawTag[index])
        ) {
          index += 1;
        }
        value = rawTag.slice(valueStart, index).replace(/\/$/u, "");
      }
    }
    if (!attributes.has(name)) attributes.set(name, decodeBasicEntities(value));
  }
  return attributes;
}

function appendText(parent, text) {
  if (!text) return;
  parent.children.push({
    type: "text",
    value: decodeBasicEntities(text),
    parent,
  });
}

function parseInertHtml(value) {
  const text = String(value ?? "");
  const lowerText = text.toLowerCase();
  const offsets = newlineOffsets(text);
  const root = {
    type: "root",
    children: [],
    parent: null,
    line: 1,
  };
  const elements = [];
  const stack = [root];
  let index = 0;

  while (index < text.length) {
    const open = text.indexOf("<", index);
    if (open < 0) {
      appendText(stack.at(-1), text.slice(index));
      break;
    }
    if (open > index) appendText(stack.at(-1), text.slice(index, open));

    if (text.startsWith("<!--", open)) {
      const commentEnd = text.indexOf("-->", open + 4);
      index = commentEnd < 0 ? text.length : commentEnd + 3;
      continue;
    }
    const end = findTagEnd(text, open);
    if (end < 0) {
      appendText(stack.at(-1), text.slice(open));
      break;
    }
    const rawTag = text.slice(open + 1, end).trim();
    index = end + 1;
    if (!rawTag || /^[!?]/u.test(rawTag)) continue;

    if (rawTag.startsWith("/")) {
      const closingName = rawTag.slice(1).match(/^([a-z][a-z0-9:-]*)/iu)?.[1]?.toLowerCase();
      if (!closingName) continue;
      const matchingIndex = stack.findLastIndex(
        (node) => node.type === "element" && node.tag === closingName,
      );
      if (matchingIndex > 0) stack.length = matchingIndex;
      continue;
    }

    const tagMatch = rawTag.match(/^([a-z][a-z0-9:-]*)/iu);
    if (!tagMatch) continue;
    const tag = tagMatch[1].toLowerCase();
    const parent = stack.at(-1);
    const node = {
      type: "element",
      tag,
      attributes: parseAttributes(rawTag, tagMatch[0].length),
      children: [],
      parent,
      line: lineAtIndex(offsets, open),
      order: elements.length + 1,
    };
    parent.children.push(node);
    elements.push(node);

    const selfClosing = /\/\s*$/u.test(rawTag);
    if (!selfClosing && !VOID_ELEMENTS.has(tag)) {
      stack.push(node);
      if (tag === "script" || tag === "style" || tag === "textarea") {
        const closingStart = lowerText.indexOf(`</${tag}`, index);
        if (closingStart < 0) {
          stack.pop();
          index = text.length;
        } else {
          const closingEnd = findTagEnd(text, closingStart);
          stack.pop();
          index = closingEnd < 0 ? text.length : closingEnd + 1;
        }
      }
    }
  }

  return { root, elements };
}

function hasAttribute(node, name) {
  return node.attributes.has(name);
}

function attribute(node, name) {
  return node.attributes.get(name) ?? "";
}

function hasNonEmptyAttribute(node, name) {
  return normalizeWhitespace(attribute(node, name)).length > 0;
}

function hiddenBySelf(node) {
  return (
    hasAttribute(node, "hidden") ||
    attribute(node, "aria-hidden").toLowerCase() === "true" ||
    NON_RENDERED_CONTAINERS.has(node.tag)
  );
}

function isRendered(node) {
  let current = node;
  while (current?.type === "element") {
    if (hiddenBySelf(current)) return false;
    current = current.parent;
  }
  return true;
}

function descendantElements(node, tag) {
  const matches = [];
  const visit = (current) => {
    current.children?.forEach((child) => {
      if (child.type !== "element") return;
      if (!tag || child.tag === tag) matches.push(child);
      visit(child);
    });
  };
  visit(node);
  return matches;
}

function textForName(node, { includeHidden = false } = {}) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (!includeHidden && node.type === "element" && hiddenBySelf(node)) return "";
  if (node.type === "element" && node.tag === "img") {
    return hasAttribute(node, "alt") ? attribute(node, "alt") : "";
  }
  return (node.children || [])
    .map((child) => textForName(child, { includeHidden }))
    .join(" ");
}

function nearestAncestor(node, tag) {
  let current = node.parent;
  while (current?.type === "element") {
    if (current.tag === tag) return current;
    current = current.parent;
  }
  return null;
}

function elementReference(node, counters) {
  const index = counters.get(node) || node.order;
  return `${node.tag === "img" ? "Image" : node.tag === "a" ? "Link" : node.tag === "input" ? "Input" : node.tag === "iframe" ? "Iframe" : node.tag === "table" ? "Table" : `<${node.tag}>`} ${index}`;
}

function buildCounters(elements) {
  const counts = new Map();
  const result = new Map();
  elements.forEach((element) => {
    const next = (counts.get(element.tag) || 0) + 1;
    counts.set(element.tag, next);
    result.set(element, next);
  });
  return result;
}

function makeLocations(nodes, counters) {
  return nodes.slice(0, MAX_LOCATIONS_PER_FINDING).map((node) => ({
    line: node.line,
    target: elementReference(node, counters),
  }));
}

function addFinding(findings, counters, {
  ruleId,
  severity,
  title,
  explanation,
  nodes = [],
  count = nodes.length,
  details,
}) {
  if (!count) return;
  findings.push({
    ruleId,
    severity,
    title,
    explanation,
    count,
    locations: makeLocations(nodes, counters),
    details: details || "",
  });
}

function idIndex(elements) {
  const index = new Map();
  elements.forEach((element) => {
    const id = normalizeWhitespace(attribute(element, "id"));
    if (!id) return;
    const matches = index.get(id) || [];
    matches.push(element);
    index.set(id, matches);
  });
  return index;
}

// input types whose visible text/value IS their accessible name, the same
// way a <button> element's content is: they are controls, not free-text
// data-entry fields, so "value" and the native submit/reset defaults are
// legitimate naming sources for them (but must NOT apply to text/email/etc.
// fields, where a filled-in value is not a label).
const BUTTON_LIKE_INPUT_TYPES = new Set(["button", "submit", "reset", "image"]);

function accessibleName(node, indexes) {
  const ariaLabel = normalizeWhitespace(attribute(node, "aria-label"));
  if (ariaLabel) return { value: ariaLabel, source: "aria-label" };

  const labelledBy = normalizeWhitespace(attribute(node, "aria-labelledby"));
  if (labelledBy) {
    const value = labelledBy
      .split(/\s+/u)
      .flatMap((id) => indexes.ids.get(id) || [])
      .map((target) => textForName(target, { includeHidden: true }))
      .join(" ");
    if (normalizeWhitespace(value)) {
      return { value: normalizeWhitespace(value), source: "aria-labelledby" };
    }
  }

  const id = normalizeWhitespace(attribute(node, "id"));
  if (id) {
    const labels = indexes.labelsFor.get(id) || [];
    const value = labels.map((label) => textForName(label)).join(" ");
    if (normalizeWhitespace(value)) {
      return { value: normalizeWhitespace(value), source: "label" };
    }
  }
  const wrappingLabel = nearestAncestor(node, "label");
  if (wrappingLabel) {
    const value = normalizeWhitespace(textForName(wrappingLabel));
    if (value) return { value, source: "label" };
  }

  // input[type=image] takes its accessible name from `alt`, the same way an
  // <img> does (HTML-AAM); textForName() only special-cases the <img> tag
  // itself, so an <input type="image"> needs its own check here or it falls
  // through with no name at all despite having a valid alt attribute.
  if (
    node.type === "element" &&
    node.tag === "input" &&
    attribute(node, "type").toLowerCase() === "image" &&
    hasAttribute(node, "alt")
  ) {
    return { value: normalizeWhitespace(attribute(node, "alt")), source: "alt" };
  }

  const visibleText = normalizeWhitespace(textForName(node));
  if (visibleText) return { value: visibleText, source: "content" };

  const title = normalizeWhitespace(attribute(node, "title"));
  if (title) return { value: title, source: "title" };

  if (node.type === "element" && node.tag === "input") {
    const type = attribute(node, "type").toLowerCase() || "text";
    if (BUTTON_LIKE_INPUT_TYPES.has(type)) {
      const value = normalizeWhitespace(attribute(node, "value"));
      if (value) return { value, source: "value" };
      if (type === "submit") return { value: "Submit", source: "native-default" };
      if (type === "reset") return { value: "Reset", source: "native-default" };
    }
  }

  return { value: "", source: "none" };
}

function buildNameIndexes(elements) {
  const ids = idIndex(elements);
  const labelsFor = new Map();
  elements
    .filter((element) => element.tag === "label")
    .forEach((label) => {
      const targetId = normalizeWhitespace(attribute(label, "for"));
      if (!targetId) return;
      const labels = labelsFor.get(targetId) || [];
      labels.push(label);
      labelsFor.set(targetId, labels);
    });
  return { ids, labelsFor };
}

// Types that are controls (their own value/alt/native default names them,
// like a <button>) rather than data-entry fields, plus "hidden" which is
// never rendered. None of these belong in the "form fields" inventory or
// need an independent label.
const NON_DATA_ENTRY_INPUT_TYPES = new Set(["hidden", "button", "submit", "reset", "image"]);

function isFormField(element) {
  if (!isRendered(element)) return false;
  if (element.tag === "select" || element.tag === "textarea") return true;
  if (element.tag !== "input") return false;
  const type = attribute(element, "type").toLowerCase() || "text";
  return !NON_DATA_ENTRY_INPUT_TYPES.has(type);
}

function fieldNeedsLabel(element) {
  if (element.tag !== "input") return true;
  const type = attribute(element, "type").toLowerCase() || "text";
  return !NON_DATA_ENTRY_INPUT_TYPES.has(type);
}

function isNamedControl(element) {
  if (!isRendered(element)) return false;
  if (element.tag === "button") return true;
  if (element.tag === "a" && hasAttribute(element, "href")) return true;
  if (
    element.tag === "input" &&
    ["button", "image", "submit", "reset"].includes(
      attribute(element, "type").toLowerCase(),
    )
  ) {
    return true;
  }
  const role = attribute(element, "role").toLowerCase();
  return role === "button" || role === "link";
}

function auditDocument(text) {
  const { elements } = parseInertHtml(text);
  const counters = buildCounters(elements);
  const activeElements = elements.filter(isRendered);
  const indexes = buildNameIndexes(elements);
  const findings = [];

  const htmlElements = elements.filter((element) => element.tag === "html");
  const html = htmlElements[0];
  if (!html || !hasNonEmptyAttribute(html, "lang")) {
    addFinding(findings, counters, {
      ruleId: "document-language",
      severity: "error",
      title: "Document language is missing",
      explanation:
        "Add a valid lang attribute to the root html element so assistive technology can select appropriate pronunciation rules.",
      nodes: html ? [html] : [],
      count: 1,
    });
  } else if (
    !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/iu.test(normalizeWhitespace(attribute(html, "lang")))
  ) {
    addFinding(findings, counters, {
      ruleId: "document-language-format",
      severity: "warning",
      title: "Document language value needs review",
      explanation:
        "The root lang value does not match this auditor’s conservative language-tag pattern.",
      nodes: [html],
    });
  }

  const titles = activeElements.filter(
    (element) => element.tag === "title" && !nearestAncestor(element, "svg"),
  );
  const nonEmptyTitles = titles.filter((title) =>
    normalizeWhitespace(textForName(title)),
  );
  if (!nonEmptyTitles.length) {
    addFinding(findings, counters, {
      ruleId: "page-title",
      severity: "error",
      title: "Page title is missing or empty",
      explanation:
        "Provide a concise, descriptive title element for browser tabs, history, and assistive navigation.",
      nodes: titles,
      count: 1,
    });
  }
  if (titles.length > 1) {
    addFinding(findings, counters, {
      ruleId: "multiple-page-titles",
      severity: "warning",
      title: "Multiple title elements found",
      explanation:
        "Keep one descriptive document title and review how browsers select among duplicates.",
      nodes: titles,
      count: titles.length,
    });
  }

  const headings = activeElements.filter((element) => /^h[1-6]$/u.test(element.tag));
  const emptyHeadings = headings.filter(
    (heading) => !normalizeWhitespace(textForName(heading)),
  );
  addFinding(findings, counters, {
    ruleId: "empty-heading",
    severity: "error",
    title: "Empty heading",
    explanation:
      "A heading without an accessible text label creates an unhelpful navigation stop.",
    nodes: emptyHeadings,
  });
  if (headings.length && !headings.some((heading) => heading.tag === "h1")) {
    addFinding(findings, counters, {
      ruleId: "missing-h1",
      severity: "warning",
      title: "No level-one heading found",
      explanation:
        "Review whether the page has a clear top-level heading that identifies its main topic.",
      nodes: [headings[0]],
      count: 1,
    });
  }
  const headingJumps = [];
  let previousLevel = 0;
  headings.forEach((heading) => {
    const level = Number(heading.tag[1]);
    if (previousLevel && level > previousLevel + 1) headingJumps.push(heading);
    previousLevel = level;
  });
  addFinding(findings, counters, {
    ruleId: "heading-order",
    severity: "warning",
    title: "Heading level is skipped",
    explanation:
      "A jump of more than one heading level can make the document outline harder to understand. Confirm the semantic hierarchy.",
    nodes: headingJumps,
  });

  const images = activeElements.filter((element) => element.tag === "img");
  const missingAlt = images.filter((image) => !hasAttribute(image, "alt"));
  const emptyAltRoleImages = images.filter(
    (image) =>
      hasAttribute(image, "alt") &&
      !normalizeWhitespace(attribute(image, "alt")) &&
      attribute(image, "role").toLowerCase() === "img",
  );
  addFinding(findings, counters, {
    ruleId: "image-alt-missing",
    severity: "error",
    title: "Image alt attribute is missing",
    explanation:
      "Every img element needs an alt attribute. Use meaningful text for informative images and an empty value only for intentionally decorative images.",
    nodes: missingAlt,
  });
  addFinding(findings, counters, {
    ruleId: "empty-alt-explicit-image-role",
    severity: "warning",
    title: "Empty alt conflicts with explicit image role",
    explanation:
      "An empty alt value marks an image decorative, while role=\"img\" exposes it as an image. Review the intended semantics.",
    nodes: emptyAltRoleImages,
  });

  const fields = activeElements.filter(isFormField);
  const unlabeledFields = fields.filter(
    (field) => fieldNeedsLabel(field) && !accessibleName(field, indexes).value,
  );
  addFinding(findings, counters, {
    ruleId: "form-field-label",
    severity: "error",
    title: "Form field has no accessible label",
    explanation:
      "Associate a visible label or provide an appropriate accessible name. Placeholder text alone is not a label.",
    nodes: unlabeledFields,
  });

  const controls = activeElements.filter(isNamedControl);
  const unnamedControls = controls.filter(
    (control) => !accessibleName(control, indexes).value,
  );
  addFinding(findings, counters, {
    ruleId: "interactive-name",
    severity: "error",
    title: "Button or link has no accessible name",
    explanation:
      "Interactive controls need a programmatically determinable name from visible text, a label, or an appropriate ARIA naming relationship.",
    nodes: unnamedControls,
  });

  const duplicateGroups = [...indexes.ids.values()].filter(
    (matches) => matches.length > 1,
  );
  const duplicateNodes = duplicateGroups.flatMap((matches) => matches.slice(1));
  addFinding(findings, counters, {
    ruleId: "duplicate-id",
    severity: "error",
    title: "Duplicate id value",
    explanation:
      "ID values must be unique so labels, ARIA references, fragments, and scripts resolve predictably.",
    nodes: duplicateNodes,
    count: duplicateNodes.length,
    details: `${duplicateGroups.length} duplicate ID group${duplicateGroups.length === 1 ? "" : "s"}`,
  });

  const iframes = activeElements.filter((element) => element.tag === "iframe");
  const untitledIframes = iframes.filter(
    (iframe) => !hasNonEmptyAttribute(iframe, "title"),
  );
  addFinding(findings, counters, {
    ruleId: "iframe-title",
    severity: "error",
    title: "Iframe title is missing or empty",
    explanation:
      "Give each iframe a concise title that identifies the embedded content or purpose.",
    nodes: untitledIframes,
  });

  const tables = activeElements.filter(
    (element) =>
      element.tag === "table" &&
      !["none", "presentation"].includes(attribute(element, "role").toLowerCase()),
  );
  const tablesWithoutCaption = tables.filter((table) => {
    const caption = table.children.find(
      (child) => child.type === "element" && child.tag === "caption",
    );
    return !caption || !normalizeWhitespace(textForName(caption));
  });
  const tablesWithoutHeaders = tables.filter(
    (table) =>
      descendantElements(table, "td").length > 0 &&
      descendantElements(table, "th").filter(isRendered).length === 0,
  );
  addFinding(findings, counters, {
    ruleId: "table-caption",
    severity: "warning",
    title: "Data table has no caption",
    explanation:
      "A caption can identify a data table’s purpose. Confirm whether an equivalent programmatic name is provided.",
    nodes: tablesWithoutCaption,
  });
  addFinding(findings, counters, {
    ruleId: "table-headers",
    severity: "error",
    title: "Data table has cells but no header cells",
    explanation:
      "Use th elements and appropriate associations so row and column context can be conveyed programmatically.",
    nodes: tablesWithoutHeaders,
  });

  const landmarks = activeElements.filter((element) => {
    if (["main", "nav", "aside"].includes(element.tag)) return true;
    if (element.tag === "header" && !nearestAncestor(element, "article") && !nearestAncestor(element, "section")) {
      return true;
    }
    if (element.tag === "footer" && !nearestAncestor(element, "article") && !nearestAncestor(element, "section")) {
      return true;
    }
    return ["banner", "complementary", "contentinfo", "main", "navigation", "region", "search"].includes(
      attribute(element, "role").toLowerCase(),
    );
  });
  const mainLandmarks = activeElements.filter(
    (element) =>
      element.tag === "main" || attribute(element, "role").toLowerCase() === "main",
  );
  if (!mainLandmarks.length) {
    addFinding(findings, counters, {
      ruleId: "main-landmark",
      severity: "warning",
      title: "Main landmark is missing",
      explanation:
        "Identify the page’s primary content with one main element or role=\"main\" landmark.",
      count: 1,
    });
  } else if (mainLandmarks.length > 1) {
    addFinding(findings, counters, {
      ruleId: "multiple-main-landmarks",
      severity: "error",
      title: "Multiple main landmarks found",
      explanation:
        "A page should normally expose one active main landmark. Hide inactive views or use more appropriate regions.",
      nodes: mainLandmarks,
      count: mainLandmarks.length,
    });
  }

  const positiveTabindex = activeElements.filter((element) => {
    if (!hasAttribute(element, "tabindex")) return false;
    const value = Number(attribute(element, "tabindex"));
    return Number.isFinite(value) && value > 0;
  });
  addFinding(findings, counters, {
    ruleId: "positive-tabindex",
    severity: "error",
    title: "Positive tabindex changes natural focus order",
    explanation:
      "Avoid tabindex values greater than zero. Keep DOM order meaningful and use tabindex=\"0\" or \"-1\" only when appropriate.",
    nodes: positiveTabindex,
  });

  const missingAutocomplete = fields.filter((field) => {
    if (field.tag !== "input" && field.tag !== "textarea") return false;
    const type = attribute(field, "type").toLowerCase() || "text";
    if (["button", "checkbox", "file", "hidden", "image", "radio", "reset", "submit"].includes(type)) {
      return false;
    }
    const cue = [
      attribute(field, "id"),
      attribute(field, "name"),
      type,
      accessibleName(field, indexes).value,
    ].join(" ");
    if (!PERSONAL_FIELD_CUE.test(cue)) return false;
    const autocomplete = attribute(field, "autocomplete").toLowerCase();
    return !autocomplete || autocomplete === "off";
  });
  addFinding(findings, counters, {
    ruleId: "autocomplete-cue",
    severity: "warning",
    title: "Personal-data field lacks an autocomplete cue",
    explanation:
      "Review whether a valid autocomplete token can help users enter common personal information accurately and efficiently.",
    nodes: missingAutocomplete,
  });

  return {
    findings,
    stats: {
      elements: activeElements.length,
      headings: headings.length,
      images: images.length,
      decorativeImages: images.filter(
        (image) =>
          hasAttribute(image, "alt") &&
          !normalizeWhitespace(attribute(image, "alt")) &&
          attribute(image, "role").toLowerCase() !== "img",
      ).length,
      formFields: fields.length,
      namedControls: controls.length,
      iframes: iframes.length,
      tables: tables.length,
      landmarks: landmarks.length,
      positiveTabindex: positiveTabindex.length,
    },
  };
}

function assessmentFor(counts) {
  if (counts.error > 0) {
    return {
      level: "issues",
      label: "Structural issues need review",
      description:
        "One or more deterministic checks found missing or conflicting accessibility structure.",
    };
  }
  if (counts.warning > 0) {
    return {
      level: "review",
      label: "Manual structural review recommended",
      description:
        "No configured error-level issue was found, but one or more heuristics need human judgment.",
    };
  }
  return {
    level: "clear",
    label: "No configured structural issue found",
    description:
      "The configured checks did not match. This does not establish WCAG conformance or accessible behavior.",
  };
}

export function auditHtmlStructure(value) {
  const original = String(value ?? "");
  const truncated = original.length > MAX_HTML_LENGTH;
  const text = original.slice(0, MAX_HTML_LENGTH);
  const audited = auditDocument(text);
  const counts = { error: 0, warning: 0 };
  audited.findings.forEach((finding) => {
    counts[finding.severity] += finding.count;
  });

  return {
    scannedCharacters: text.length,
    originalCharacters: original.length,
    truncated,
    findings: audited.findings,
    counts,
    stats: audited.stats,
    assessment: assessmentFor(counts),
    disclaimer:
      "This is an inert structural quick audit, not a full WCAG conformance evaluation. It does not test CSS, contrast, layout, zoom, reflow, focus visibility, keyboard behavior, dynamic states, media, timing, errors, cognition, screen readers, browser accessibility APIs, or real user tasks.",
  };
}

export function buildCountsOnlyWcagReport(result) {
  const lines = [
    "HTML Accessibility Structure Quick Audit — Counts-Only Report",
    "=============================================================",
    `Assessment: ${result.assessment.label}`,
    `Error-level matches: ${result.counts.error}`,
    `Review warnings: ${result.counts.warning}`,
    `Finding groups: ${result.findings.length}`,
    `Elements reviewed: ${result.stats.elements}`,
    `Headings: ${result.stats.headings}`,
    `Images: ${result.stats.images}`,
    `Form fields: ${result.stats.formFields}`,
    `Named-control candidates: ${result.stats.namedControls}`,
    `Tables: ${result.stats.tables}`,
    `Iframes: ${result.stats.iframes}`,
    `Landmarks: ${result.stats.landmarks}`,
    "",
    "Finding counts",
  ];
  if (!result.findings.length) lines.push("- None");
  result.findings.forEach((finding) => {
    lines.push(
      `- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.count}`,
    );
  });
  lines.push(
    "",
    "Important: This quick audit does not establish WCAG conformance and is not a substitute for visual, keyboard, screen-reader, dynamic-state, or user testing.",
    "Privacy: This report contains counts and generic rule names only. It excludes source HTML, text content, attributes, IDs, labels, URLs, snippets, filenames, and line locations.",
    "Processing: HTML was tokenized as inert text locally. The tool did not render DOM content, execute scripts, load resources, follow links, fetch URLs, upload, or persist the source.",
  );
  return lines.join("\n");
}

export const auditorLimits = {
  maxHtmlLength: MAX_HTML_LENGTH,
  maxLocationsPerFinding: MAX_LOCATIONS_PER_FINDING,
};
