import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/* 🔐 Init Firebase Admin using env */
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

/* ⚙️ CONFIG */
const PROJECT_ID = "altftool";

const MODULES = [
  "ads",
  "blogs",
  "buysmart",
  "extensions",
  "images",
  "videos",
  "categories",
];

/* 🚀 Migrate single module */
async function migrateModule(module) {
  console.log(`\n🚀 Migrating: ${module}`);

  const oldSnap = await db.collection(module).get();

  if (oldSnap.empty) {
    console.log(`⚠️ No data found in ${module}`);
    return;
  }

  let count = 0;

  for (const doc of oldSnap.docs) {
    const data = doc.data();

    const newRef = db
      .collection("projects")
      .doc(PROJECT_ID)
      .collection(module)
      .doc(doc.id);

    const exists = await newRef.get();

    // ✅ prevent overwrite
    if (!exists.exists) {
      await newRef.set(data);
      count++;
      console.log(`→ ${module}: ${doc.id}`);
    }
  }

  console.log(`✅ ${module}: ${count} docs migrated`);
}

/* 🔥 Run all */
async function migrateAll() {
  console.log("🔥 Starting migration...\n");

  for (const module of MODULES) {
    await migrateModule(module);
  }

  console.log("\n🎉 Migration complete!");
}

/* ▶️ Execute */
migrateAll().catch((err) => {
  console.error("❌ Migration failed:", err);
});
