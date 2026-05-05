import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

const extensions = JSON.parse(
  fs.readFileSync("./scripts/extensions-firestore-import.json")
);

async function importExtensions() {
  const batch = db.batch();

  extensions.forEach((ext) => {
    const ref = db.collection("extensions").doc(ext.slug);

    batch.set(ref, {
      ...ext,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  console.log(`Imported ${extensions.length} extensions ✅`);
}

importExtensions();