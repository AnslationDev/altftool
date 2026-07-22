import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

const extensions = JSON.parse(
  fs.readFileSync("./scripts/extensions-firestore-import.json")
);

async function importExtensions() {
  const batch = db.batch();

  extensions.forEach((ext) => {
    const ref = db.collection("extensions").doc(ext.slug);

    batch.set(ref, {
      ...ext,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  console.log(`Imported ${extensions.length} extensions ✅`);
}

importExtensions();
