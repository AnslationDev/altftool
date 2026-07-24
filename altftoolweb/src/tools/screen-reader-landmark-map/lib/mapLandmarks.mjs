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
const SUPPORTED_ROLES = new Set([
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
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
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => {
      const codePoint = Number.parseInt(number, 16);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    });
}

function cleanText(value) {
  return decodeEntities(value).replace(/\s+/g, " ").trim().slice(0, 500);
}

function parseAttributes(source) {
  const attributes = {};
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1].toLowerCase();
    if (!Object.hasOwn(attributes, name)) {
      attributes[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    }
  }
  return attributes;
}

function makeNode(tag, attrs = {}, parent = null) {
  return { tag, attrs, parent, children: [], ownText: "" };
}

function tokenizeHtml(source) {
  const bounded = String(source || "").slice(0, MAX_SOURCE_LENGTH);
  const inertSource = bounded
    .replace(
      /<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    )
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*$/gi, "");
  const root = makeNode("#document");
  const stack = [root];
  const tokenPattern = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+|</g;
  let nodeCount = 0;
  let truncatedByNodes = false;
  let match;

  while ((match = tokenPattern.exec(inertSource))) {
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<!")) continue;
    if (token.startsWith("</")) {
      const closingTag = token.slice(2, -1).trim().toLowerCase().split(/\s+/)[0];
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === closingTag) {
          stack.length = index;
          break;
        }
      }
      continue;
    }
    if (token.startsWith("<") && token !== "<") {
      if (nodeCount >= MAX_NODES) {
        truncatedByNodes = true;
        break;
      }
      const tagMatch = token.match(/^<\s*([a-zA-Z][^\s/>]*)/);
      if (!tagMatch) continue;
      const tag = tagMatch[1].toLowerCase();
      const attributeSource = token
        .slice(tagMatch[0].length, token.length - 1)
        .replace(/\/\s*$/, "");
      const parent = stack.at(-1);
      const node = makeNode(tag, parseAttributes(attributeSource), parent);
      parent.children.push(node);
      nodeCount += 1;
      if (!VOID_TAGS.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
      continue;
    }
    const current = stack.at(-1);
    if (current && !["script", "style", "template"].includes(current.tag)) {
      current.ownText += ` ${token}`;
    }
  }

  return {
    root,
    sourceTruncated: String(source || "").length > MAX_SOURCE_LENGTH,
    nodeTruncated: truncatedByNodes,
    nodeCount,
  };
}

function descendantText(node) {
  if (!node || ["script", "style", "template"].includes(node.tag)) return "";
  const pieces = [node.ownText];
  for (const child of node.children) pieces.push(descendantText(child));
  return cleanText(pieces.join(" "));
}

function buildIdTextMap(root) {
  const map = new Map();
  function visit(node) {
    const id = cleanText(node.attrs?.id);
    if (id && !map.has(id)) map.set(id, descendantText(node));
    node.children.forEach(visit);
  }
  visit(root);
  return map;
}

function accessibleName(node, idTextMap) {
  const ariaLabel = cleanText(node.attrs["aria-label"]);
  if (ariaLabel) return { text: ariaLabel, source: "aria-label" };
  const labelledBy = cleanText(node.attrs["aria-labelledby"]);
  if (labelledBy) {
    const resolved = labelledBy
      .split(/\s+/)
      .map((id) => idTextMap.get(id) || "")
      .filter(Boolean)
      .join(" ");
    if (resolved) return { text: cleanText(resolved), source: "aria-labelledby" };
  }
  if (node.tag === "form") {
    const title = cleanText(node.attrs.title);
    if (title) return { text: title, source: "title" };
  }
  return { text: "", source: "none" };
}

function implicitRole(node, insideSectioning) {
  if (node.tag === "main") return "main";
  if (node.tag === "nav") return "navigation";
  if (node.tag === "aside") return "complementary";
  if (node.tag === "search") return "search";
  if (node.tag === "header" && !insideSectioning) return "banner";
  if (node.tag === "footer" && !insideSectioning) return "contentinfo";
  if (node.tag === "form") return "form";
  if (node.tag === "section") return "region";
  return "";
}

function headingLevel(node) {
  const native = node.tag.match(/^h([1-6])$/);
  if (native) return Number(native[1]);
  if (cleanText(node.attrs.role).toLowerCase() !== "heading") return null;
  const ariaLevel = Number(node.attrs["aria-level"]);
  return Number.isInteger(ariaLevel) && ariaLevel >= 1 && ariaLevel <= 6
    ? ariaLevel
    : null;
}

export function mapLandmarks(source) {
  const raw = String(source || "");
  if (!raw.trim()) return { ok: false, errors: ["Paste or open an HTML document first."] };
  const parsed = tokenizeHtml(raw);
  const idTextMap = buildIdTextMap(parsed.root);
  const landmarks = [];
  const headings = [];
  const sequence = [];
  const cues = [];

  function visit(node, context) {
    if (cleanText(node.attrs?.["aria-hidden"]).toLowerCase() === "true") return;
    const tag = node.tag;
    const explicitRole = cleanText(node.attrs?.role).toLowerCase().split(/\s+/)[0];
    const name = accessibleName(node, idTextMap);
    const implicit = implicitRole(node, context.insideSectioning);
    const role = SUPPORTED_ROLES.has(explicitRole) ? explicitRole : implicit;
    const needsName = ["form", "region"].includes(role);
    const isLandmark = Boolean(role) && (!needsName || Boolean(name.text));

    let landmarkIndex = context.landmarkIndex;
    if (isLandmark) {
      landmarkIndex = landmarks.length;
      const landmark = {
        index: landmarkIndex,
        role,
        tag,
        label: name.text,
        labelSource: name.source,
        depth: context.landmarkDepth,
        headingCount: 0,
      };
      landmarks.push(landmark);
      sequence.push({
        kind: "landmark",
        index: landmarkIndex,
        depth: context.landmarkDepth,
      });
    } else if (role && needsName && !name.text) {
      cues.push({
        id: "unnamed-landmark-candidate",
        severity: "review",
        message: `A ${tag} needs an accessible name before it becomes a ${role} landmark.`,
      });
    }

    const level = headingLevel(node);
    if (level) {
      const text = descendantText(node);
      const heading = {
        index: headings.length,
        level,
        text,
        landmarkIndex,
        empty: !text,
      };
      headings.push(heading);
      sequence.push({
        kind: "heading",
        index: heading.index,
        level,
        depth: context.landmarkDepth + Number(isLandmark),
      });
      if (landmarkIndex !== null && landmarks[landmarkIndex]) {
        landmarks[landmarkIndex].headingCount += 1;
      }
      if (!text) {
        cues.push({
          id: "empty-heading",
          severity: "review",
          message: `A level ${level} heading has no readable text.`,
        });
      }
    }

    const sectioning =
      context.insideSectioning ||
      ["article", "aside", "main", "nav", "section"].includes(tag);
    const nextContext = {
      insideSectioning: sectioning,
      landmarkIndex,
      landmarkDepth: context.landmarkDepth + Number(isLandmark),
    };
    node.children.forEach((child) => visit(child, nextContext));
  }

  parsed.root.children.forEach((node) =>
    visit(node, {
      insideSectioning: false,
      landmarkIndex: null,
      landmarkDepth: 0,
    }),
  );

  const mainCount = landmarks.filter((item) => item.role === "main").length;
  if (mainCount === 0) {
    cues.push({
      id: "missing-main",
      severity: "review",
      message: "No main landmark was found in the supplied HTML.",
    });
  } else if (mainCount > 1) {
    cues.push({
      id: "multiple-main",
      severity: "review",
      message: `${mainCount} main landmarks were found; confirm only one is exposed at a time.`,
    });
  }

  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index].level > headings[index - 1].level + 1) {
      cues.push({
        id: "heading-level-skip",
        severity: "review",
        message: `Heading order jumps from level ${headings[index - 1].level} to ${headings[index].level}.`,
      });
    }
  }

  const roleGroups = new Map();
  landmarks.forEach((landmark) => {
    const group = roleGroups.get(landmark.role) || [];
    group.push(landmark);
    roleGroups.set(landmark.role, group);
  });
  for (const [role, group] of roleGroups) {
    if (
      group.length > 1 &&
      ["navigation", "form", "region", "complementary"].includes(role) &&
      group.some((item) => !item.label)
    ) {
      cues.push({
        id: "repeated-unlabelled-landmark",
        severity: "review",
        message: `Repeated ${role} landmarks should have distinct accessible names.`,
      });
    }
  }

  const uniqueCues = [
    ...new Map(cues.map((cue) => [`${cue.id}:${cue.message}`, cue])).values(),
  ];
  return {
    ok: true,
    landmarks,
    headings,
    sequence,
    cues: uniqueCues,
    counts: {
      nodesParsed: parsed.nodeCount,
      landmarks: landmarks.length,
      headings: headings.length,
      reviewCues: uniqueCues.length,
      mainLandmarks: mainCount,
    },
    truncated: parsed.sourceTruncated || parsed.nodeTruncated,
    limitations: [
      "The source is parsed as inert text and is not executed, styled, rendered, or tested with a screen reader.",
      "CSS visibility, browser accessibility-tree behavior, dynamic content, focus order, and computed accessible names are outside this quick map.",
      "A clean map is not proof of WCAG conformance or usability.",
    ],
  };
}

export function buildLandmarkReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.screen-reader-landmark-map.v1",
    createdAt: new Date().toISOString(),
    counts: { ...result.counts },
    cueCounts: result.cues.reduce((counts, cue) => {
      counts[cue.id] = (counts[cue.id] || 0) + 1;
      return counts;
    }, {}),
    scope: {
      localOnly: true,
      sourceExecuted: false,
      sourceIncluded: false,
      headingTextIncluded: false,
      landmarkLabelsIncluded: false,
      conformanceEstablished: false,
    },
  };
}
