import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_HAR_CHARACTERS,
  MAX_HAR_ENTRIES,
  sanitizeHar,
} from "./sanitizeHar.mjs";

function fixture() {
  return {
    log: {
      version: "1.2",
      creator: { name: "test", version: "1" },
      entries: [
        {
          request: {
            method: "POST",
            url: "https://example.com/api?token=secret-value&page=2",
            headers: [
              { name: "Authorization", value: "Bearer secret" },
              { name: "X-Vendor-Access-Token", value: "secret" },
              { name: "Accept", value: "application/json" },
            ],
            cookies: [{ name: "sid", value: "secret" }],
            queryString: [
              { name: "token", value: "secret-value" },
              { name: "page", value: "2" },
            ],
            postData: {
              mimeType: "application/json",
              text: '{"password":"secret"}',
              params: [{ name: "password", value: "secret" }],
            },
          },
          response: {
            headers: [{ name: "Set-Cookie", value: "sid=secret" }],
            cookies: [{ name: "sid", value: "secret" }],
            content: {
              mimeType: "application/json",
              text: '{"token":"secret"}',
            },
          },
        },
      ],
    },
  };
}

test("removes sensitive HAR fields while retaining diagnostic structure", () => {
  const original = fixture();
  const result = sanitizeHar(original);
  const request = result.har.log.entries[0].request;
  const response = result.har.log.entries[0].response;

  assert.equal(request.headers.length, 1);
  assert.equal(request.headers[0].name, "Accept");
  assert.deepEqual(request.cookies, []);
  assert.deepEqual(request.queryString, [{ name: "page", value: "2" }]);
  assert.equal(new URL(request.url).searchParams.has("token"), false);
  assert.equal(new URL(request.url).searchParams.get("page"), "2");
  assert.equal("text" in request.postData, false);
  assert.equal("text" in response.content, false);
  assert.equal(JSON.stringify(original).includes("secret-value"), true);
  assert.equal(result.summary.headersRemoved, 3);
});

test("honors body-retention options", () => {
  const result = sanitizeHar(fixture(), {
    removeRequestBodies: false,
    removeResponseBodies: false,
  });
  assert.match(result.har.log.entries[0].request.postData.text, /password/);
  assert.match(result.har.log.entries[0].response.content.text, /token/);
});

test("rejects invalid, oversized, and entry-heavy input", () => {
  assert.throws(() => sanitizeHar("{"), /valid JSON/);
  assert.throws(
    () => sanitizeHar(" ".repeat(MAX_HAR_CHARACTERS + 1)),
    /character limit/,
  );
  assert.throws(
    () =>
      sanitizeHar({
        log: { entries: Array.from({ length: MAX_HAR_ENTRIES + 1 }) },
      }),
    /entries/,
  );
});

test("removes URL user information and tolerates malformed query encoding", () => {
  const data = fixture();
  data.log.entries[0].request.url =
    "https://user:pass@example.com/api?%E0%A4%A=value&token=secret";
  const result = sanitizeHar(data);
  const url = result.har.log.entries[0].request.url;
  assert.equal(url.includes("user:pass"), false);
  assert.equal(url.includes("token="), false);
});

test("removes sensitive URL fragments, including hash-router query values", () => {
  const direct = fixture();
  direct.log.entries[0].request.url =
    "https://example.com/callback#access_token=secret&state=public";
  const directResult = sanitizeHar(direct);
  assert.equal(
    directResult.har.log.entries[0].request.url.includes("access_token"),
    false,
  );
  assert.match(directResult.har.log.entries[0].request.url, /#state=public$/u);

  const routed = fixture();
  routed.log.entries[0].request.url =
    "https://example.com/#/result?token=secret&view=summary";
  const routedResult = sanitizeHar(routed);
  assert.equal(
    routedResult.har.log.entries[0].request.url.includes("token="),
    false,
  );
  assert.match(
    routedResult.har.log.entries[0].request.url,
    /#\/result\?view=summary$/u,
  );
  assert.equal(routedResult.summary.urlSecretsRemoved, 1);
});

test("marks a copy with every removal option disabled as unprotected", () => {
  const result = sanitizeHar(fixture(), {
    removeSensitiveHeaders: false,
    removeCookies: false,
    removeSensitiveQuery: false,
    removeRequestBodies: false,
    removeResponseBodies: false,
  });
  assert.equal(result.summary.protectionsEnabled, 0);
  assert.equal(JSON.stringify(result.har).includes("secret-value"), true);
});

test("removes common cloud security-token headers", () => {
  const data = fixture();
  data.log.entries[0].request.headers.push(
    { name: "X-Amz-Security-Token", value: "temporary-secret" },
    { name: "X-Goog-Api-Key", value: "api-secret" },
  );
  const result = sanitizeHar(data);
  assert.equal(
    result.har.log.entries[0].request.headers.some((header) =>
      /amz-security-token|goog-api-key/iu.test(header.name),
    ),
    false,
  );
});
