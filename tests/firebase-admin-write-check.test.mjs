import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const adminCwd = path.join(root, "altftoolwebadmin");
const scriptArgs = ["scripts/checkFirebaseAdminWrite.mjs"];

function runChecker(extraEnv = {}) {
  return spawnSync(process.execPath, scriptArgs, {
    cwd: adminCwd,
    env: {
      ...process.env,
      FIREBASE_PROJECT_ID: "",
      FIREBASE_CLIENT_EMAIL: "",
      FIREBASE_PRIVATE_KEY: "",
      FIREBASE_ADMIN_WRITE_CHECK_MODE: "",
      FIRESTORE_EMULATOR_HOST: "",
      ...extraEnv,
    },
    encoding: "utf8",
  });
}

function runCheckerAsync(extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, scriptArgs, {
      cwd: adminCwd,
      env: {
        ...process.env,
        FIREBASE_PROJECT_ID: "",
        FIREBASE_CLIENT_EMAIL: "",
        FIREBASE_PRIVATE_KEY: "",
        FIREBASE_ADMIN_WRITE_CHECK_MODE: "",
        FIRESTORE_EMULATOR_HOST: "",
        ...extraEnv,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function createFirestoreEmulatorStub() {
  const documents = new Map();
  const server = http.createServer(async (request, response) => {
    try {
      const documentId = request.url?.split("/__altftool_health_checks__/")[1]?.split("?")[0];
      response.setHeader("content-type", "application/json");

      if (!documentId) {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: { status: "NOT_FOUND" } }));
        return;
      }

      if (request.method === "PATCH") {
        const body = JSON.parse(await readRequestBody(request));
        documents.set(documentId, body);
        response.end(JSON.stringify(body));
        return;
      }

      if (request.method === "GET") {
        const document = documents.get(documentId);
        if (!document) {
          response.statusCode = 404;
          response.end(JSON.stringify({ error: { status: "NOT_FOUND" } }));
          return;
        }
        response.end(JSON.stringify(document));
        return;
      }

      if (request.method === "DELETE") {
        documents.delete(documentId);
        response.end(JSON.stringify({}));
        return;
      }

      response.statusCode = 405;
      response.end(JSON.stringify({ error: { status: "METHOD_NOT_ALLOWED" } }));
    } catch (error) {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: { message: error?.message || String(error) } }));
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    server,
    host: `127.0.0.1:${server.address().port}`,
  };
}

test("Firebase Admin write checker dry-run validates wiring without credentials", () => {
  const result = runChecker({ FIREBASE_ADMIN_WRITE_CHECK_MODE: "dry-run" });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /dry run passed/i);
  assert.match(result.stdout, /credentialReady/);
  assert.doesNotMatch(result.stdout, /PRIVATE KEY-----/);
});

test("Firebase Admin write checker fails clearly when live credentials are missing", () => {
  const result = runChecker();

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot run without ready credentials/i);
  assert.match(result.stderr, /FIREBASE_CLIENT_EMAIL/);
  assert.doesNotMatch(result.stderr, /PRIVATE KEY-----/);
});

test("Firebase Admin write checker uses emulator REST path without live credentials", async (t) => {
  const emulator = await createFirestoreEmulatorStub();
  t.after(() => emulator.server.close());

  const result = await runCheckerAsync({
    FIRESTORE_EMULATOR_HOST: emulator.host,
    FIREBASE_PROJECT_ID: "altftool-bca36",
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /write check passed/i);
  assert.match(result.stdout, /"emulator": true/);
  assert.doesNotMatch(result.stdout, /PRIVATE KEY-----/);
});
