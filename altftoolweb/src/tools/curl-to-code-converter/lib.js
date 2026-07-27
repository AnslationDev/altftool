/**
 * cURL to code — pure logic.
 *
 * A small POSIX-shell tokenizer feeds a curl option parser, and the resulting
 * request description is printed as JavaScript fetch, Axios or Python
 * requests. Behaviour follows curl's own documented defaults:
 *
 *  - The method is GET unless -X/--request says otherwise, or a body is
 *    supplied with -d/--data, which makes it POST.
 *  - -d with no Content-Type header sends application/x-www-form-urlencoded.
 *  - Repeated -d flags are joined with "&", exactly as curl does.
 *  - -u user:pass becomes HTTP Basic auth.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const TARGETS = [
  { key: "fetch", label: "JavaScript — fetch", language: "javascript" },
  { key: "axios", label: "JavaScript — Axios", language: "javascript" },
  { key: "python", label: "Python — requests", language: "python" },
];

/** curl's default Content-Type for -d when none is given (curl man page). */
export const DEFAULT_FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";

/** HTTP methods curl will accept after -X. */
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

/** Short options that consume the next argument. */
const VALUE_SHORT_FLAGS = new Set(["X", "H", "d", "F", "u", "b", "A", "e", "o", "T", "m", "x"]);

/** Short options that are switches. */
const BOOLEAN_SHORT_FLAGS = new Set(["s", "S", "L", "k", "i", "I", "v", "f", "g", "G", "N", "j"]);

/** Long options that consume the next argument (or an =value). */
const VALUE_LONG_FLAGS = new Set([
  "request",
  "header",
  "data",
  "data-raw",
  "data-binary",
  "data-ascii",
  "data-urlencode",
  "form",
  "user",
  "cookie",
  "user-agent",
  "referer",
  "url",
  "output",
  "max-time",
  "proxy",
  "connect-timeout",
]);

/** Long options that are switches. */
const BOOLEAN_LONG_FLAGS = new Set([
  "silent",
  "show-error",
  "location",
  "insecure",
  "compressed",
  "head",
  "include",
  "verbose",
  "fail",
  "globoff",
  "get",
  "no-buffer",
]);

/* ------------------------------------------------------------------ */
/* Shell tokenizer                                                     */
/* ------------------------------------------------------------------ */

/**
 * Split a shell command into argv, honouring single quotes (fully literal),
 * double quotes (backslash escapes) and backslash line continuations.
 */
export function tokenizeShell(command) {
  const text = String(command == null ? "" : command);
  const tokens = [];
  let current = "";
  let started = false;
  let i = 0;

  const push = () => {
    if (started) tokens.push(current);
    current = "";
    started = false;
  };

  while (i < text.length) {
    const char = text[i];

    if (char === "\\") {
      const next = text[i + 1];
      if (next === "\n") {
        i += 2;
        continue;
      }
      if (next === "\r" && text[i + 2] === "\n") {
        i += 3;
        continue;
      }
      if (next !== undefined) {
        current += next;
        started = true;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (char === "'") {
      const end = text.indexOf("'", i + 1);
      if (end === -1) return { error: "Unterminated single quote in the command." };
      current += text.slice(i + 1, end);
      started = true;
      i = end + 1;
      continue;
    }

    if (char === '"') {
      i += 1;
      let closed = false;
      while (i < text.length) {
        const inner = text[i];
        if (inner === "\\") {
          const next = text[i + 1];
          if (next === "\n") {
            i += 2;
            continue;
          }
          // Inside double quotes the shell only unescapes these characters.
          if (next === '"' || next === "\\" || next === "$" || next === "`") {
            current += next;
            i += 2;
            continue;
          }
          current += inner;
          i += 1;
          continue;
        }
        if (inner === '"') {
          closed = true;
          i += 1;
          break;
        }
        current += inner;
        i += 1;
      }
      if (!closed) return { error: "Unterminated double quote in the command." };
      started = true;
      continue;
    }

    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      push();
      i += 1;
      continue;
    }

    current += char;
    started = true;
    i += 1;
  }

  push();
  return { tokens };
}

/* ------------------------------------------------------------------ */
/* curl parser                                                         */
/* ------------------------------------------------------------------ */

function splitHeader(text) {
  const index = text.indexOf(":");
  if (index === -1) return null;
  return { name: text.slice(0, index).trim(), value: text.slice(index + 1).trim() };
}

/**
 * Parse a curl command into a request description.
 * Returns { error } for anything unusable.
 */
export function parseCurl(command) {
  const lexed = tokenizeShell(command);
  if (lexed.error) return { error: lexed.error };
  const tokens = lexed.tokens.filter((token) => token !== "" && token !== "&&" && token !== "\\");
  if (tokens.length === 0) return { error: "Paste a curl command to convert." };
  if (tokens[0].toLowerCase() !== "curl") {
    return { error: 'The command must start with "curl".' };
  }

  const request = {
    url: "",
    method: "",
    headers: [],
    dataParts: [],
    formParts: [],
    user: "",
    cookie: "",
    followRedirects: false,
    insecure: false,
    compressed: false,
    headOnly: false,
    forceGet: false,
    ignored: [],
  };

  const take = (index, flagLabel) => {
    if (index + 1 >= tokens.length) {
      return { error: `${flagLabel} needs a value, but the command ends there.` };
    }
    return { value: tokens[index + 1] };
  };

  const applyValueFlag = (name, value) => {
    if (name === "X" || name === "request") request.method = value.toUpperCase();
    else if (name === "H" || name === "header") {
      const header = splitHeader(value);
      if (header && header.name) request.headers.push(header);
    } else if (name === "d" || name.startsWith("data")) {
      request.dataParts.push(name === "data-urlencode" ? encodeURI(value) : value);
    } else if (name === "F" || name === "form") request.formParts.push(value);
    else if (name === "u" || name === "user") request.user = value;
    else if (name === "b" || name === "cookie") request.cookie = value;
    else if (name === "A" || name === "user-agent") request.headers.push({ name: "User-Agent", value });
    else if (name === "e" || name === "referer") request.headers.push({ name: "Referer", value });
    else if (name === "url") request.url = value;
    else request.ignored.push(name);
  };

  const applyBooleanFlag = (name) => {
    if (name === "L" || name === "location") request.followRedirects = true;
    else if (name === "k" || name === "insecure") request.insecure = true;
    else if (name === "compressed") request.compressed = true;
    else if (name === "I" || name === "head") request.headOnly = true;
    else if (name === "G" || name === "get") request.forceGet = true;
  };

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");
      const name = eq === -1 ? body : body.slice(0, eq);
      if (VALUE_LONG_FLAGS.has(name)) {
        let value;
        if (eq !== -1) value = body.slice(eq + 1);
        else {
          const taken = take(index, `--${name}`);
          if (taken.error) return { error: taken.error };
          value = taken.value;
          index += 1;
        }
        applyValueFlag(name, value);
      } else if (BOOLEAN_LONG_FLAGS.has(name)) {
        applyBooleanFlag(name);
      } else {
        request.ignored.push(`--${name}`);
      }
      continue;
    }

    if (token.startsWith("-") && token.length > 1) {
      const letters = token.slice(1);
      for (let position = 0; position < letters.length; position += 1) {
        const letter = letters[position];
        if (VALUE_SHORT_FLAGS.has(letter)) {
          const inline = letters.slice(position + 1);
          let value;
          if (inline) {
            value = inline;
          } else {
            const taken = take(index, `-${letter}`);
            if (taken.error) return { error: taken.error };
            value = taken.value;
            index += 1;
          }
          applyValueFlag(letter, value);
          position = letters.length;
        } else if (BOOLEAN_SHORT_FLAGS.has(letter)) {
          applyBooleanFlag(letter);
        } else {
          request.ignored.push(`-${letter}`);
        }
      }
      continue;
    }

    if (!request.url) request.url = token;
  }

  if (!request.url) return { error: "No URL found in that curl command." };

  const hasBody = request.dataParts.length > 0 || request.formParts.length > 0;
  let method = request.method;
  if (!method) {
    if (request.headOnly) method = "HEAD";
    else if (request.forceGet) method = "GET";
    else if (hasBody) method = "POST";
    else method = "GET";
  }

  const body = request.dataParts.join("&");
  const headerMap = new Map();
  for (const header of request.headers) headerMap.set(header.name, header.value);
  if (request.cookie && !headerMap.has("Cookie")) headerMap.set("Cookie", request.cookie);

  const contentTypeKey = [...headerMap.keys()].find(
    (key) => key.toLowerCase() === "content-type",
  );
  let contentType = contentTypeKey ? headerMap.get(contentTypeKey) : "";
  if (!contentType && request.dataParts.length > 0) {
    contentType = DEFAULT_FORM_CONTENT_TYPE;
    headerMap.set("Content-Type", contentType);
  }

  let jsonBody = null;
  if (body) {
    try {
      const candidate = JSON.parse(body);
      if (candidate && typeof candidate === "object") jsonBody = candidate;
    } catch {
      jsonBody = null;
    }
  }

  let auth = null;
  if (request.user) {
    const colon = request.user.indexOf(":");
    auth =
      colon === -1
        ? { username: request.user, password: "" }
        : { username: request.user.slice(0, colon), password: request.user.slice(colon + 1) };
  }

  return {
    url: request.url,
    method,
    headers: [...headerMap.entries()].map(([name, value]) => ({ name, value })),
    body,
    jsonBody,
    formParts: request.formParts,
    contentType,
    auth,
    followRedirects: request.followRedirects,
    insecure: request.insecure,
    compressed: request.compressed,
    ignored: [...new Set(request.ignored)],
  };
}

/* ------------------------------------------------------------------ */
/* Printers                                                            */
/* ------------------------------------------------------------------ */

const jsString = (text) => JSON.stringify(String(text));

function pyString(text) {
  return JSON.stringify(String(text));
}

/** Render a parsed JSON value as a Python literal. */
export function jsonToPython(value, indent = 0) {
  const pad = " ".repeat(indent);
  const padInner = " ".repeat(indent + 4);
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "None";
  if (typeof value === "string") return pyString(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((item) => `${padInner}${jsonToPython(item, indent + 4)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  const items = entries.map(
    ([key, item]) => `${padInner}${pyString(key)}: ${jsonToPython(item, indent + 4)}`,
  );
  return `{\n${items.join(",\n")}\n${pad}}`;
}

function headerObjectLiteral(headers, indent = 2) {
  if (headers.length === 0) return "{}";
  const pad = " ".repeat(indent);
  const lines = headers.map((header) => `${pad}  ${jsString(header.name)}: ${jsString(header.value)},`);
  return `{\n${lines.join("\n")}\n${pad}}`;
}

function printFetch(request) {
  const lines = [];
  lines.push(`const url = ${jsString(request.url)};`);
  lines.push("");
  lines.push("const response = await fetch(url, {");
  lines.push(`  method: ${jsString(request.method)},`);

  const headers = request.headers.slice();
  if (request.auth) {
    headers.push({ name: "Authorization", value: "__BASIC__" });
  }
  if (headers.length) {
    const rendered = headerObjectLiteral(headers).replace(
      `${jsString("__BASIC__")}`,
      `"Basic " + btoa(${jsString(`${request.auth ? request.auth.username : ""}:${request.auth ? request.auth.password : ""}`)})`,
    );
    lines.push(`  headers: ${rendered},`);
  }

  if (request.jsonBody) {
    lines.push(`  body: JSON.stringify(${JSON.stringify(request.jsonBody, null, 2).replace(/\n/g, "\n  ")}),`);
  } else if (request.body) {
    lines.push(`  body: ${jsString(request.body)},`);
  }
  if (request.followRedirects) lines.push('  redirect: "follow",');
  lines.push("});");
  lines.push("");
  lines.push("if (!response.ok) throw new Error(`HTTP ${response.status}`);");
  lines.push("const data = await response.json();");
  lines.push("console.log(data);");
  if (request.insecure) {
    lines.push("");
    lines.push("// curl -k skips TLS verification. fetch in a browser cannot do that;");
    lines.push("// fix the certificate instead.");
  }
  return lines.join("\n");
}

function printAxios(request) {
  const lines = [];
  lines.push('import axios from "axios";');
  lines.push("");
  lines.push("const response = await axios({");
  lines.push(`  method: ${jsString(request.method.toLowerCase())},`);
  lines.push(`  url: ${jsString(request.url)},`);
  if (request.headers.length) {
    lines.push(`  headers: ${headerObjectLiteral(request.headers)},`);
  }
  if (request.auth) {
    lines.push("  auth: {");
    lines.push(`    username: ${jsString(request.auth.username)},`);
    lines.push(`    password: ${jsString(request.auth.password)},`);
    lines.push("  },");
  }
  if (request.jsonBody) {
    lines.push(`  data: ${JSON.stringify(request.jsonBody, null, 2).replace(/\n/g, "\n  ")},`);
  } else if (request.body) {
    lines.push(`  data: ${jsString(request.body)},`);
  }
  lines.push(`  maxRedirects: ${request.followRedirects ? 5 : 0},`);
  lines.push("});");
  lines.push("");
  lines.push("console.log(response.status, response.data);");
  return lines.join("\n");
}

function printPython(request) {
  const lines = [];
  lines.push("import requests");
  lines.push("");
  lines.push(`url = ${pyString(request.url)}`);

  if (request.headers.length) {
    lines.push("headers = {");
    for (const header of request.headers) {
      lines.push(`    ${pyString(header.name)}: ${pyString(header.value)},`);
    }
    lines.push("}");
  }
  if (request.auth) {
    lines.push(`auth = (${pyString(request.auth.username)}, ${pyString(request.auth.password)})`);
  }
  if (request.jsonBody) {
    lines.push(`payload = ${jsonToPython(request.jsonBody, 0)}`);
  } else if (request.body) {
    lines.push(`payload = ${pyString(request.body)}`);
  }

  const args = ["url"];
  if (request.headers.length) args.push("headers=headers");
  if (request.auth) args.push("auth=auth");
  if (request.jsonBody) args.push("json=payload");
  else if (request.body) args.push("data=payload");
  if (!request.followRedirects) args.push("allow_redirects=False");
  if (request.insecure) args.push("verify=False");

  lines.push("");
  lines.push(`response = requests.${request.method.toLowerCase()}(${args.join(", ")})`);
  lines.push("response.raise_for_status()");
  lines.push("print(response.status_code, response.json())");
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Convert a curl command into source code for the chosen target.
 *
 * @param {string} command curl command line
 * @param {"fetch"|"axios"|"python"} target
 */
export function convertCurl(command, target = "fetch") {
  if (!TARGETS.some((entry) => entry.key === target)) {
    return { error: `Unknown target "${target}".` };
  }
  const request = parseCurl(command);
  if (request.error) return { error: request.error };

  if (request.formParts.length > 0) {
    return {
      error:
        "Multipart uploads (-F/--form) are not converted — the file handling differs too much between fetch, Axios and requests to generate reliably.",
    };
  }

  let code;
  if (target === "fetch") code = printFetch(request);
  else if (target === "axios") code = printAxios(request);
  else code = printPython(request);

  return {
    target,
    code,
    method: request.method,
    url: request.url,
    headerCount: request.headers.length,
    bodyBytes: request.body ? request.body.length : 0,
    bodyKind: request.jsonBody ? "JSON" : request.body ? "Raw / form" : "None",
    contentType: request.contentType || "—",
    usesAuth: Boolean(request.auth),
    ignored: request.ignored,
    lineCount: code.split("\n").length,
  };
}
