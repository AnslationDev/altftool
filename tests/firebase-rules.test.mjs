import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
} from "firebase/storage";

const root = path.resolve(import.meta.dirname, "..");
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "altftool-rules-test";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST?.split(":") || ["127.0.0.1", "8080"];
const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST?.split(":") || ["127.0.0.1", "9199"];

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
      storage: {
        host: storageHost[0],
        port: Number(storageHost[1] || 9199),
        rules: readFileSync(path.join(root, "storage.rules"), "utf8"),
      },
    });
  } catch (error) {
    const message = error?.cause?.code === "ECONNREFUSED"
      ? `Firebase emulators are not running at firestore=${firestoreHost.join(":")} storage=${storageHost.join(":")}. Run npm run test:firebase-rules:emulator from the repo root.`
      : error?.message || "Unable to initialize Firebase rules test environment.";

    throw new Error(message, { cause: error });
  }
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
  if (typeof testEnv.clearStorage === "function") await testEnv.clearStorage();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "admins/active-admin"), { isActive: true, roleType: "admin" });
    await setDoc(doc(db, "admins/inactive-admin"), { isActive: false, roleType: "admin" });
    await setDoc(doc(db, "admins/super-admin"), { isActive: true, roleType: "superadmin" });
    await setDoc(doc(db, "projects/altftool/blogs/public-post"), {
      heading: "Public post",
      status: "published",
      likesCount: 0,
      viewsCount: 0,
    });
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

test("public Firestore reads stay open while public writes stay blocked", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(db, "projects/altftool/blogs/public-post")));
  await assertFails(setDoc(doc(db, "projects/altftool/buySmart/hero"), { banner: [] }));
});

test("public blog metric updates are narrow", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  const blogRef = doc(db, "projects/altftool/blogs/public-post");

  await assertSucceeds(updateDoc(blogRef, { viewsCount: 1 }));
  await assertFails(updateDoc(blogRef, { status: "draft" }));
});

test("active admins can write project content and inactive admins cannot", async () => {
  const activeDb = testEnv.authenticatedContext("active-admin").firestore();
  const inactiveDb = testEnv.authenticatedContext("inactive-admin").firestore();

  await assertSucceeds(setDoc(doc(activeDb, "projects/altftool/buySmart/hero"), { banner: [] }));
  await assertFails(setDoc(doc(inactiveDb, "projects/altftool/buySmart/hero"), { banner: [] }));
});

test("admin profile reads are limited unless the user is a superadmin", async () => {
  const activeDb = testEnv.authenticatedContext("active-admin").firestore();
  const superDb = testEnv.authenticatedContext("super-admin").firestore();

  await assertSucceeds(getDoc(doc(activeDb, "admins/active-admin")));
  await assertFails(getDoc(doc(activeDb, "admins/super-admin")));
  await assertSucceeds(getDoc(doc(superDb, "admins/active-admin")));
});

test("storage uploads require active admins and safe content types", async () => {
  const guestStorage = testEnv.unauthenticatedContext().storage();
  const activeStorage = testEnv.authenticatedContext("active-admin").storage();
  const imageBlob = new Blob(["image"], { type: "image/png" });
  const textBlob = new Blob(["text"], { type: "text/plain" });

  await assertFails(uploadBytes(ref(guestStorage, "uploads/public.png"), imageBlob, { contentType: "image/png" }));
  await assertSucceeds(uploadBytes(ref(activeStorage, "uploads/public.png"), imageBlob, { contentType: "image/png" }));
  await assertFails(uploadBytes(ref(activeStorage, "uploads/readme.txt"), textBlob, { contentType: "text/plain" }));
});
