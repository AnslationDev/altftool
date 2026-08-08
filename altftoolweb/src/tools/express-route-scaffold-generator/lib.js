/**
 * Express router scaffold generator.
 *
 * The rules encoded here are behaviours of Express and of HTTP, not style preferences:
 *
 *  - ERROR MIDDLEWARE ARITY. Express decides a function is an error handler by counting
 *    its declared parameters. Only a function with exactly four — (err, req, res, next) —
 *    is registered as one. Drop `next` and Express treats it as ordinary middleware and
 *    your error handling silently stops running.
 *  - ASYNC REJECTIONS. Express 4 does not observe the promise returned by a handler, so a
 *    rejected async handler never reaches the error middleware and the request hangs until
 *    it times out. Express 5 forwards rejected promises to next() automatically, which is
 *    why the asyncHandler wrapper is emitted only for Express 4.
 *  - ROUTE ORDER. Routes match in registration order, so a literal segment such as
 *    /search must be registered before /:id or the parameterised route swallows it.
 *  - PATH SYNTAX CHANGED IN EXPRESS 5. Express 5 upgraded path-to-regexp: a bare `*`
 *    wildcard is no longer valid and must be named (`/*splat`), and the optional-parameter
 *    `?` suffix was replaced by braces (`/users{/:id}`).
 *  - STATUS CODES. RFC 9110 §15.3.2 says a successful POST that creates a resource returns
 *    201 with a Location header pointing at it; §15.3.5 says 204 carries no body, which is
 *    the right answer for a delete. 404 is a missing resource, 409 a conflict such as a
 *    duplicate unique key, and 422 an entity that parsed but failed semantic validation.
 *
 * Everything is string generation from a validated option object: no network, no file system.
 */

/** Page size used when the client sends no limit. Chosen to fit one screen of rows. */
export const DEFAULT_PAGE_SIZE = 20;
/** Hard ceiling so a single request cannot ask the database for an unbounded result set. */
export const MAX_PAGE_SIZE = 100;

export const MODULE_SYSTEMS = [
  { id: "esm", label: "ES modules (import / export)" },
  { id: "cjs", label: "CommonJS (require / module.exports)" },
];

export const EXPRESS_VERSIONS = [
  { id: "5", label: "Express 5", asyncWrapper: false },
  { id: "4", label: "Express 4", asyncWrapper: true },
];

export const VALIDATORS = [
  { id: "zod", label: "Zod schemas", package: "zod" },
  { id: "express-validator", label: "express-validator", package: "express-validator" },
  { id: "none", label: "No validation layer", package: null },
];

export const OPERATIONS = [
  { id: "list", label: "List (GET collection)", method: "get", status: 200 },
  { id: "get", label: "Read one (GET /:id)", method: "get", status: 200 },
  { id: "create", label: "Create (POST)", method: "post", status: 201 },
  { id: "update", label: "Update (PATCH /:id)", method: "patch", status: 200 },
  { id: "remove", label: "Delete (DELETE /:id)", method: "delete", status: 204 },
];

export const DEFAULT_INPUT = {
  resource: "invoice",
  basePath: "/api/v1",
  moduleSystem: "esm",
  expressVersion: "5",
  validator: "zod",
  operations: ["list", "get", "create", "update", "remove"],
  requireAuth: true,
  pagination: true,
};

/** JavaScript reserved words that cannot become a variable name. */
const RESERVED = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do",
  "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "import",
  "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try",
  "typeof", "var", "void", "while", "with", "let", "static", "yield", "await", "implements",
  "package", "protected", "interface", "private", "public",
]);

/** Nouns whose plural does not follow the regular rules. */
const IRREGULAR_PLURALS = {
  person: "people",
  child: "children",
  man: "men",
  woman: "women",
  tooth: "teeth",
  foot: "feet",
  mouse: "mice",
  goose: "geese",
  datum: "data",
  index: "indices",
  matrix: "matrices",
  status: "statuses",
  analysis: "analyses",
};

/** Nouns that are already their own plural. */
const UNCHANGED_PLURALS = new Set(["series", "species", "equipment", "information", "news", "media"]);

/**
 * Regular English pluralisation, enough for resource names.
 * Rules: -y after a consonant becomes -ies; sibilant endings take -es;
 * -f / -fe becomes -ves; everything else takes -s.
 */
export function pluralize(word) {
  const lower = String(word ?? "").toLowerCase();
  if (!lower) return "";
  if (UNCHANGED_PLURALS.has(lower)) return lower;
  if (IRREGULAR_PLURALS[lower]) return IRREGULAR_PLURALS[lower];
  if (/[^aeiou]y$/.test(lower)) return `${lower.slice(0, -1)}ies`;
  // A single, un-doubled trailing z (quiz, fez) doubles the z before -es, matching
  // standard English orthography (quiz -> quizzes). An already-doubled zz (buzz)
  // falls through to the general sibilant rule below, which is already correct.
  if (/[^z]z$/.test(lower)) return `${lower}zes`;
  if (/(s|sh|ch|x|z)$/.test(lower)) return `${lower}es`;
  if (/[^f]fe$/.test(lower)) return `${lower.slice(0, -2)}ves`;
  if (/[aeilnorsu]f$/.test(lower)) return `${lower.slice(0, -1)}ves`;
  return `${lower}s`;
}

/** Split any casing into lowercase words. */
function words(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());
}

export function toCamel(value) {
  const parts = words(value);
  if (parts.length === 0) return "";
  return parts[0] + parts.slice(1).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

export function toPascal(value) {
  const camel = toCamel(value);
  return camel ? camel[0].toUpperCase() + camel.slice(1) : "";
}

export function toKebab(value) {
  return words(value).join("-");
}

const OPERATION_BY_ID = new Map(OPERATIONS.map((operation) => [operation.id, operation]));

function normalisePath(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "/") return "";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "");
}

/**
 * Generate the scaffold.
 *
 * @param {object} input see DEFAULT_INPUT
 * @returns {object} { files, warnings, names, routes } or { error }
 */
export function buildRouteScaffold(input = {}) {
  const cfg = { ...DEFAULT_INPUT, ...input };

  const camel = toCamel(cfg.resource);
  if (!camel) return { error: "Give the resource a name, for example invoice or purchase order." };
  if (/^\d/.test(camel)) return { error: "A resource name cannot start with a digit." };
  if (RESERVED.has(camel)) return { error: `"${camel}" is a JavaScript reserved word, so it cannot be a variable name.` };

  const kebab = toKebab(cfg.resource);
  const plural = pluralize(kebab.split("-").pop());
  const pluralPath = kebab.includes("-")
    ? `${kebab.split("-").slice(0, -1).join("-")}-${plural}`
    : plural;
  const pluralCamel = toCamel(pluralPath);
  const pascal = toPascal(cfg.resource);

  if (!MODULE_SYSTEMS.some((entry) => entry.id === cfg.moduleSystem)) {
    return { error: "Choose ES modules or CommonJS." };
  }
  const expressVersion = EXPRESS_VERSIONS.find((entry) => entry.id === String(cfg.expressVersion));
  if (!expressVersion) return { error: "Choose Express 4 or Express 5." };
  if (!VALIDATORS.some((entry) => entry.id === cfg.validator)) {
    return { error: "Choose a validation library, or none." };
  }

  const selected = (cfg.operations || []).filter((id) => OPERATION_BY_ID.has(id));
  if (selected.length === 0) return { error: "Select at least one route to generate." };

  const basePath = normalisePath(cfg.basePath);
  if (basePath && /\s/.test(basePath)) return { error: "The base path cannot contain spaces." };
  if (basePath && !/^\/[A-Za-z0-9/_-]*$/.test(basePath)) {
    return { error: "Use only letters, digits, slash, dash and underscore in the base path." };
  }

  const esm = cfg.moduleSystem === "esm";
  const ext = ".js";
  const wrap = expressVersion.asyncWrapper;
  const mountPath = `${basePath}/${pluralPath}`;

  const warnings = [];
  if (wrap) {
    warnings.push(
      "Express 4 ignores the promise an async handler returns, so a rejection never reaches your error middleware and the request hangs. Every async route below is wrapped in asyncHandler for that reason.",
    );
  } else {
    warnings.push(
      "Express 5 forwards a rejected promise from an async handler to next() automatically, so no wrapper is needed. It also changed path syntax: a bare * wildcard is invalid and must be named, as in /*splat.",
    );
  }
  if (selected.includes("list") && !cfg.pagination) {
    warnings.push(
      "A list route with no pagination returns the whole table. Add a limit before this reaches a dataset you do not control.",
    );
  }
  if (!cfg.requireAuth) {
    warnings.push("No authentication middleware was added, so every route below is public.");
  }
  if (cfg.validator === "none" && (selected.includes("create") || selected.includes("update"))) {
    warnings.push(
      "Create and update routes are generated without a validation layer, so req.body reaches your service exactly as the client sent it.",
    );
  }

  /* ---------------- imports ---------------- */
  const imports = [];
  if (esm) {
    imports.push('import { Router } from "express";');
    if (cfg.validator === "express-validator") {
      imports.push('import { body, param, query, validationResult } from "express-validator";');
    }
    if (cfg.validator === "zod") imports.push(`import { ${camel}CreateSchema, ${camel}UpdateSchema, ${camel}QuerySchema } from "../validators/${kebab}.js";`);
    if (wrap) imports.push('import { asyncHandler } from "../middleware/async-handler.js";');
    if (cfg.requireAuth) imports.push('import { requireAuth } from "../middleware/require-auth.js";');
    imports.push(`import * as ${pluralCamel}Service from "../services/${pluralPath}.js";`);
  } else {
    imports.push('const { Router } = require("express");');
    if (cfg.validator === "express-validator") {
      imports.push('const { body, param, query, validationResult } = require("express-validator");');
    }
    if (cfg.validator === "zod") imports.push(`const { ${camel}CreateSchema, ${camel}UpdateSchema, ${camel}QuerySchema } = require("../validators/${kebab}");`);
    if (wrap) imports.push('const { asyncHandler } = require("../middleware/async-handler");');
    if (cfg.requireAuth) imports.push('const { requireAuth } = require("../middleware/require-auth");');
    imports.push(`const ${pluralCamel}Service = require("../services/${pluralPath}");`);
  }

  const open = wrap ? "asyncHandler(" : "";
  const close = wrap ? ")" : "";
  const guards = cfg.requireAuth ? "requireAuth, " : "";

  const idPattern = "/:id";

  /* ---------------- route handlers ---------------- */
  const routes = [];

  if (selected.includes("list")) {
    const body = [];
    if (cfg.validator === "zod") {
      body.push(`    const query = ${camel}QuerySchema.parse(req.query);`);
    } else if (cfg.pagination) {
      body.push(
        `    const limit = Math.min(Number(req.query.limit) || ${DEFAULT_PAGE_SIZE}, ${MAX_PAGE_SIZE});`,
        "    const offset = Math.max(Number(req.query.offset) || 0, 0);",
        "    const query = { limit, offset };",
      );
    } else {
      body.push("    const query = {};");
    }
    body.push(`    const { rows, total } = await ${pluralCamel}Service.list(query);`);
    body.push(
      cfg.pagination
        ? "    res.status(200).json({ data: rows, total, limit: query.limit, offset: query.offset });"
        : "    res.status(200).json({ data: rows, total });",
    );
    routes.push({
      id: "list",
      method: "get",
      path: "/",
      code: [
        `// GET ${mountPath} — 200 with the page and the total count`,
        `router.get("/", ${guards}${cfg.validator === "express-validator" ? "listRules, checkValidation, " : ""}${open}async (req, res) => {`,
        ...body,
        `}${close});`,
      ].join("\n"),
    });
  }

  if (selected.includes("get")) {
    routes.push({
      id: "get",
      method: "get",
      path: idPattern,
      code: [
        `// GET ${mountPath}/:id — 200, or 404 when the row does not exist`,
        `router.get("${idPattern}", ${guards}${open}async (req, res) => {`,
        `    const record = await ${pluralCamel}Service.findById(req.params.id);`,
        "    if (!record) {",
        `      return res.status(404).json({ error: "${pascal} not found", id: req.params.id });`,
        "    }",
        "    res.status(200).json({ data: record });",
        `}${close});`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  if (selected.includes("create")) {
    const body = [];
    if (cfg.validator === "zod") body.push(`    const payload = ${camel}CreateSchema.parse(req.body);`);
    else body.push("    const payload = req.body;");
    body.push(
      `    const created = await ${pluralCamel}Service.create(payload);`,
      `    res.status(201).location(\`${mountPath}/\${created.id}\`).json({ data: created });`,
    );
    routes.push({
      id: "create",
      method: "post",
      path: "/",
      code: [
        `// POST ${mountPath} — 201 plus a Location header (RFC 9110 §15.3.2)`,
        `router.post("/", ${guards}${cfg.validator === "express-validator" ? "createRules, checkValidation, " : ""}${open}async (req, res) => {`,
        ...body,
        `}${close});`,
      ].join("\n"),
    });
  }

  if (selected.includes("update")) {
    const body = [];
    if (cfg.validator === "zod") body.push(`    const patch = ${camel}UpdateSchema.parse(req.body);`);
    else body.push("    const patch = req.body;");
    body.push(
      `    const updated = await ${pluralCamel}Service.update(req.params.id, patch);`,
      "    if (!updated) {",
      `      return res.status(404).json({ error: "${pascal} not found", id: req.params.id });`,
      "    }",
      "    res.status(200).json({ data: updated });",
    );
    routes.push({
      id: "update",
      method: "patch",
      path: idPattern,
      code: [
        `// PATCH ${mountPath}/:id — partial update, 200 with the new state`,
        `router.patch("${idPattern}", ${guards}${cfg.validator === "express-validator" ? "updateRules, checkValidation, " : ""}${open}async (req, res) => {`,
        ...body,
        `}${close});`,
      ].join("\n"),
    });
  }

  if (selected.includes("remove")) {
    routes.push({
      id: "remove",
      method: "delete",
      path: idPattern,
      code: [
        `// DELETE ${mountPath}/:id — 204 and no body (RFC 9110 §15.3.5)`,
        `router.delete("${idPattern}", ${guards}${open}async (req, res) => {`,
        `    const removed = await ${pluralCamel}Service.remove(req.params.id);`,
        "    if (!removed) {",
        `      return res.status(404).json({ error: "${pascal} not found", id: req.params.id });`,
        "    }",
        "    res.status(204).end();",
        `}${close});`,
      ].join("\n"),
    });
  }

  /* ---------------- express-validator rule blocks ---------------- */
  const validatorBlocks = [];
  if (cfg.validator === "express-validator") {
    validatorBlocks.push(
      [
        "// express-validator collects errors on the request; this middleware turns them into a 422.",
        "function checkValidation(req, res, next) {",
        "  const result = validationResult(req);",
        "  if (result.isEmpty()) return next();",
        '  res.status(422).json({ error: "Validation failed", details: result.array() });',
        "}",
      ].join("\n"),
    );
    if (selected.includes("list")) {
      validatorBlocks.push(
        [
          "const listRules = [",
          `  query("limit").optional().isInt({ min: 1, max: ${MAX_PAGE_SIZE} }).toInt(),`,
          '  query("offset").optional().isInt({ min: 0 }).toInt(),',
          "];",
        ].join("\n"),
      );
    }
    if (selected.includes("create")) {
      validatorBlocks.push(
        [
          "const createRules = [",
          '  body("name").isString().trim().isLength({ min: 1, max: 200 }),',
          '  body("amount").isFloat({ min: 0 }).toFloat(),',
          "];",
        ].join("\n"),
      );
    }
    if (selected.includes("update")) {
      validatorBlocks.push(
        [
          "const updateRules = [",
          '  param("id").isString().notEmpty(),',
          '  body("name").optional().isString().trim().isLength({ min: 1, max: 200 }),',
          '  body("amount").optional().isFloat({ min: 0 }).toFloat(),',
          "];",
        ].join("\n"),
      );
    }
  }

  const routerFile = [
    ...imports,
    "",
    "const router = Router();",
    ...(validatorBlocks.length ? ["", ...validatorBlocks] : []),
    "",
    "// Registration order matters: Express matches routes in the order they are added,",
    "// so any literal segment must be registered before the /:id route below it.",
    "",
    routes.map((route) => route.code).join("\n\n"),
    "",
    esm ? "export default router;" : "module.exports = router;",
    "",
  ].join("\n");

  /* ---------------- supporting files ---------------- */
  const files = [{ name: `routes/${pluralPath}${ext}`, language: "javascript", code: routerFile }];

  if (wrap) {
    files.push({
      name: `middleware/async-handler${ext}`,
      language: "javascript",
      code: [
        "// Express 4 never looks at the promise a handler returns, so a rejection is lost and the",
        "// request hangs until it times out. Wrapping forwards the rejection to next(), which is",
        "// what routes it to the four-argument error middleware. Express 5 does this for you.",
        `${esm ? "export " : ""}function asyncHandler(handler) {`,
        "  return function wrapped(req, res, next) {",
        "    Promise.resolve(handler(req, res, next)).catch(next);",
        "  };",
        "}",
        ...(esm ? [] : ["", "module.exports = { asyncHandler };"]),
        "",
      ].join("\n"),
    });
  }

  if (cfg.requireAuth) {
    files.push({
      name: `middleware/require-auth${ext}`,
      language: "javascript",
      code: [
        "// STUB — this only checks that an Authorization header is present. It does NOT verify",
        "// a session or a token, so every request with any Bearer value is let through. Replace",
        "// the body below with real session lookup or JWT verification (and set req.user) before",
        "// this ever reaches a real deployment.",
        `${esm ? "export " : ""}function requireAuth(req, res, next) {`,
        '  const header = req.headers.authorization || "";',
        '  if (!header.startsWith("Bearer ")) {',
        '    return res.status(401).json({ error: "Authentication required" });',
        "  }",
        "  // TODO: verify header.slice(7) (e.g. jwt.verify) and attach the user to req.user.",
        "  next();",
        "}",
        ...(esm ? [] : ["", "module.exports = { requireAuth };"]),
        "",
      ].join("\n"),
    });
  }

  files.push({
    name: `middleware/error-handler${ext}`,
    language: "javascript",
    code: [
      "// Express identifies an error handler by its ARITY: it must declare exactly four",
      "// parameters. Removing `next` turns this back into ordinary middleware and errors",
      "// stop being handled, with no warning. Register it after every route.",
      ...(cfg.validator === "zod"
        ? [esm ? 'import { ZodError } from "zod";' : 'const { ZodError } = require("zod");', ""]
        : []),
      `${esm ? "export " : ""}function errorHandler(err, req, res, next) {`,
      "  if (res.headersSent) return next(err);",
      "",
      ...(cfg.validator === "zod"
        ? [
            "  if (err instanceof ZodError) {",
            '    return res.status(422).json({ error: "Validation failed", details: err.issues });',
            "  }",
            "",
          ]
        : []),
      "  // A duplicate unique key is a conflict, not a server fault.",
      '  if (err.code === "23505" || err.code === "ER_DUP_ENTRY") {',
      '    return res.status(409).json({ error: "That record already exists" });',
      "  }",
      "",
      "  const status = Number.isInteger(err.status) ? err.status : 500;",
      "  if (status >= 500) req.log?.error?.({ err }, \"unhandled error\");",
      "  res.status(status).json({",
      '    error: status >= 500 ? "Internal server error" : err.message,',
      "  });",
      "}",
      ...(esm ? [] : ["", "module.exports = { errorHandler };"]),
      "",
    ].join("\n"),
  });

  if (cfg.validator === "zod") {
    files.push({
      name: `validators/${kebab}${ext}`,
      language: "javascript",
      code: [
        esm ? 'import { z } from "zod";' : 'const { z } = require("zod");',
        "",
        `${esm ? "export " : ""}const ${camel}CreateSchema = z.object({`,
        "  name: z.string().trim().min(1).max(200),",
        "  amount: z.number().nonnegative(),",
        "});",
        "",
        "// Partial for PATCH, and .strict() so an unexpected field is an error rather than",
        "// silently dropped — that is what stops a typo'd field from looking like a success.",
        `${esm ? "export " : ""}const ${camel}UpdateSchema = ${camel}CreateSchema.partial().strict();`,
        "",
        `${esm ? "export " : ""}const ${camel}QuerySchema = z.object({`,
        ...(cfg.pagination
          ? [
              `  limit: z.coerce.number().int().min(1).max(${MAX_PAGE_SIZE}).default(${DEFAULT_PAGE_SIZE}),`,
              "  offset: z.coerce.number().int().min(0).default(0),",
            ]
          : []),
        "});",
        ...(esm
          ? []
          : ["", `module.exports = { ${camel}CreateSchema, ${camel}UpdateSchema, ${camel}QuerySchema };`]),
        "",
      ].join("\n"),
    });
  }

  files.push({
    name: `app${ext} (mounting)`,
    language: "javascript",
    code: [
      esm ? 'import express from "express";' : 'const express = require("express");',
      esm
        ? `import ${pluralCamel}Router from "./routes/${pluralPath}.js";`
        : `const ${pluralCamel}Router = require("./routes/${pluralPath}");`,
      esm
        ? 'import { errorHandler } from "./middleware/error-handler.js";'
        : 'const { errorHandler } = require("./middleware/error-handler");',
      "",
      "const app = express();",
      "app.use(express.json());",
      `app.use("${mountPath}", ${pluralCamel}Router);`,
      "",
      "// The error handler goes LAST, after every route and router.",
      "app.use(errorHandler);",
      "",
      ...(esm ? ["export default app;"] : ["module.exports = app;"]),
      "",
    ].join("\n"),
  });

  const packages = ["express"];
  const validator = VALIDATORS.find((entry) => entry.id === cfg.validator);
  if (validator && validator.package) packages.push(validator.package);

  return {
    files,
    warnings,
    routes: routes.map((route) => ({
      id: route.id,
      method: route.method.toUpperCase(),
      path: `${mountPath}${route.path === "/" ? "" : route.path}`,
      status: OPERATION_BY_ID.get(route.id).status,
    })),
    names: { camel, pascal, kebab, plural: pluralPath, pluralCamel, mountPath },
    install: `npm install ${packages.join(" ")}`,
  };
}
