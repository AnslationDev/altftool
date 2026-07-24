export const MAX_HAR_CHARACTERS = 15_000_000;
export const MAX_HAR_ENTRIES = 5_000;

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "x-api-key",
  "api-key",
  "x-amz-security-token",
  "x-aws-ec2-metadata-token",
  "x-auth-token",
  "x-access-token",
  "x-goog-api-key",
  "x-csrf-token",
  "x-xsrf-token",
]);

const SENSITIVE_PARAMETERS = new Set([
  "access_token",
  "api_key",
  "apikey",
  "auth",
  "authorization",
  "code",
  "credential",
  "id_token",
  "jwt",
  "key",
  "pass",
  "password",
  "refresh_token",
  "secret",
  "session",
  "sessionid",
  "sig",
  "signature",
  "token",
]);

function lower(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isSensitiveParameter(name) {
  const normalized = lower(name).replace(/[\s-]+/g, "_");
  return (
    SENSITIVE_PARAMETERS.has(normalized) ||
    /(?:^|_)(?:token|secret|password|passwd|credential|signature|session)(?:$|_)/u.test(
      normalized,
    )
  );
}

function isSensitiveHeader(name) {
  const normalized = lower(name);
  return (
    SENSITIVE_HEADERS.has(normalized) ||
    /(?:^|-)(?:api-key|access-token|auth-token|csrf-token|xsrf-token|session-token|security-token)(?:$|-)/u.test(
      normalized,
    )
  );
}

function filterNamedItems(items, shouldRemove) {
  if (!Array.isArray(items)) return { items, removed: 0 };
  const kept = [];
  let removed = 0;
  for (const item of items) {
    if (item && shouldRemove(item.name)) removed += 1;
    else kept.push(item);
  }
  return { items: kept, removed };
}

function filterParameterString(value) {
  let removed = 0;
  const kept = String(value ?? "")
    .split("&")
    .filter((part) => {
      const encodedName = (part.split("=")[0] || "").replace(/\+/g, " ");
      let name = encodedName;
      try {
        name = decodeURIComponent(encodedName);
      } catch {
        // Preserve malformed names for review instead of aborting the HAR.
      }
      if (!isSensitiveParameter(name)) return true;
      removed += 1;
      return false;
    });
  return { value: kept.join("&"), removed };
}

function sanitizeFragment(hash) {
  if (typeof hash !== "string" || !hash.startsWith("#") || hash.length < 2) {
    return { hash, removed: 0 };
  }
  const fragment = hash.slice(1);
  const question = fragment.indexOf("?");
  if (question >= 0) {
    const prefix = fragment.slice(0, question);
    const filtered = filterParameterString(fragment.slice(question + 1));
    return {
      hash: `#${prefix}${filtered.value ? `?${filtered.value}` : ""}`,
      removed: filtered.removed,
    };
  }
  if (fragment.includes("=")) {
    const filtered = filterParameterString(fragment);
    return {
      hash: filtered.value ? `#${filtered.value}` : "",
      removed: filtered.removed,
    };
  }
  try {
    const decoded = decodeURIComponent(fragment);
    if (decoded.includes("=")) {
      const filtered = filterParameterString(decoded);
      if (filtered.removed > 0) {
        return { hash: "", removed: filtered.removed };
      }
    }
  } catch {
    // Preserve malformed fragments for manual review.
  }
  return { hash, removed: 0 };
}

function sanitizeUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl) return { url: rawUrl, removed: 0 };
  try {
    const parsed = new URL(rawUrl);
    let removed = 0;
    if (parsed.username || parsed.password) {
      parsed.username = "";
      parsed.password = "";
      removed += 1;
    }
    for (const name of [...parsed.searchParams.keys()]) {
      if (!isSensitiveParameter(name)) continue;
      removed += parsed.searchParams.getAll(name).length;
      parsed.searchParams.delete(name);
    }
    const fragment = sanitizeFragment(parsed.hash);
    parsed.hash = fragment.hash;
    removed += fragment.removed;
    return { url: parsed.toString(), removed };
  } catch {
    const question = rawUrl.indexOf("?");
    const hashIndex = rawUrl.indexOf("#");
    const queryEnd = hashIndex < 0 ? rawUrl.length : hashIndex;
    const prefix =
      question >= 0 && question < queryEnd
        ? rawUrl.slice(0, question)
        : rawUrl.slice(0, queryEnd);
    const filteredQuery =
      question >= 0 && question < queryEnd
        ? filterParameterString(rawUrl.slice(question + 1, queryEnd))
        : { value: "", removed: 0 };
    const fragment = sanitizeFragment(
      hashIndex < 0 ? "" : rawUrl.slice(hashIndex),
    );
    return {
      url: `${prefix}${
        filteredQuery.value ? `?${filteredQuery.value}` : ""
      }${fragment.hash}`,
      removed: filteredQuery.removed + fragment.removed,
    };
  }
}

function parseHarInput(input) {
  if (typeof input === "string") {
    if (input.length > MAX_HAR_CHARACTERS) {
      throw new Error(
        `HAR text exceeds the ${MAX_HAR_CHARACTERS.toLocaleString("en-US")}-character limit.`,
      );
    }
    try {
      return JSON.parse(input);
    } catch {
      throw new Error("The selected file is not valid JSON.");
    }
  }
  if (!input || typeof input !== "object")
    throw new Error("Provide a HAR JSON object.");
  return structuredClone(input);
}

export function sanitizeHar(
  input,
  {
    removeSensitiveHeaders = true,
    removeCookies = true,
    removeSensitiveQuery = true,
    removeRequestBodies = true,
    removeResponseBodies = true,
  } = {},
) {
  const har = parseHarInput(input);
  if (!har.log || !Array.isArray(har.log.entries)) {
    throw new Error("This JSON does not contain a HAR log.entries array.");
  }
  if (har.log.entries.length > MAX_HAR_ENTRIES) {
    throw new Error(
      `HAR contains more than ${MAX_HAR_ENTRIES.toLocaleString("en-US")} entries.`,
    );
  }

  const summary = {
    entries: har.log.entries.length,
    protectionsEnabled: [
      removeSensitiveHeaders,
      removeCookies,
      removeSensitiveQuery,
      removeRequestBodies,
      removeResponseBodies,
    ].filter(Boolean).length,
    headersRemoved: 0,
    cookiesRemoved: 0,
    queryParametersRemoved: 0,
    urlSecretsRemoved: 0,
    requestBodiesRemoved: 0,
    responseBodiesRemoved: 0,
  };

  for (const entry of har.log.entries) {
    if (!entry || typeof entry !== "object") continue;
    const request =
      entry.request && typeof entry.request === "object" ? entry.request : null;
    const response =
      entry.response && typeof entry.response === "object"
        ? entry.response
        : null;

    if (request) {
      if (removeSensitiveHeaders) {
        const filtered = filterNamedItems(request.headers, isSensitiveHeader);
        request.headers = filtered.items;
        summary.headersRemoved += filtered.removed;
      }
      if (removeCookies && Array.isArray(request.cookies)) {
        summary.cookiesRemoved += request.cookies.length;
        request.cookies = [];
      }
      if (removeSensitiveQuery) {
        const filtered = filterNamedItems(
          request.queryString,
          isSensitiveParameter,
        );
        request.queryString = filtered.items;
        summary.queryParametersRemoved += filtered.removed;
        const sanitized = sanitizeUrl(request.url);
        request.url = sanitized.url;
        summary.urlSecretsRemoved += sanitized.removed;
      }
      if (
        removeRequestBodies &&
        request.postData &&
        typeof request.postData === "object"
      ) {
        const hadBody =
          (typeof request.postData.text === "string" &&
            request.postData.text.length > 0) ||
          (Array.isArray(request.postData.params) &&
            request.postData.params.length > 0);
        if (hadBody) summary.requestBodiesRemoved += 1;
        delete request.postData.text;
        if (Array.isArray(request.postData.params))
          request.postData.params = [];
      }
    }

    if (response) {
      if (removeSensitiveHeaders) {
        const filtered = filterNamedItems(response.headers, isSensitiveHeader);
        response.headers = filtered.items;
        summary.headersRemoved += filtered.removed;
      }
      if (removeCookies && Array.isArray(response.cookies)) {
        summary.cookiesRemoved += response.cookies.length;
        response.cookies = [];
      }
      if (
        removeResponseBodies &&
        response.content &&
        typeof response.content === "object" &&
        typeof response.content.text === "string"
      ) {
        if (response.content.text.length > 0)
          summary.responseBodiesRemoved += 1;
        delete response.content.text;
        delete response.content.encoding;
      }
    }
  }

  return { har, summary, json: JSON.stringify(har, null, 2) };
}
