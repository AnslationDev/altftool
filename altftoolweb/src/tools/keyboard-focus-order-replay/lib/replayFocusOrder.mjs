const MAX_SOURCE_LENGTH = 500_000;
const MAX_NODES = 12_000;
const VOID_TAGS = new Set([
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

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function cleanText(value, maximum = 300) {
  return decodeEntities(value).replace(/\s+/g, " ").trim().slice(0, maximum);
}

function parseAttributes(source) {
  const attrs = {};
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1].toLowerCase();
    if (!Object.hasOwn(attrs, name)) {
      attrs[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    }
  }
  return attrs;
}

function makeNode(tag, attrs = {}, parent = null, domIndex = -1) {
  return { tag, attrs, parent, children: [], ownText: "", domIndex };
}

function parseHtml(source) {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_SOURCE_LENGTH);
  const inertSource = bounded
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*$/gi, "");
  const root = makeNode("#document");
  const stack = [root];
  const nodes = [];
  const pattern = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+|</g;
  let truncatedByNodes = false;
  let match;
  while ((match = pattern.exec(inertSource))) {
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<!")) continue;
    if (token.startsWith("</")) {
      const tag = token.slice(2, -1).trim().toLowerCase().split(/\s+/)[0];
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === tag) {
          stack.length = index;
          break;
        }
      }
      continue;
    }
    if (token.startsWith("<") && token !== "<") {
      if (nodes.length >= MAX_NODES) {
        truncatedByNodes = true;
        break;
      }
      const tagMatch = token.match(/^<\s*([a-zA-Z][^\s/>]*)/);
      if (!tagMatch) continue;
      const tag = tagMatch[1].toLowerCase();
      const attrSource = token
        .slice(tagMatch[0].length, token.length - 1)
        .replace(/\/\s*$/, "");
      const parent = stack.at(-1);
      const node = makeNode(tag, parseAttributes(attrSource), parent, nodes.length);
      nodes.push(node);
      parent.children.push(node);
      if (!VOID_TAGS.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
    } else {
      stack.at(-1).ownText += ` ${token}`;
    }
  }
  return {
    root,
    nodes,
    truncated: raw.length > MAX_SOURCE_LENGTH || truncatedByNodes,
  };
}

function descendantText(node) {
  return cleanText(
    [node?.ownText || "", ...(node?.children || []).map(descendantText)].join(" "),
  );
}

function hasBooleanAttribute(node, name) {
  return Object.hasOwn(node.attrs, name);
}

function blockedByAncestor(node) {
  let current = node;
  while (current) {
    if (
      hasBooleanAttribute(current, "hidden") ||
      hasBooleanAttribute(current, "inert")
    ) {
      return true;
    }
    if (
      hasBooleanAttribute(current, "disabled") &&
      (current.tag === "fieldset" ||
        (current === node &&
          ["button", "input", "select", "textarea"].includes(current.tag)))
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function insideAriaHidden(node) {
  let current = node;
  while (current) {
    if (cleanText(current.attrs["aria-hidden"]).toLowerCase() === "true") {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function explicitTabIndex(node) {
  if (!Object.hasOwn(node.attrs, "tabindex")) return { present: false, value: null };
  const raw = cleanText(node.attrs.tabindex);
  if (!/^[+-]?\d+$/.test(raw)) return { present: true, value: null };
  return { present: true, value: Number(raw) };
}

function naturallyFocusable(node) {
  if (["button", "select", "textarea", "iframe"].includes(node.tag)) return true;
  if (node.tag === "input") {
    return cleanText(node.attrs.type || "text").toLowerCase() !== "hidden";
  }
  if (["a", "area"].includes(node.tag)) return Boolean(cleanText(node.attrs.href));
  if (node.tag === "summary") return true;
  if (["audio", "video"].includes(node.tag)) return hasBooleanAttribute(node, "controls");
  if (Object.hasOwn(node.attrs, "contenteditable")) {
    return cleanText(node.attrs.contenteditable).toLowerCase() !== "false";
  }
  return false;
}

function isSequentiallyFocusable(node) {
  if (blockedByAncestor(node)) return false;
  const tabIndex = explicitTabIndex(node);
  if (tabIndex.present) return tabIndex.value !== null && tabIndex.value >= 0;
  return naturallyFocusable(node);
}

function buildIdMap(nodes) {
  const map = new Map();
  nodes.forEach((node) => {
    const id = cleanText(node.attrs.id, 200);
    if (id && !map.has(id)) map.set(id, node);
  });
  return map;
}

function buildLabelMap(nodes) {
  const map = new Map();
  nodes.forEach((node) => {
    if (node.tag !== "label") return;
    const target = cleanText(node.attrs.for, 200);
    const text = descendantText(node);
    if (!target || !text) return;
    map.set(target, [...(map.get(target) || []), text]);
  });
  return map;
}

function referencedName(node, idMap) {
  return cleanText(node.attrs["aria-labelledby"])
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => descendantText(idMap.get(id)))
    .filter(Boolean)
    .join(" ");
}

function nativeLabelName(node, labelMap) {
  const id = cleanText(node.attrs.id, 200);
  const explicit = id ? labelMap.get(id) || [] : [];
  let current = node.parent;
  while (current && current.tag !== "#document") {
    if (current.tag === "label") {
      return cleanText([...explicit, descendantText(current)].join(" "));
    }
    current = current.parent;
  }
  return cleanText(explicit.join(" "));
}

function nodeName(node, idMap, labelMap) {
  const labelled = cleanText(referencedName(node, idMap));
  if (labelled) return { text: labelled, source: "aria-labelledby" };
  const aria = cleanText(node.attrs["aria-label"]);
  if (aria) return { text: aria, source: "aria-label" };
  const nativeLabel = nativeLabelName(node, labelMap);
  if (nativeLabel) return { text: nativeLabel, source: "label" };
  const text = descendantText(node);
  if (text) return { text, source: "text" };
  if (node.tag === "input") {
    const type = cleanText(node.attrs.type || "text").toLowerCase();
    if (type === "image" && cleanText(node.attrs.alt)) {
      return { text: cleanText(node.attrs.alt), source: "alt" };
    }
    if (["submit", "reset", "button"].includes(type) && cleanText(node.attrs.value)) {
      return { text: cleanText(node.attrs.value), source: "value" };
    }
  }
  const title = cleanText(node.attrs.title);
  if (title) return { text: title, source: "title" };
  return { text: "", source: "none" };
}

function hasFocusableAncestor(node) {
  let current = node.parent;
  while (current) {
    if (isSequentiallyFocusable(current)) return true;
    current = current.parent;
  }
  return false;
}

export function replayFocusOrder(source) {
  if (!String(source || "").trim()) {
    return { ok: false, errors: ["Paste or open an HTML document first."] };
  }
  const parsed = parseHtml(source);
  const idMap = buildIdMap(parsed.nodes);
  const labelMap = buildLabelMap(parsed.nodes);
  const items = [];
  const sourceCues = [];

  for (const node of parsed.nodes) {
    const tabIndex = explicitTabIndex(node);
    if (tabIndex.present && tabIndex.value === null) {
      sourceCues.push({
        id: "invalid-tabindex",
        severity: "review",
        domIndex: node.domIndex,
        message: "A tabindex value is not an integer and needs browser testing.",
      });
    }
    if (!isSequentiallyFocusable(node)) continue;
    const name = nodeName(node, idMap, labelMap);
    const effectiveTabIndex =
      tabIndex.present && tabIndex.value !== null ? tabIndex.value : 0;
    const cues = [];
    if (effectiveTabIndex > 0) {
      cues.push({
        id: "positive-tabindex",
        severity: "review",
        message:
          "Positive tabindex moves this item ahead of zero/default tab stops and can make order fragile.",
      });
    }
    if (insideAriaHidden(node)) {
      cues.push({
        id: "focusable-in-aria-hidden",
        severity: "error",
        message:
          "This sequential tab stop is inside aria-hidden content and needs rendered-browser review.",
      });
    }
    if (!name.text) {
      cues.push({
        id: "unnamed-tab-stop",
        severity: "review",
        message: "No bounded accessible-name source was resolved for this tab stop.",
      });
    }
    if (hasFocusableAncestor(node)) {
      cues.push({
        id: "nested-tab-stop",
        severity: "review",
        message:
          "This item is nested inside another sequentially focusable item; confirm the experience is not confusing.",
      });
    }
    items.push({
      domIndex: node.domIndex,
      tag: node.tag,
      role: cleanText(node.attrs.role).toLowerCase(),
      id: cleanText(node.attrs.id, 200),
      effectiveTabIndex,
      name: name.text,
      nameSource: name.source,
      cueIds: cues.map((cue) => cue.id),
      cues,
    });
  }

  const positive = items
    .filter((item) => item.effectiveTabIndex > 0)
    .sort(
      (left, right) =>
        left.effectiveTabIndex - right.effectiveTabIndex ||
        left.domIndex - right.domIndex,
    );
  const defaultOrder = items
    .filter((item) => item.effectiveTabIndex === 0)
    .sort((left, right) => left.domIndex - right.domIndex);
  const order = [...positive, ...defaultOrder].map((item, index) => ({
    ...item,
    sequence: index + 1,
  }));
  const cues = [
    ...sourceCues,
    ...order.flatMap((item) =>
      item.cues.map((cue) => ({
        ...cue,
        domIndex: item.domIndex,
        sequence: item.sequence,
      })),
    ),
  ];
  const cueCounts = cues.reduce((counts, cue) => {
    counts[cue.id] = (counts[cue.id] || 0) + 1;
    return counts;
  }, {});
  return {
    ok: true,
    order,
    reverseOrder: [...order].reverse(),
    cues,
    cueCounts,
    truncated: parsed.truncated,
    counts: {
      nodesParsed: parsed.nodes.length,
      tabStops: order.length,
      positiveTabIndex: positive.length,
      unnamedTabStops: order.filter((item) => !item.name).length,
      nestedTabStops: order.filter((item) => item.cueIds.includes("nested-tab-stop")).length,
      errorCues: cues.filter((cue) => cue.severity === "error").length,
      reviewCues: cues.filter((cue) => cue.severity === "review").length,
    },
    limitations: [
      "This is a static source estimate, not a browser focus trace. CSS visibility, layout, shadow DOM, custom elements, iframes, scripts, dialogs, popovers, dynamic insertion, and programmatic focus can change the order.",
      "The tool cannot judge whether an order preserves meaning or operability; that requires replay in the rendered interface and user testing.",
      "Composite widgets often use arrow-key navigation or aria-activedescendant, which is outside a simple Tab/Shift+Tab sequence.",
      "A zero-cue result does not establish WCAG conformance or keyboard accessibility.",
    ],
  };
}

export function buildFocusOrderReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.keyboard-focus-order-summary.v1",
    createdAt: new Date().toISOString(),
    counts: { ...result.counts },
    cueCounts: { ...result.cueCounts },
    scope: {
      localOnly: true,
      sourceExecuted: false,
      namesIncluded: false,
      idsIncluded: false,
      renderedFocusTested: false,
      conformanceEstablished: false,
    },
  };
}
