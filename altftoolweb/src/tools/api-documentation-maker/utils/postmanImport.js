function flattenItems(items = [], acc = []) {
  items.forEach((item) => {
    if (item.item) {
      flattenItems(item.item, acc);
    } else if (item.request) {
      acc.push(item);
    }
  });
  return acc;
}

function extractPath(urlObj) {
  if (!urlObj) return "/";
  if (typeof urlObj === "string") {
    try {
      return new URL(urlObj).pathname || "/";
    } catch {
      return urlObj.startsWith("/") ? urlObj : `/${urlObj}`;
    }
  }
  const parts = urlObj.path || [];
  const path = "/" + parts.filter(Boolean).join("/");
  return path === "/" ? "/" : path;
}

function extractBaseUrl(urlObj) {
  if (!urlObj) return "";
  if (typeof urlObj === "string") {
    try {
      const u = new URL(urlObj);
      return `${u.protocol}//${u.host}`;
    } catch {
      return "";
    }
  }
  const host = Array.isArray(urlObj.host) ? urlObj.host.join(".") : urlObj.host;
  const protocol = urlObj.protocol || "https";
  return host ? `${protocol}://${host}` : "";
}

export function isPostmanCollection(data) {
  return !!(data && Array.isArray(data.item) && data.info);
}

// Converts a Postman Collection v2/v2.1 export into this tool's endpoint JSON schema.
export function postmanToDocInput(collection) {
  const flat = flattenItems(collection.item);
  let baseUrl = "";

  const endpoints = flat.map((item) => {
    const req = item.request;
    const isObjReq = typeof req === "object" && req !== null;
    const method = (isObjReq ? req.method : "GET") || "GET";
    const urlObj = isObjReq ? req.url : req;
    const path = extractPath(urlObj);
    if (!baseUrl) baseUrl = extractBaseUrl(urlObj);

    const parameters = [];
    if (urlObj?.query?.length) {
      urlObj.query.forEach((q) => {
        parameters.push({
          name: q.key,
          in: "query",
          description: q.description || "",
          required: !q.disabled,
          type: "string",
        });
      });
    }

    let requestBody;
    const body = isObjReq ? req.body : null;
    if (body?.mode === "raw" && body.raw) {
      try {
        const parsed = JSON.parse(body.raw);
        requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: Object.fromEntries(
                  Object.keys(parsed).map((k) => [
                    k,
                    { type: typeof parsed[k] === "number" ? "integer" : "string" },
                  ]),
                ),
              },
            },
          },
        };
      } catch {
        // request body isn't valid JSON — skip schema inference
      }
    }

    return {
      path,
      method: method.toUpperCase(),
      summary: item.name || path,
      description: (isObjReq && req.description) || "",
      parameters,
      ...(requestBody ? { requestBody } : {}),
      responses: { 200: { description: "Successful response" } },
    };
  });

  return {
    title: collection.info?.name || "Imported Collection",
    version: "1.0.0",
    description: collection.info?.description || "Imported from a Postman collection",
    baseUrl: baseUrl || "https://api.example.com",
    endpoints,
  };
}
