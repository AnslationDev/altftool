import { expect, test } from "@playwright/test";
import {
  isDisplayableAcademy,
  isDisplayableExtension,
  isDisplayableTrendingVideo,
  normalizeAcademy,
  normalizeExtension,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const firebaseApiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const firebaseProjectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const altfProjectId = "altftool";
const contentTimeoutMs = Number(process.env.ALTFT_FIREBASE_PUBLIC_CONTENT_TIMEOUT_MS || 60_000);

function firestoreCollectionUrl(path, params = {}) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/${path}`,
  );
  url.searchParams.set("key", firebaseApiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function firestoreParentUrl(parentPath, endpoint) {
  return `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/${parentPath}:${endpoint}?key=${firebaseApiKey}`;
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]),
  );
}

async function listDocuments(path, pageSize = 20) {
  const response = await fetch(firestoreCollectionUrl(path, { pageSize }));
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${path} list failed with HTTP ${response.status}`);
  }

  return (payload.documents || []).map((document) => ({
    id: document.name?.split("/").pop() || "",
    ...decodeFields(document.fields || {}),
  }));
}

async function runQuery(parentPath, structuredQuery) {
  const response = await fetch(firestoreParentUrl(parentPath, "runQuery"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${parentPath}:runQuery failed with HTTP ${response.status}`);
  }

  return Array.isArray(payload) ? payload : [];
}

async function getLivePublicContent() {
  const blogRows = await runQuery(`projects/${altfProjectId}`, {
    select: {
      fields: [
        { fieldPath: "heading" },
        { fieldPath: "slug" },
        { fieldPath: "status" },
        { fieldPath: "createdAt" },
      ],
    },
    from: [{ collectionId: "blogs" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "status" },
        op: "EQUAL",
        value: { stringValue: "published" },
      },
    },
    orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    limit: 3,
  });

  const blogs = blogRows
    .filter((row) => row.document)
    .map((row) => decodeFields(row.document.fields || {}))
    .filter((row) => row.heading && row.slug);

  const extensions = (await listDocuments(`projects/${altfProjectId}/extensions`, 30))
    .map((row) => normalizeExtension(row, row.id))
    .filter(isDisplayableExtension)
    .sort((a, b) => a.name.localeCompare(b.name));

  const academies = (await listDocuments(`projects/${altfProjectId}/academy`, 30))
    .map((row) => normalizeAcademy(row, row.id))
    .filter(isDisplayableAcademy);

  const trendingVideos = (await listDocuments(`projects/${altfProjectId}/trendingvideos`, 30))
    .map((row) => normalizeTrendingVideo(row, row.id))
    .filter((row) => row.type === "video")
    .filter(isDisplayableTrendingVideo);

  return {
    academy: academies[0],
    blog: blogs[0],
    extension: extensions[0],
    trendingVideo: trendingVideos[0],
  };
}

async function openPublicPage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: contentTimeoutMs,
  });
  expect(response?.ok(), `${route} response`).toBeTruthy();
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

async function expectBodyContains(page, text, label) {
  await expect(page.locator("body"), label).toContainText(text, {
    timeout: contentTimeoutMs,
  });
}

async function revealLazySections(page) {
  const checkpoints = [0.25, 0.5, 0.75, 1];

  for (const checkpoint of checkpoints) {
    await page.evaluate((ratio) => {
      window.scrollTo({
        top: document.body.scrollHeight * ratio,
        behavior: "instant",
      });
    }, checkpoint);
    await page.waitForTimeout(750);
  }
}

test.describe("Firebase-backed public pages", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test("live Firebase rows render on public content pages", async ({ page }) => {
    const live = await getLivePublicContent();
    expect(live.blog?.heading, "published blog from Firebase").toBeTruthy();
    expect(live.extension?.name, "displayable extension from Firebase").toBeTruthy();
    expect(live.academy?.name, "displayable academy from Firebase").toBeTruthy();
    expect(live.trendingVideo?.title, "displayable trending video from Firebase").toBeTruthy();

    const quality = createPageQualityGate(page);

    await openPublicPage(page, "/blogs");
    await expectBodyContains(page, live.blog.heading, "Firebase blog heading");
    await expect(page.locator("body")).not.toContainText("BlogsPage Firebase catalog failed");
    await quality.expectClean("Firebase blogs page");

    await openPublicPage(page, "/extensions");
    await expectBodyContains(page, live.extension.name, "Firebase extension name");
    await expect(page.locator("body")).not.toContainText("Live extensions could not refresh");
    await quality.expectClean("Firebase extensions page");

    await openPublicPage(page, "/academy");
    await revealLazySections(page);
    await expectBodyContains(page, live.academy.name, "Firebase academy name");
    await expect(page.locator("body")).not.toContainText("Academy live data is unavailable");
    await quality.expectClean("Firebase academy page");

    await openPublicPage(page, "/trendingvids");
    await revealLazySections(page);
    await expectBodyContains(page, live.trendingVideo.title, "Firebase trending video title");
    await expect(page.locator("body")).not.toContainText("Live videos could not refresh");
    await quality.expectClean("Firebase trending videos page");
  });
});
