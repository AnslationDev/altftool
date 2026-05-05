import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import admin from "firebase-admin";

/* 🔐 Init Firebase */
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* 🔥 Fix gRPC issues */
db.settings({ preferRest: true });

/* ⚙️ CONFIG */
const PROJECT_ID = "altftool";
const MODULE = "categories";

/* 🚀 Migration */
async function migrateCategories() {
  console.log("🔥 Starting categories migration...\n");

  const oldSnap = await db.collection(MODULE).get();

  if (oldSnap.empty) {
    console.log("⚠️ No data found in categories");
    return;
  }

  let count = 0;

  for (const doc of oldSnap.docs) {
    try {
      const data = doc.data();

      const newRef = db
        .collection("projects")
        .doc(PROJECT_ID)
        .collection(MODULE)
        .doc(doc.id);

      const exists = await newRef.get();

      if (exists.exists) {
        console.log(`⏭ Skipped: ${doc.id}`);
        continue;
      }

      await newRef.set(data);

      console.log(`✅ Migrated: ${doc.id}`);
      count++;
    } catch (err) {
      console.error(`❌ Error: ${doc.id}`, err.message);

      // retry once
      try {
        const data = doc.data();

        const newRef = db
          .collection("projects")
          .doc(PROJECT_ID)
          .collection(MODULE)
          .doc(doc.id);

        await newRef.set(data);

        console.log(`🔁 Retry success: ${doc.id}`);
        count++;
      } catch {
        console.error(`❌ Retry failed: ${doc.id}`);
      }
    }
  }

  console.log(`\n🎉 Categories migration complete! Total: ${count}`);
}

/* ▶️ Run */
migrateCategories().catch(console.error);