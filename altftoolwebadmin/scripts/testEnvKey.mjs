import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

// Load environment variables
const envPath = path.join(process.cwd(), ".env");
if (existsSync(envPath)) {
  loadEnv({ path: envPath, override: true });
}

let key = process.env.FIREBASE_PRIVATE_KEY || "";
console.log("Key length:", key.length);
console.log("Starts with BEGIN:", key.startsWith("-----BEGIN PRIVATE KEY-----") || key.startsWith('"-----BEGIN PRIVATE KEY-----'));
console.log("Ends with END:", key.endsWith("-----END PRIVATE KEY-----") || key.endsWith('-----END PRIVATE KEY-----\n') || key.endsWith('-----END PRIVATE KEY-----"'));
console.log("First 100 chars:", JSON.stringify(key.slice(0, 100)));
console.log("Last 100 chars:", JSON.stringify(key.slice(-100)));
