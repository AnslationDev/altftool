// Converts a Swagger 2.0 document into the OpenAPI 3.0 shape every other
// component in this tool expects (servers[], responses[code].content.
// "application/json".schema, requestBody instead of an `in: "body"`
// parameter). Without this, importing a genuine Swagger 2.0 export gets
// treated as if it were already OpenAPI 3.0 and silently loses its base URL,
// request/response schemas and body parameters — see pages/index.jsx's
// handleFileImport, which routes here whenever `parsed.swagger` is present.

export function isSwagger2(spec) {
  return typeof spec?.swagger === "string" && spec.swagger.trim().startsWith("2");
}

function buildServers(spec) {
  if (Array.isArray(spec.servers) && spec.servers.length) return spec.servers;
  const host = spec.host || "api.example.com";
  const basePath = spec.basePath && spec.basePath !== "/" ? spec.basePath : "";
  const schemes = Array.isArray(spec.schemes) && spec.schemes.length ? spec.schemes : ["https"];
  const scheme = schemes.includes("https") ? "https" : schemes[0];
  return [{ url: `${scheme}://${host}${basePath}` }];
}

function convertParameter(param) {
  if (!param || typeof param !== "object") return param;
  // Swagger 2.0 puts `type`/`items` directly on the parameter; OAS3 nests
  // them under `schema`.
  const { type, items, format, enum: enumValues, schema, ...rest } = param;
  return {
    ...rest,
    schema: schema || { ...(type && { type }), ...(items && { items }), ...(format && { format }), ...(enumValues && { enum: enumValues }) },
  };
}

function convertResponses(responses) {
  if (!responses || typeof responses !== "object") return responses;
  return Object.fromEntries(
    Object.entries(responses).map(([code, res]) => {
      if (!res || typeof res !== "object" || res.content) return [code, res];
      const { schema, ...rest } = res;
      return [
        code,
        {
          ...rest,
          ...(schema && { content: { "application/json": { schema } } }),
        },
      ];
    }),
  );
}

function convertOperation(op) {
  if (!op || typeof op !== "object") return op;
  const converted = { ...op };

  const params = Array.isArray(op.parameters) ? op.parameters : [];
  const bodyParam = params.find((p) => p?.in === "body");
  const formParams = params.filter((p) => p?.in === "formData");
  const otherParams = params.filter((p) => p?.in !== "body" && p?.in !== "formData").map(convertParameter);

  if (otherParams.length) converted.parameters = otherParams;
  else delete converted.parameters;

  if (bodyParam?.schema) {
    converted.requestBody = {
      required: !!bodyParam.required,
      content: { "application/json": { schema: bodyParam.schema } },
    };
  } else if (formParams.length) {
    converted.requestBody = {
      required: formParams.some((p) => p.required),
      content: {
        "application/x-www-form-urlencoded": {
          schema: {
            type: "object",
            properties: Object.fromEntries(
              formParams.map((p) => [p.name, { type: p.type || "string" }]),
            ),
          },
        },
      },
    };
  }

  if (op.responses) converted.responses = convertResponses(op.responses);

  return converted;
}

export function swagger2ToOpenApi3(spec) {
  if (!spec || typeof spec !== "object") return spec;

  const paths = {};
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    paths[path] = {};
    Object.entries(methods || {}).forEach(([method, op]) => {
      paths[path][method] = convertOperation(op);
    });
  });

  // Drop the Swagger-2-only fields once converted so nothing downstream
  // mistakes this for an unconverted document.
  const { swagger, host, basePath, schemes, ...rest } = spec;

  return {
    ...rest,
    openapi: "3.0.0",
    servers: buildServers(spec),
    paths,
  };
}
