const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const MAX_SVG_SOURCE_CHARS = 5_000_000;

const BLOCKED_ELEMENTS = new Set([
  "animate",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "audio",
  "discard",
  "embed",
  "foreignobject",
  "iframe",
  "metadata",
  "object",
  "script",
  "set",
  "style",
  "video",
]);

const BLOCKED_ATTRIBUTES = new Set([
  "action",
  "data",
  "formaction",
  "ping",
  "src",
  "style",
]);

const DANGEROUS_PROTOCOL = /^(?:javascript|vbscript|data|file|https?):/i;
const SAFE_FRAGMENT = /^#[^\s"'<>`]+$/;
const URL_FUNCTION = /url\s*\(\s*(['"]?)(.*?)\1\s*\)/gi;

function localName(node) {
  return String(node?.localName || node?.nodeName || "")
    .split(":")
    .pop()
    .toLowerCase();
}

function removeAttribute(element, attribute) {
  try {
    if (attribute.namespaceURI && attribute.localName) {
      element.removeAttributeNS(attribute.namespaceURI, attribute.localName);
      return;
    }
  } catch {
    // Fall through to the qualified-name removal used by older DOM engines.
  }
  element.removeAttribute(attribute.name);
}

function hasUnsafeUrlFunction(value) {
  URL_FUNCTION.lastIndex = 0;
  let match;
  while ((match = URL_FUNCTION.exec(value)) !== null) {
    if (!SAFE_FRAGMENT.test(match[2].trim())) return true;
  }
  return false;
}

function isUnsafeAttribute(attribute) {
  const name = String(attribute.name || "").toLowerCase();
  const nameWithoutPrefix = name.split(":").pop();
  const value = String(attribute.value || "").trim();
  const compactValue = value.replace(/[\u0000-\u0020\u007f]+/g, "");

  if (/^on/i.test(nameWithoutPrefix)) return true;
  if (BLOCKED_ATTRIBUTES.has(nameWithoutPrefix)) return true;
  if (/^(?:xmlns:)?(?:inkscape|sodipodi)(?::|$)/i.test(name)) return true;

  if (nameWithoutPrefix === "href") {
    return !SAFE_FRAGMENT.test(value);
  }

  if (DANGEROUS_PROTOCOL.test(compactValue) || compactValue.startsWith("//")) {
    return true;
  }

  return hasUnsafeUrlFunction(value);
}

function removeCommentsAndProcessingInstructions(node, stats) {
  for (const child of Array.from(node.childNodes || [])) {
    if (child.nodeType === 7 || child.nodeType === 8) {
      node.removeChild(child);
      stats.removedNonElements += 1;
    } else {
      removeCommentsAndProcessingInstructions(child, stats);
    }
  }
}

function parserErrorCount(document) {
  const errors = new Set();
  for (const node of Array.from(document.getElementsByTagName?.("parsererror") || [])) {
    errors.add(node);
  }
  for (const node of Array.from(document.getElementsByTagNameNS?.("*", "parsererror") || [])) {
    errors.add(node);
  }
  return errors.size;
}

/**
 * Sanitize SVG markup for download with the browser's XML DOM.
 *
 * This deliberately removes scripting, CSS, animation and every non-fragment
 * URL rather than trying to prove that active SVG features are safe. It is a
 * defence-in-depth cleaner, not a substitute for serving untrusted uploads as
 * attachments from an isolated origin.
 */
export function sanitizeSvgSource(
  source,
  {
    DOMParser: Parser = globalThis.DOMParser,
    XMLSerializer: Serializer = globalThis.XMLSerializer,
  } = {},
) {
  const markup = String(source || "");
  if (!markup.trim()) throw new Error("The SVG file is empty.");
  if (markup.length > MAX_SVG_SOURCE_CHARS) {
    throw new Error("This SVG is larger than the 5,000,000-character local safety limit.");
  }
  if (/<!\s*(?:doctype|entity)\b/i.test(markup)) {
    throw new Error("SVG files with DOCTYPE or ENTITY declarations are not accepted.");
  }
  if (typeof Parser !== "function" || typeof Serializer !== "function") {
    throw new Error("This browser does not provide the XML tools required to clean SVG files.");
  }

  const document = new Parser().parseFromString(markup, "image/svg+xml");
  if (!document?.documentElement || parserErrorCount(document) > 0) {
    throw new Error("The file is not well-formed SVG XML.");
  }

  const root = document.documentElement;
  if (localName(root) !== "svg" || root.namespaceURI !== SVG_NAMESPACE) {
    throw new Error("The file must have an SVG root element in the SVG namespace.");
  }

  const stats = {
    removedElements: 0,
    removedAttributes: 0,
    removedExternalReferences: 0,
    removedNonElements: 0,
  };

  const elements = Array.from(document.getElementsByTagName("*"));
  for (const element of elements) {
    if (element !== root && BLOCKED_ELEMENTS.has(localName(element))) {
      element.parentNode?.removeChild(element);
      stats.removedElements += 1;
      continue;
    }

    for (const attribute of Array.from(element.attributes || [])) {
      if (!isUnsafeAttribute(attribute)) continue;
      const attributeName = String(attribute.name || "").toLowerCase();
      const attributeLocalName = attributeName.split(":").pop();
      if (
        attributeLocalName === "href" ||
        DANGEROUS_PROTOCOL.test(String(attribute.value || "").replace(/[\u0000-\u0020\u007f]+/g, "")) ||
        hasUnsafeUrlFunction(String(attribute.value || ""))
      ) {
        stats.removedExternalReferences += 1;
      }
      removeAttribute(element, attribute);
      stats.removedAttributes += 1;
    }
  }

  removeCommentsAndProcessingInstructions(document, stats);

  const cleaned = new Serializer().serializeToString(document);
  if (!cleaned || /<\s*parsererror\b/i.test(cleaned)) {
    throw new Error("The SVG could not be serialized safely.");
  }

  return { cleaned, stats };
}

export default sanitizeSvgSource;
