#!/usr/bin/env node
/**
 * Seed / promote a superadmin in Firebase for the AltFTool admin app.
 *
 *   node scripts/seed-superadmin.mjs [email]
 *
 * Defaults to saurabh.tiwari@anslation.com when no email is given.
 *
 * - Loads credentials from .env / .env.local (same precedence as Next.js:
 *   .env.local overrides .env).
 * - Finds the Firebase Auth user by email, or creates one if it doesn't exist
 *   (a later Google sign-in with the same email links to it).
 * - Upserts admins/{uid} with roleType=superadmin, isActive=true.
 * - Sets the { role: "superadmin" } custom claim (matches syncAdminClaims).
 * - Approves any pending access requests for the email.
 *
 * Idempotent — safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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
    if (process.env[key] === undefined) process.env[key] = val; // first loaded wins
  }
}
// Load .env.local first so its values win (Next.js precedence), then .env.
loadEnv(".env.local");
loadEnv(".env");

const email = (process.argv[2] || "saurabh.tiwari@anslation.com").trim().toLowerCase();
// Optional: set/replace this user's password so email+password login works
// (useful when Google OAuth is blocked by browser third-party restrictions).
// Pass as 2nd CLI arg or via SEED_ADMIN_PASSWORD env var.
const password = (process.argv[3] || process.env.SEED_ADMIN_PASSWORD || "").trim();
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("✗ Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env(.local).");
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log(`Seeding superadmin for: ${email}\n`);

  // 1. Find or create the Firebase Auth user.
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`• Found existing auth user: ${user.uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      user = await auth.createUser({ email, emailVerified: true });
      console.log(`• Created auth user: ${user.uid}`);
      console.log("  Signing in with Google using this email will link to this account.");
    } else {
      throw err;
    }
  }

  // 1b. Optionally set a password so email/password login works.
  if (password) {
    if (password.length < 6) {
      console.error("✗ Password must be at least 6 characters.");
      process.exit(1);
    }
    await auth.updateUser(user.uid, { password, emailVerified: true });
    console.log("• password set for email/password login");
  }

  // 2. Upsert the admins/{uid} document as superadmin.
  const ref = db.collection("admins").doc(user.uid);
  const existing = await ref.get();
  const prev = existing.exists ? existing.data() : {};
  await ref.set(
    {
      email,
      roleType: "superadmin",
      isActive: true,
      fullName: prev.fullName ?? "Super Admin",
      permissions: prev.permissions ?? {},
      projectAccess: prev.projectAccess ?? {},
      updatedAt: new Date().toISOString(),
      ...(existing.exists ? {} : { createdAt: new Date().toISOString() }),
    },
    { merge: true },
  );
  console.log(`• admins/${user.uid} → roleType=superadmin, isActive=true`);

  // 3. Custom claims (matches syncAdminClaims).
  await auth.setCustomUserClaims(user.uid, { role: "superadmin" });
  console.log("• custom claims set: { role: 'superadmin' }");

  // 4. Approve any pending access requests for this email.
  const reqs = await db
    .collection("accessRequests")
    .where("email", "==", email)
    .where("status", "==", "pending")
    .get();
  for (const d of reqs.docs) {
    await d.ref.update({ status: "approved", approvedAt: new Date().toISOString() });
  }
  if (!reqs.empty) console.log(`• Approved ${reqs.size} pending access request(s)`);

  console.log(`\n✅ Done. ${email} is now a superadmin.`);
  console.log("   Sign in with Google → you'll land on /admin-management.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Failed:", err.message);
    process.exit(1);
  });
