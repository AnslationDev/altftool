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
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, number) => {
      const codePoint = Number(number);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    });
}

function cleanText(value, maximum = 500) {
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

function makeNode(tag, attrs = {}, parent = null) {
  return { tag, attrs, parent, children: [], ownText: "" };
}

function parseHtml(source) {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_SOURCE_LENGTH);
  const inert = bounded
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*$/gi, "");
  const root = makeNode("#document");
  const stack = [root];
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+|</g;
  let nodeCount = 0;
  let nodeTruncated = false;
  let match;
  while ((match = tokens.exec(inert))) {
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
      if (nodeCount >= MAX_NODES) {
        nodeTruncated = true;
        break;
      }
      const tagMatch = token.match(/^<\s*([a-zA-Z][^\s/>]*)/);
      if (!tagMatch) continue;
      const tag = tagMatch[1].toLowerCase();
      const attrSource = token
        .slice(tagMatch[0].length, token.length - 1)
        .replace(/\/\s*$/, "");
      const parent = stack.at(-1);
      const node = makeNode(tag, parseAttributes(attrSource), parent);
      parent.children.push(node);
      nodeCount += 1;
      if (!VOID_TAGS.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
    } else {
      stack.at(-1).ownText += ` ${token}`;
    }
  }
  return {
    root,
    nodeCount,
    truncated: raw.length > MAX_SOURCE_LENGTH || nodeTruncated,
  };
}

function descendantText(node) {
  if (!node) return "";
  return cleanText(
    [node.ownText, ...node.children.map(descendantText)].join(" "),
  );
}

function allNodes(root) {
  const nodes = [];
  function visit(node) {
    if (node !== root) nodes.push(node);
    node.children.forEach(visit);
  }
  visit(root);
  return nodes;
}

function referencedText(value, idNodeMap) {
  const ids = cleanText(value).split(/\s+/).filter(Boolean);
  const missing = ids.filter((id) => !idNodeMap.has(id));
  const text = ids
    .map((id) => descendantText(idNodeMap.get(id)))
    .filter(Boolean)
    .join(" ");
  return { text: cleanText(text), missing };
}

function ancestorLabel(node) {
  let current = node.parent;
  while (current) {
    if (current.tag === "label") return current;
    current = current.parent;
  }
  return null;
}

function normalizeComparison(value) {
  return cleanText(value)
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function inputType(node) {
  return node.tag === "input"
    ? cleanText(node.attrs.type || "text").toLowerCase()
    : node.tag;
}

function isControl(node) {
  if (!["input", "select", "textarea", "button"].includes(node.tag)) return false;
  return !(node.tag === "input" && inputType(node) === "hidden");
}

function findContainingFieldset(node) {
  let current = node.parent;
  while (current) {
    if (current.tag === "fieldset") return current;
    current = current.parent;
  }
  return null;
}

function firstDirectChild(node, tag) {
  return node.children.find((child) => child.tag === tag) || null;
}

function computeControl(node, index, context) {
  const id = cleanText(node.attrs.id, 200);
  const explicitLabels = id ? context.labelsByFor.get(id) || [] : [];
  const wrappingLabel = ancestorLabel(node);
  const visibleLabelNodes = [
    ...explicitLabels,
    ...(wrappingLabel ? [wrappingLabel] : []),
  ];
  const visibleLabel = cleanText(
    [...new Set(visibleLabelNodes)].map(descendantText).join(" "),
  );
  const labelledBy = referencedText(
    node.attrs["aria-labelledby"],
    context.idNodeMap,
  );
  const ariaLabel = cleanText(node.attrs["aria-label"]);
  const title = cleanText(node.attrs.title);
  const type = inputType(node);
  const nativeValue =
    node.tag === "button"
      ? descendantText(node)
      : type === "image"
        ? cleanText(node.attrs.alt)
        : ["button", "submit", "reset"].includes(type)
          ? cleanText(node.attrs.value)
          : "";
  const accessibleName =
    labelledBy.text || ariaLabel || visibleLabel || nativeValue || title;
  const nameSource = labelledBy.text
    ? "aria-labelledby"
    : ariaLabel
      ? "aria-label"
      : visibleLabel
        ? "label"
        : nativeValue
          ? "native text/value"
          : title
            ? "title"
            : "none";
  const placeholder = cleanText(node.attrs.placeholder);
  const describedBy = referencedText(
    node.attrs["aria-describedby"],
    context.idNodeMap,
  );
  const cues = [];

  if (!accessibleName) {
    cues.push({
      id: placeholder ? "placeholder-only" : "missing-accessible-name",
      severity: "error",
      message: placeholder
        ? "A placeholder is present, but no supported accessible-name source was found."
        : "No supported accessible-name source was found.",
    });
  }
  if (labelledBy.missing.length) {
    cues.push({
      id: "broken-labelledby-reference",
      severity: "error",
      message: "aria-labelledby references one or more IDs not found in the supplied HTML.",
    });
  }
  if (describedBy.missing.length) {
    cues.push({
      id: "broken-describedby-reference",
      severity: "review",
      message: "aria-describedby references one or more IDs not found in the supplied HTML.",
    });
  }
  if (id && (context.idCounts.get(id) || 0) > 1) {
    cues.push({
      id: "duplicate-control-id",
      severity: "error",
      message: "This control ID is duplicated in the supplied HTML.",
    });
  }
  if (visibleLabel && accessibleName) {
    const visible = normalizeComparison(visibleLabel);
    const accessible = normalizeComparison(accessibleName);
    if (visible && !accessible.includes(visible)) {
      cues.push({
        id: "visible-label-not-in-name",
        severity: "review",
        message:
          "The computed heuristic name does not contain the associated visible label text.",
      });
    }
  }
  if (explicitLabels.length > 1) {
    cues.push({
      id: "multiple-explicit-labels",
      severity: "review",
      message: "More than one explicit label points to this control.",
    });
  }

  const fieldset = findContainingFieldset(node);
  if (
    ["radio", "checkbox"].includes(type) &&
    fieldset &&
    !cleanText(descendantText(firstDirectChild(fieldset, "legend")))
  ) {
    cues.push({
      id: "group-without-legend",
      severity: "review",
      message:
        "A radio or checkbox is inside a fieldset whose first-level legend is empty or missing.",
    });
  }

  return {
    index,
    tag: node.tag,
    type,
    id,
    nameSource,
    accessibleName,
    visibleLabel,
    placeholderOnly: Boolean(placeholder && !accessibleName),
    required:
      Object.hasOwn(node.attrs, "required") ||
      cleanText(node.attrs["aria-required"]).toLowerCase() === "true",
    cueIds: cues.map((cue) => cue.id),
    cues,
  };
}

export function auditFormLabels(source) {
  if (!String(source || "").trim()) {
    return { ok: false, errors: ["Paste or open an HTML document first."] };
  }
  const parsed = parseHtml(source);
  const nodes = allNodes(parsed.root);
  const idNodeMap = new Map();
  const idCounts = new Map();
  const labelsByFor = new Map();
  const globalCues = [];

  nodes.forEach((node) => {
    const id = cleanText(node.attrs.id, 200);
    if (id) {
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
      if (!idNodeMap.has(id)) idNodeMap.set(id, node);
    }
    if (node.tag === "label") {
      const target = cleanText(node.attrs.for, 200);
      if (target) {
        const labels = labelsByFor.get(target) || [];
        labels.push(node);
        labelsByFor.set(target, labels);
      }
    }
  });

  for (const [id, count] of idCounts) {
    if (count > 1) {
      globalCues.push({
        id: "duplicate-id",
        severity: "error",
        message: `The ID “${id}” appears ${count} times.`,
      });
    }
  }
  nodes
    .filter((node) => node.tag === "label" && cleanText(node.attrs.for))
    .forEach((label) => {
      const target = cleanText(label.attrs.for);
      if (!idNodeMap.has(target)) {
        globalCues.push({
          id: "label-for-missing-control",
          severity: "error",
          message: `A label points to “${target}”, which was not found.`,
        });
      }
    });

  const controls = nodes
    .filter((node) => {
      if (!isControl(node)) return false;
      let current = node;
      while (current) {
        if (cleanText(current.attrs?.["aria-hidden"]).toLowerCase() === "true") {
          return false;
        }
        current = current.parent;
      }
      return true;
    })
    .map((node, index) =>
      computeControl(node, index, { idNodeMap, idCounts, labelsByFor }),
    );
  const allCues = [
    ...globalCues,
    ...controls.flatMap((control) =>
      control.cues.map((cue) => ({ ...cue, controlIndex: control.index })),
    ),
  ];
  const cueCounts = allCues.reduce((counts, cue) => {
    counts[cue.id] = (counts[cue.id] || 0) + 1;
    return counts;
  }, {});

  return {
    ok: true,
    controls,
    globalCues,
    cues: allCues,
    cueCounts,
    counts: {
      nodesParsed: parsed.nodeCount,
      controls: controls.length,
      namedControls: controls.filter((control) => control.accessibleName).length,
      unnamedControls: controls.filter((control) => !control.accessibleName).length,
      requiredControls: controls.filter((control) => control.required).length,
      errorCues: allCues.filter((cue) => cue.severity === "error").length,
      reviewCues: allCues.filter((cue) => cue.severity === "review").length,
    },
    truncated: parsed.truncated,
    limitations: [
      "HTML is parsed as inert text. CSS, rendered proximity, hidden text techniques, dynamic DOM, shadow DOM, browser accessibility trees, and actual assistive-technology output are not evaluated.",
      "Accessible-name calculation is a bounded heuristic, not a complete implementation of the browser Accessible Name and Description Computation.",
      "A zero-cue result does not establish WCAG conformance or that labels and instructions are clear to users.",
    ],
  };
}

export function buildFormLabelReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.form-label-audit.v1",
    createdAt: new Date().toISOString(),
    counts: { ...result.counts },
    cueCounts: { ...result.cueCounts },
    scope: {
      localOnly: true,
      sourceExecuted: false,
      sourceIncluded: false,
      accessibleNamesIncluded: false,
      visibleLabelsIncluded: false,
      conformanceEstablished: false,
    },
  };
}
