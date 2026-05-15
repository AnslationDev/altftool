import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  isDisplayableAcademy,
  isDisplayableExtension,
  isDisplayableTrendingVideo,
  normalizeAcademy,
  normalizeExtension,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";
import { normalizeBuySmartCategory } from "@altftool/core/buysmart";
import {
  ALTFT_ACADEMY_COLLECTION_PATH,
  ALTFT_BLOGS_COLLECTION_PATH,
  ALTFT_EXTENSIONS_COLLECTION_PATH,
  ALTFT_TRENDING_VIDEOS_COLLECTION_PATH,
  buySmartDocPath,
} from "@altftool/core/firebasePaths";

const root = path.resolve(import.meta.dirname, "..");
const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "altftool-admin-web-sync-test";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST?.split(":") || ["127.0.0.1", "8080"];

let testEnv;

test.before(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId,
      firestore: {
        host: firestoreHost[0],
        port: Number(firestoreHost[1] || 8080),
        rules: readFileSync(path.join(root, "firestore.rules"), "utf8"),
      },
    });
  } catch (error) {
    const message = error?.cause?.code === "ECONNREFUSED"
      ? `Firestore emulator is not running at ${firestoreHost.join(":")}. Run npm run test:admin-web-sync:emulator from the repo root.`
      : error?.message || "Unable to initialize Firestore test environment.";

    throw new Error(message, { cause: error });
  }
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "admins/active-admin"), { isActive: true, roleType: "admin" });
    await setDoc(doc(db, "admins/inactive-admin"), { isActive: false, roleType: "admin" });
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

function documentPath(collectionPath, id) {
  return [...collectionPath, id];
}

function snapshotData(snapshot) {
  assert.equal(snapshot.exists(), true, `${snapshot.ref.path} should exist`);
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function readPublicDocument(db, pathParts) {
  return assertSucceeds(getDoc(doc(db, ...pathParts)));
}

async function assertDeletedForPublic(db, pathParts) {
  const snapshot = await readPublicDocument(db, pathParts);
  assert.equal(snapshot.exists(), false, `${pathParts.join("/")} should be deleted`);
}

async function runAdminToPublicCrudCase({
  name,
  pathParts,
  create,
  update,
  normalize,
  assertCreated,
  assertUpdated,
}) {
  const adminDb = testEnv.authenticatedContext("active-admin").firestore();
  const publicDb = testEnv.unauthenticatedContext().firestore();
  const adminRef = doc(adminDb, ...pathParts);

  await assertSucceeds(setDoc(adminRef, {
    ...create,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  let publicSnapshot = await readPublicDocument(publicDb, pathParts);
  let normalized = normalize(snapshotData(publicSnapshot), publicSnapshot.id);
  assertCreated(normalized);

  await assertSucceeds(updateDoc(adminRef, {
    ...update,
    updatedAt: serverTimestamp(),
  }));

  publicSnapshot = await readPublicDocument(publicDb, pathParts);
  normalized = normalize(snapshotData(publicSnapshot), publicSnapshot.id);
  assertUpdated(normalized);

  await assertSucceeds(deleteDoc(adminRef));
  await assertDeletedForPublic(publicDb, pathParts);

  assert.ok(true, `${name} admin-to-public CRUD flow passed`);
}

test("admin-created content is web-readable, normalized, updated, and deleted", async () => {
  const cases = [
    {
      name: "extensions",
      pathParts: documentPath(ALTFT_EXTENSIONS_COLLECTION_PATH, "sync-extension"),
      create: {
        name: "Sync Test Extension",
        slug: "sync-test-extension",
        category: "Utilities & Calculators",
        description: "Created by the admin-to-web sync test.",
        rating: 4.2,
        features: ["Admin write", "Public read"],
      },
      update: {
        name: "Sync Test Extension Updated",
        rating: 4.9,
      },
      normalize: normalizeExtension,
      assertCreated: (item) => {
        assert.equal(isDisplayableExtension(item), true);
        assert.equal(item.name, "Sync Test Extension");
        assert.equal(item.slug, "sync-test-extension");
      },
      assertUpdated: (item) => {
        assert.equal(isDisplayableExtension(item), true);
        assert.equal(item.name, "Sync Test Extension Updated");
        assert.equal(item.rating, 4.9);
      },
    },
    {
      name: "academy",
      pathParts: documentPath(ALTFT_ACADEMY_COLLECTION_PATH, "sync-academy"),
      create: {
        name: "Sync Test Academy",
        category: "Skills & Career Growth",
        subCategory: "Development",
        description: "Created by the admin-to-web sync test.",
        rating: 4.4,
        price: 0,
        features: ["Projects"],
        academyUrl: "https://example.com/sync-academy",
      },
      update: {
        name: "Sync Test Academy Updated",
        rating: 4.8,
      },
      normalize: normalizeAcademy,
      assertCreated: (item) => {
        assert.equal(isDisplayableAcademy(item), true);
        assert.equal(item.name, "Sync Test Academy");
        assert.equal(item.category, "Skills & Career Growth");
      },
      assertUpdated: (item) => {
        assert.equal(isDisplayableAcademy(item), true);
        assert.equal(item.name, "Sync Test Academy Updated");
        assert.equal(item.rating, 4.8);
      },
    },
    {
      name: "trending videos",
      pathParts: documentPath(ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, "sync-video"),
      create: {
        name: "Sync Test Video",
        category: "Technology",
        description: "Created by the admin-to-web sync test.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        channelName: "AltFTool QA",
        type: "video",
      },
      update: {
        name: "Sync Test Video Updated",
        type: "shorts",
      },
      normalize: normalizeTrendingVideo,
      assertCreated: (item) => {
        assert.equal(isDisplayableTrendingVideo(item), true);
        assert.equal(item.title, "Sync Test Video");
        assert.equal(item.type, "video");
      },
      assertUpdated: (item) => {
        assert.equal(isDisplayableTrendingVideo(item), true);
        assert.equal(item.title, "Sync Test Video Updated");
        assert.equal(item.type, "shorts");
      },
    },
    {
      name: "blogs",
      pathParts: documentPath(ALTFT_BLOGS_COLLECTION_PATH, "sync-blog"),
      create: {
        heading: "Sync Test Blog",
        slug: "sync-test-blog",
        status: "draft",
        category: "QA",
        description: "Created by the admin-to-web sync test.",
      },
      update: {
        status: "published",
        heading: "Sync Test Blog Updated",
      },
      normalize: (item) => item,
      assertCreated: (item) => {
        assert.equal(item.heading, "Sync Test Blog");
        assert.equal(item.status, "draft");
      },
      assertUpdated: (item) => {
        assert.equal(item.heading, "Sync Test Blog Updated");
        assert.equal(item.status, "published");
      },
    },
  ];

  for (const crudCase of cases) {
    await runAdminToPublicCrudCase(crudCase);
  }
});

test("admin BuySmart document edits are immediately web-readable as normalized offers", async () => {
  const adminDb = testEnv.authenticatedContext("active-admin").firestore();
  const publicDb = testEnv.unauthenticatedContext().firestore();
  const pathParts = buySmartDocPath("categories");
  const adminRef = doc(adminDb, ...pathParts);

  await assertSucceeds(setDoc(adminRef, {
    banner: [
      {
        title: "Sync Store",
        link: "https://sync.example.com",
        discount: "20% off",
        status: "active",
        verified: true,
      },
    ],
    updatedAt: serverTimestamp(),
  }));

  let snapshot = await readPublicDocument(publicDb, pathParts);
  let offer = normalizeBuySmartCategory(snapshotData(snapshot).banner[0]);
  assert.equal(offer.title, "Sync Store");
  assert.equal(offer.storePath, "/buysmart/stores/sync-example-com");
  assert.equal(offer.verified, true);

  await assertSucceeds(updateDoc(adminRef, {
    banner: [
      {
        title: "Sync Store Updated",
        link: "https://sync.example.com",
        cashback: "5%",
        status: "active",
      },
    ],
    updatedAt: serverTimestamp(),
  }));

  snapshot = await readPublicDocument(publicDb, pathParts);
  offer = normalizeBuySmartCategory(snapshotData(snapshot).banner[0]);
  assert.equal(offer.title, "Sync Store Updated");
  assert.equal(offer.cashback, "5%");
  assert.equal(offer.offerType, "cashback");

  await assertSucceeds(deleteDoc(adminRef));
  await assertDeletedForPublic(publicDb, pathParts);
});

test("inactive admin writes do not leak into public web reads", async () => {
  const inactiveDb = testEnv.authenticatedContext("inactive-admin").firestore();
  const publicDb = testEnv.unauthenticatedContext().firestore();
  const pathParts = documentPath(ALTFT_EXTENSIONS_COLLECTION_PATH, "blocked-sync-extension");

  await assertFails(setDoc(doc(inactiveDb, ...pathParts), {
    name: "Blocked Sync Extension",
    slug: "blocked-sync-extension",
  }));

  await assertDeletedForPublic(publicDb, pathParts);
});
