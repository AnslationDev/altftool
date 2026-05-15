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
  setDoc,
  updateDoc,
} from "firebase/firestore";

const root = path.resolve(import.meta.dirname, "..");
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "altftool-admin-crud-test";
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
      ? `Firestore emulator is not running at ${firestoreHost.join(":")}. Run npm run test:admin-crud:emulator from the repo root.`
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

async function assertCrudSucceeds(db, documentPath, createPayload, updatePayload) {
  const documentRef = doc(db, documentPath);

  await assertSucceeds(setDoc(documentRef, createPayload));
  await assertSucceeds(getDoc(documentRef).then((snapshot) => {
    if (!snapshot.exists()) throw new Error(`${documentPath} was not created.`);
  }));

  await assertSucceeds(updateDoc(documentRef, updatePayload));
  await assertSucceeds(getDoc(documentRef).then((snapshot) => {
    for (const [key, expected] of Object.entries(updatePayload)) {
      if (snapshot.data()?.[key] !== expected) {
        throw new Error(`${documentPath} did not persist ${key}.`);
      }
    }
  }));

  await assertSucceeds(deleteDoc(documentRef));
  await assertSucceeds(getDoc(documentRef).then((snapshot) => {
    if (snapshot.exists()) throw new Error(`${documentPath} was not deleted.`);
  }));
}

const adminCrudCases = [
  {
    name: "ads",
    path: "projects/altftool/ads/emulator-ad",
    create: {
      title: "Emulator Ad",
      placement: "home_top",
      status: "active",
      imageUrl: "https://example.com/ad.png",
    },
    update: { status: "paused" },
  },
  {
    name: "blogs",
    path: "projects/altftool/blogs/emulator-blog",
    create: {
      heading: "Emulator Blog",
      slug: "emulator-blog",
      status: "draft",
      viewsCount: 0,
      likesCount: 0,
    },
    update: { status: "published" },
  },
  {
    name: "extensions",
    path: "projects/altftool/extensions/emulator-extension",
    create: {
      name: "Emulator Extension",
      slug: "emulator-extension",
      category: "Utilities & Calculators",
      description: "Test extension",
      icon: "Puzzle",
      rating: 4.5,
      features: ["Fast setup"],
      hasChromeStore: false,
    },
    update: { rating: 5 },
  },
  {
    name: "academy",
    path: "projects/altftool/academy/emulator-academy",
    create: {
      name: "Emulator Academy",
      category: "Online Learning",
      subCategory: "Development",
      description: "Test academy",
      rating: 4.4,
      price: 0,
      features: ["Projects"],
      academyUrl: "https://example.com/academy",
    },
    update: { rating: 4.8 },
  },
  {
    name: "trending videos",
    path: "projects/altftool/trendingvideos/emulator-video",
    create: {
      name: "Emulator Video",
      category: "Technology",
      description: "Test video",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      channelName: "AltFTool",
      type: "video",
    },
    update: { type: "shorts" },
  },
  {
    name: "BuySmart hero",
    path: "projects/altftool/buySmart/hero",
    create: {
      banner: [
        {
          image: "https://example.com/banner.png",
          title: "Launch banner",
        },
      ],
    },
    update: { updatedBy: "active-admin" },
  },
  {
    name: "BuySmart category",
    path: "projects/altftool/buySmart/categories",
    create: {
      categories: [
        {
          title: "Laptops",
          slug: "laptops",
          enabled: true,
        },
      ],
    },
    update: { updatedBy: "active-admin" },
  },
  {
    name: "navigation item",
    path: "projects/altftool/navigation/data/items/emulator-nav",
    create: {
      label: "Tools",
      href: "/tools",
      order: 1,
      enabled: true,
    },
    update: { label: "All Tools" },
  },
];

test("active admins can create, update, read, and delete primary admin content paths", async () => {
  const db = testEnv.authenticatedContext("active-admin").firestore();

  for (const crudCase of adminCrudCases) {
    await assertCrudSucceeds(db, crudCase.path, crudCase.create, crudCase.update);
  }
});

test("inactive admins cannot mutate primary admin content paths", async () => {
  const db = testEnv.authenticatedContext("inactive-admin").firestore();

  for (const crudCase of adminCrudCases) {
    await assertFails(setDoc(doc(db, crudCase.path), crudCase.create));
  }
});

test("guests cannot mutate primary admin content paths", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  for (const crudCase of adminCrudCases) {
    await assertFails(setDoc(doc(db, crudCase.path), crudCase.create));
  }
});
