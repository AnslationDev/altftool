import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/* 🔐 Init Firebase */
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

/* 🔥 Fix gRPC issues */
db.settings({ preferRest: true });

/* ⚙️ CONFIG */
const PROJECT_ID = "altftool";
const MODULE = "buySmart";

/* 📦 All BuySmart document IDs */
const DOC_IDS = [
  "categories",
  "featurebrand",
  "hero",
  "ruleSet",
  "store",
  "trending",
];

/* 🚀 Migration */
async function migrateBuySmart() {
  console.log("🔥 Starting BuySmart migration...\n");

  for (const docId of DOC_IDS) {
    try {
      const oldRef = db.collection(MODULE).doc(docId);

      const newRef = db
        .collection("projects")
        .doc(PROJECT_ID)
        .collection(MODULE)
        .doc(docId);

      const oldSnap = await oldRef.get();

      if (!oldSnap.exists) {
        console.log(`⚠️ Missing: ${docId}`);
        continue;
      }

      const exists = await newRef.get();

      if (exists.exists) {
        console.log(`⏭ Skipped (already exists): ${docId}`);
        continue;
      }

      await newRef.set(oldSnap.data());

      console.log(`✅ Migrated: ${docId}`);
    } catch (err) {
      console.error(`❌ Error migrating ${docId}:`, err.message);

      // retry once
      try {
        const oldRef = db.collection(MODULE).doc(docId);
        const newRef = db
          .collection("projects")
          .doc(PROJECT_ID)
          .collection(MODULE)
          .doc(docId);

        const oldSnap = await oldRef.get();

        if (oldSnap.exists) {
          await newRef.set(oldSnap.data());
          console.log(`🔁 Retry success: ${docId}`);
        }
      } catch (retryErr) {
        console.error(`❌ Retry failed for ${docId}`);
      }
    }
  }

  console.log("\n🎉 BuySmart migration complete!");
}

/* ▶️ Run */
migrateBuySmart().catch(console.error);
