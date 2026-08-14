/*
 * Ideas corpus byte source (server only).
 *
 * Normal builds and local development read the generated corpus directly from
 * `public/`. Amplify already publishes those files as static CDN assets, so its
 * compute bundle deliberately leaves them out of Next's file traces. In that
 * runtime only, an ENOENT falls back to the same public asset URL.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const PRODUCTION_DATA_ORIGIN = "https://www.altftool.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const ASSET_PATTERN = /^[a-z0-9][a-z0-9_/-]*\.json$/u;

function corpusError(message, code, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
}

export function assertIdeasCorpusAssetPath(relativeFile) {
  const asset = String(relativeFile || "");
  if (
    !ASSET_PATTERN.test(asset) ||
    asset.includes("//") ||
    asset.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw corpusError(`Invalid AltF Ideas corpus path "${asset}".`, "EINVAL");
  }
  return asset;
}

export function resolveIdeasDataOrigin({
  value = process.env.ALTFT_IDEAS_DATA_ORIGIN,
  nodeEnv = process.env.NODE_ENV,
} = {}) {
  const candidate = String(value || PRODUCTION_DATA_ORIGIN).trim();

  try {
    const url = new URL(candidate);
    const isLocal = LOCAL_HOSTS.has(url.hostname.toLowerCase());
    const secure = url.protocol === "https:";
    const localDevelopment =
      nodeEnv !== "production" && isLocal && url.protocol === "http:";

    if (!secure && !localDevelopment) throw new Error("unsupported protocol");
    if (url.username || url.password || url.search || url.hash) {
      throw new Error("credentials, query strings and fragments are not allowed");
    }

    if (url.hostname.toLowerCase().replace(/\.+$/u, "") === "altftool.com") {
      url.hostname = "www.altftool.com";
    }

    return url.toString().replace(/\/+$/u, "");
  } catch (error) {
    throw corpusError(
      `Invalid ALTFT_IDEAS_DATA_ORIGIN "${candidate}". Use HTTPS (or localhost HTTP outside production).`,
      "EINVAL",
      error,
    );
  }
}

export function ideasCorpusAssetUrl(
  relativeFile,
  {
    env = process.env,
    nodeEnv = process.env.NODE_ENV,
  } = {},
) {
  const asset = assertIdeasCorpusAssetPath(relativeFile);
  const origin = resolveIdeasDataOrigin({
    value: env.ALTFT_IDEAS_DATA_ORIGIN,
    nodeEnv,
  });
  const url = new URL(
    `data/ideas/${asset.split("/").map(encodeURIComponent).join("/")}`,
    `${origin}/`,
  );
  const release = String(env.ALTFT_RELEASE_COMMIT || "").trim();
  if (release) url.searchParams.set("v", release);
  return url.toString();
}

export async function readIdeasCorpusFile(
  relativeFile,
  {
    dataDirectory = path.join(process.cwd(), "public", "data", "ideas"),
    readFileImpl = readFile,
    fetchImpl = globalThis.fetch,
    env = process.env,
    nodeEnv = process.env.NODE_ENV,
  } = {},
) {
  const asset = assertIdeasCorpusAssetPath(relativeFile);

  try {
    return await readFileImpl(path.join(dataDirectory, asset));
  } catch (error) {
    // Only an absent traced file proves this is the intentionally corpus-free
    // Amplify compute package. Permissions and other I/O errors stay local.
    if (error?.code !== "ENOENT") throw error;

    const configuredRemote = Boolean(
      String(env.ALTFT_IDEAS_DATA_ORIGIN || "").trim(),
    );
    if (nodeEnv !== "production" && !configuredRemote) throw error;
    if (typeof fetchImpl !== "function") {
      throw corpusError("AltF Ideas remote corpus fetch is unavailable.", "ENOSYS", error);
    }
  }

  const url = ideasCorpusAssetUrl(asset, { env, nodeEnv });
  let response;
  try {
    response = await fetchImpl(url, {
      cache: "force-cache",
      redirect: "error",
      signal:
        typeof globalThis.AbortSignal?.timeout === "function"
          ? globalThis.AbortSignal.timeout(10_000)
          : undefined,
    });
  } catch (error) {
    throw corpusError(`AltF Ideas corpus fetch failed for "${url}".`, "EREMOTEIO", error);
  }

  if (!response.ok) {
    const code = response.status === 404 ? "ENOENT" : "EREMOTEIO";
    throw corpusError(
      `AltF Ideas corpus fetch returned HTTP ${response.status} for "${url}".`,
      code,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
