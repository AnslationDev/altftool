#!/usr/bin/env node
/**
 * Completely remove an admin/user from Firebase for the AltFTool admin app.
 *
 *   node scripts/remove-admin.mjs [email]
 *
 * Defaults to saurabh.tiwari@anslation.com when no email is given.
 *
 * Removes ALL references for the email:
 *   - the Firebase Auth user (so Google/password sign-in starts fresh)
 *   - admins/{uid}  (and any admins doc matched by email)
 *   - every accessRequests document for that uid or email
 *   - the user's custom claims (cleared with the auth user)
 *
 * Loads credentials from .env / .env.local (same precedence as Next.js).
 * Destructive + idempotent — safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  const p = path.join(appDir, file);
  if (!fs.existsSync(p)) return;
  for (let line of fs.readFileSync(p, "utf8").split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const email = (process.argv[2] || "saurabh.tiwari@anslation.com").trim().toLowerCase();
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("✗ Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env(.local).");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
const auth = admin.auth();
const db = admin.firestore();

async function main() {
  console.log(`Removing all references for: ${email}\n`);
  let uid = null;

  // 1. Delete the Firebase Auth user (by email).
  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    await auth.deleteUser(uid);
    console.log(`• Deleted auth user: ${uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log("• No auth user found (already gone).");
    } else {
      throw err;
    }
  }

  // 2. Delete admins/{uid} if we know the uid.
  if (uid) {
    const ref = db.collection("admins").doc(uid);
    if ((await ref.get()).exists) {
      await ref.delete();
      console.log(`• Deleted admins/${uid}`);
    }
  }

  // 3. Delete any admins docs matched by email (covers uid mismatch).
  const byEmail = await db.collection("admins").where("email", "==", email).get();
  for (const d of byEmail.docs) {
    await d.ref.delete();
    console.log(`• Deleted admins/${d.id} (matched by email)`);
  }

  // 4. Delete all accessRequests for this email and/or uid.
  let reqCount = 0;
  const reqByEmail = await db.collection("accessRequests").where("email", "==", email).get();
  for (const d of reqByEmail.docs) { await d.ref.delete(); reqCount++; }
  if (uid) {
    const reqByUid = await db.collection("accessRequests").where("uid", "==", uid).get();
    for (const d of reqByUid.docs) { await d.ref.delete(); reqCount++; }
  }
  console.log(`• Deleted ${reqCount} accessRequests document(s)`);

  console.log(`\n✅ Done. Every reference for ${email} has been removed.`);
  console.log("   You can now do a fresh Google sign-in to test the real signup → approval flow.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Failed:", err.message);
    process.exit(1);
  });
