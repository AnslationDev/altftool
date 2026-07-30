import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse } from "@babel/parser";
import {
  EXACT_ROUTE_REDIRECT_STATUS,
  SUPPORT_SETTING_ROUTE_COUNT,
  TRANSFORM_PAGE_ROUTE_COUNT,
  getExactRouteRedirect,
  isKnownSupportSettingPath,
  isKnownTransformPagePath,
} from "./exactRouteManifest.js";

const SUPPORT_DATA_ROOT = path.resolve(
  import.meta.dirname,
  "../../app/supportsetting/data",
);
const TRANSFORM_MANIFEST_PATH = path.resolve(
  import.meta.dirname,
  "../../app/transform/_data/transform.manifest.json",
);

function parseModule(filePath) {
  return parse(readFileSync(filePath, "utf8"), {
    sourceType: "module",
    plugins: ["jsx"],
  });
}

function findVariableInitializer(filePath, variableName) {
  const ast = parseModule(filePath);
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === "ExportNamedDeclaration"
        ? statement.declaration
        : statement;
    if (declaration?.type !== "VariableDeclaration") continue;
    for (const item of declaration.declarations) {
      if (item.id.type === "Identifier" && item.id.name === variableName) {
        return item.init;
      }
    }
  }
  throw new Error(`${variableName} was not found in ${filePath}`);
}

function readObjectString(objectNode, propertyName) {
  assert.equal(objectNode?.type, "ObjectExpression");
  const property = objectNode.properties.find((candidate) => {
    if (candidate.type !== "ObjectProperty") return false;
    return (
      (candidate.key.type === "Identifier" &&
        candidate.key.name === propertyName) ||
      (candidate.key.type === "StringLiteral" &&
        candidate.key.value === propertyName)
    );
  });
  assert.equal(
    property?.value?.type,
    "StringLiteral",
    `Expected string property ${propertyName}`,
  );
  return property.value.value;
}

function readArrayObjects(filePath, variableName) {
  const initializer = findVariableInitializer(filePath, variableName);
  assert.equal(initializer?.type, "ArrayExpression");
  return initializer.elements.filter(
    (element) => element?.type === "ObjectExpression",
  );
}

function readObjectKeys(filePath, variableName) {
  const initializer = findVariableInitializer(filePath, variableName);
  assert.equal(initializer?.type, "ObjectExpression");
  return initializer.properties.map((property) => {
    assert.equal(property.type, "ObjectProperty");
    assert.ok(
      property.key.type === "Identifier" ||
        property.key.type === "StringLiteral",
    );
    return property.key.type === "Identifier"
      ? property.key.name
      : property.key.value;
  });
}

function reconstructSupportSettingRoutes() {
  const routes = new Set(["/supportsetting"]);
  const platforms = {
    windows: "windowsSettings",
    macos: "macosSettings",
    android: "androidSettings",
    ios: "iosSettings",
  };
  const categories = readArrayObjects(
    path.join(SUPPORT_DATA_ROOT, "categories.js"),
    "CATEGORIES",
  ).map((category) => readObjectString(category, "id"));

  for (const [platform, exportName] of Object.entries(platforms)) {
    routes.add(`/supportsetting/${platform}`);
    for (const category of categories) {
      routes.add(`/supportsetting/${platform}/category/${category}`);
    }
    const settings = readArrayObjects(
      path.join(SUPPORT_DATA_ROOT, "platforms", `${platform}.js`),
      exportName,
    );
    for (const setting of settings) {
      routes.add(
        `/supportsetting/${platform}/${readObjectString(setting, "id")}`,
      );
    }
  }

  const deviceIds = readArrayObjects(
    path.join(SUPPORT_DATA_ROOT, "deviceTaxonomy.js"),
    "DEVICES",
  )
    .map((device) => readObjectString(device, "id"))
    .filter((deviceId) => !Object.hasOwn(platforms, deviceId));
  for (const deviceId of deviceIds) {
    routes.add(`/supportsetting/${deviceId}`);
  }

  const deviceDirectory = path.join(SUPPORT_DATA_ROOT, "devices");
  for (const fileName of readdirSync(deviceDirectory)) {
    if (!fileName.endsWith(".js") || fileName === "index.js") continue;
    const filePath = path.join(deviceDirectory, fileName);
    const source = readFileSync(filePath, "utf8");
    const exportName = source.match(
      /export const ([A-Za-z0-9]+Settings)\s*=\s*\[/,
    )?.[1];
    if (!exportName) continue;

    for (const setting of readArrayObjects(filePath, exportName)) {
      const deviceId = readObjectString(setting, "platform");
      assert.ok(
        deviceIds.includes(deviceId),
        `${deviceId} has settings but is missing from DEVICES`,
      );
      routes.add(
        `/supportsetting/${deviceId}/${readObjectString(setting, "id")}`,
      );
    }
  }

  for (const fileName of [
    "aiToolsPart1.js",
    "aiToolsPart2.js",
    "aiToolsPart3.js",
  ]) {
    const exportName = fileName.replace(".js", "");
    for (const tool of readArrayObjects(
      path.join(SUPPORT_DATA_ROOT, fileName),
      exportName,
    )) {
      const id = readObjectString(tool, "id");
      assert.match(id, /^ai-/);
      routes.add(`/supportsetting/ai-tools/${id.slice("ai-".length)}`);
    }
  }

  for (const utilityId of readObjectKeys(
    path.join(SUPPORT_DATA_ROOT, "routes.js"),
    "UTIL_TITLES",
  )) {
    assert.match(utilityId, /^util-/);
    routes.add(`/supportsetting/help/${utilityId.slice("util-".length)}`);
  }

  return routes;
}

test("Support Settings exact manifest is complete against every canonical catalogue", () => {
  const expectedRoutes = reconstructSupportSettingRoutes();
  assert.equal(SUPPORT_SETTING_ROUTE_COUNT, expectedRoutes.size);
  for (const route of expectedRoutes) {
    assert.equal(isKnownSupportSettingPath(route), true, route);
    assert.equal(getExactRouteRedirect(route), null, route);
  }
});

test("Support Settings rejects unknown, nested, and trailing-segment paths", () => {
  const invalidPaths = [
    "/supportsetting/asdkjh-not-real",
    "/supportsetting/help",
    "/supportsetting/help/not-real",
    "/supportsetting/help/faq/not-real",
    "/supportsetting/ai-tools",
    "/supportsetting/ai-tools/chatgpt/not-real",
    "/supportsetting/windows/category",
    "/supportsetting/windows/category/not-real",
    "/supportsetting/windows/windows-update/not-real",
    "/supportsetting/linux/linux-system-update/not-real/",
    "/supportsetting/windows//windows-update",
  ];
  for (const route of invalidPaths) {
    assert.equal(isKnownSupportSettingPath(route), false, route);
    assert.equal(getExactRouteRedirect(route), "/supportsetting", route);
  }

  assert.equal(isKnownSupportSettingPath("/supportsetting/windows/"), true);
  assert.equal(
    isKnownSupportSettingPath(
      "/supportsetting/windows/windows-update/",
    ),
    true,
  );
  assert.equal(EXACT_ROUTE_REDIRECT_STATUS, 308);
});

test("Transform exact manifest matches all 64 converter slugs", () => {
  const manifest = JSON.parse(readFileSync(TRANSFORM_MANIFEST_PATH, "utf8"));
  const expectedRoutes = new Set([
    "/transform",
    ...manifest.tools.map((tool) => `/transform/${tool.slug}`),
  ]);

  assert.equal(TRANSFORM_PAGE_ROUTE_COUNT, manifest.tools.length);
  assert.equal(expectedRoutes.size, TRANSFORM_PAGE_ROUTE_COUNT + 1);
  for (const route of expectedRoutes) {
    assert.equal(isKnownTransformPagePath(route), true, route);
    assert.equal(getExactRouteRedirect(route), null, route);
  }
});

test("Transform rejects unknown page paths but never intercepts its API", () => {
  for (const route of [
    "/transform/not-a-converter",
    "/transform/svg-to-jsx/not-real",
    "/transform/svg-to-jsx/not-real/",
    "/transform//svg-to-jsx",
    "/transform/apiary",
  ]) {
    assert.equal(isKnownTransformPagePath(route), false, route);
    assert.equal(getExactRouteRedirect(route), "/transform", route);
  }

  assert.equal(isKnownTransformPagePath("/transform/svg-to-jsx/"), true);
  assert.equal(getExactRouteRedirect("/transform/api"), "/transform");
  assert.equal(getExactRouteRedirect("/transform/api/svg-to-jsx"), null);
  assert.equal(getExactRouteRedirect("/transform/api/not-real/nested"), null);
  assert.equal(getExactRouteRedirect("/outside/not-real"), null);
});
