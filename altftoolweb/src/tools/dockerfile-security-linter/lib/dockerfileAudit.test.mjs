import assert from "node:assert/strict";
import test from "node:test";

import {
  DOCKERFILE_LIMITATIONS,
  DOCKERFILE_LIMITS,
  analyzeDockerfile,
  buildDockerfileAuditReport,
} from "./dockerfileAudit.mjs";

function codes(result) {
  return new Set(result.findings.map((finding) => finding.code));
}

test("parses comments, continuations, stages, and a hardened final stage", () => {
  const result = analyzeDockerfile(`# syntax=docker/dockerfile:1
FROM node:22.4.1@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa AS build
RUN npm ci \\
  && npm run build
FROM gcr.io/distroless/nodejs22-debian12@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
COPY --from=build /app/dist /app
USER 10001
HEALTHCHECK CMD ["/app/healthcheck"]
`);
  assert.equal(result.stats.stages, 2);
  assert.equal(result.stats.escapeCharacter, "backslash");
  assert.equal(result.counts.high, 0);
  assert.equal(result.counts.medium, 0);
  assert.equal(result.counts.review, 0);
});

test("supports a Docker backtick escape parser directive", () => {
  const result = analyzeDockerfile(
    [
      "# escape=`",
      "FROM alpine:3.20",
      "RUN apk add `",
      "  ca-certificates=20240226-r0",
      "USER 1000",
      'HEALTHCHECK CMD ["true"]',
    ].join("\n"),
  );
  assert.equal(result.stats.escapeCharacter, "backtick");
  assert.equal(result.stats.logicalInstructions, 4);
  assert.equal(codes(result).has("unterminated-continuation"), false);
});

test("flags floating base, root runtime, and missing healthcheck", () => {
  const result = analyzeDockerfile(`FROM node:latest
USER root
CMD ["node", "server.js"]`);
  const observed = codes(result);
  assert.ok(observed.has("floating-base-reference"));
  assert.ok(observed.has("final-stage-root-user"));
  assert.ok(observed.has("final-stage-healthcheck-missing"));
});

test("flags download-to-shell without executing anything", () => {
  const result = analyzeDockerfile(`FROM alpine:3.20
RUN curl -fsSL https://example.invalid/install | sh
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("download-piped-to-shell"));
});

test("flags secret-like ARG and ENV names without preserving values", () => {
  const secret = "do-not-echo-this-value";
  const result = analyzeDockerfile(`ARG API_TOKEN=${secret}
FROM alpine:3.20
ENV DATABASE_PASSWORD=${secret}
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("secret-like-build-arg"));
  assert.ok(codes(result).has("secret-like-env"));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));
});

test("flags unpinned APT/APK packages while accepting exact versions", () => {
  const unpinned = analyzeDockerfile(`FROM debian:12
RUN apt-get update && apt-get install -y curl ca-certificates
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(unpinned).has("unpinned-os-packages"));

  const pinned = analyzeDockerfile(`FROM alpine:3.20
RUN apk add ca-certificates=20240226-r0
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.equal(codes(pinned).has("unpinned-os-packages"), false);
});

test("flags broad context copies and remote ADD", () => {
  const result = analyzeDockerfile(`FROM alpine:3.20
COPY . .
ADD https://example.invalid/archive.tar /tmp/archive.tar
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("broad-build-context-copy"));
  assert.ok(codes(result).has("remote-add"));
});

test("parses shell and JSON COPY/ADD sources before assessing them", () => {
  const result = analyzeDockerfile(`FROM alpine:3.20
COPY ./ /app
COPY ["src", "/src"]
COPY [".", "/workspace"]
ADD ["https://example.invalid/archive.tar", "/tmp/archive.tar"]
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("broad-build-context-copy"));
  assert.ok(codes(result).has("remote-add"));
});

test("keeps a continued RUN instruction intact across a comment", () => {
  const result = analyzeDockerfile(`FROM debian:12
RUN apt-get update && \\
  # the package choice is documented here
  apt-get install -y curl
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("unpinned-os-packages"));
  assert.equal(codes(result).has("unparsed-instruction"), false);
});

test("does not treat variable or wildcard package versions as exact pins", () => {
  const result = analyzeDockerfile(`FROM alpine:3.20
RUN apk add curl=$CURL_VERSION ca-certificates=2024* libssl=3.3.1-r0
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("unpinned-os-packages"));
  assert.equal(
    result.findings
      .find((finding) => finding.code === "unpinned-os-packages")
      ?.detail.includes("2 of 3"),
    true,
  );
});

test("only applies unspecified-user runtime cue to the final stage", () => {
  const result = analyzeDockerfile(`FROM golang:1.24 AS build
RUN go build ./cmd/app
FROM scratch
COPY --from=build /go/app /app
USER 65532
HEALTHCHECK CMD ["/app", "health"]`);
  assert.equal(codes(result).has("final-stage-user-unspecified"), false);
});

test("reports variable bases and instructions before FROM with calibration", () => {
  const result = analyzeDockerfile(`ARG BASE=alpine:3.20
ENV SHOULD_NOT_BE_HERE=value
FROM \${BASE}
USER 1000
HEALTHCHECK CMD ["true"]`);
  assert.ok(codes(result).has("instruction-before-from"));
  assert.ok(codes(result).has("variable-base-reference"));
});

test("does not render structural review findings as clear", () => {
  const result = analyzeDockerfile("RUN echo hello");
  assert.ok(result.counts.review > 0);
  assert.equal(result.assessment.level, "review");
});

test("checks every modern ENV assignment for secret-like names", () => {
  const result = analyzeDockerfile(
    "FROM scratch\nENV SAFE=value API_TOKEN=replace-me\nUSER 1000\nHEALTHCHECK NONE",
  );
  assert.ok(
    result.findings.some((finding) => finding.code === "secret-like-env"),
  );
});

test("recognizes prior-stage aliases and numeric root spellings", () => {
  const result = analyzeDockerfile(
    [
      "FROM node:22 AS build",
      "USER 1000",
      "FROM build AS final",
      "USER 00",
      "HEALTHCHECK CMD true",
    ].join("\n"),
  );
  assert.equal(
    result.findings.some(
      (finding) =>
        finding.code === "floating-base-reference" && finding.stage === 2,
    ),
    false,
  );
  assert.ok(
    result.findings.some((finding) => finding.code === "final-stage-root-user"),
  );
});

test("later high cues survive the display cap and drive assessment", () => {
  const lines = ["FROM alpine:3.22"];
  for (let index = 0; index < 500; index += 1) {
    lines.push(`RUN apk add package-${index}`);
  }
  lines.push("USER 0", "HEALTHCHECK CMD true");
  const result = analyzeDockerfile(lines.join("\n"));
  assert.ok(result.counts.high > 0);
  assert.equal(result.assessment.level, "action");
  assert.ok(
    result.findings.some((finding) => finding.code === "final-stage-root-user"),
  );
  assert.equal(result.truncated, true);
});

test("enforces bounded characters and physical lines", () => {
  assert.throws(
    () => analyzeDockerfile("x".repeat(DOCKERFILE_LIMITS.maxCharacters + 1)),
    RangeError,
  );
  assert.throws(
    () =>
      analyzeDockerfile(
        Array.from(
          { length: DOCKERFILE_LIMITS.maxPhysicalLines + 1 },
          () => "# comment",
        ).join("\n"),
      ),
    RangeError,
  );
});

test("builds a counts-only report with explicit limitations", () => {
  const privateImage = "registry.internal.example/private/service";
  const result = analyzeDockerfile(`FROM ${privateImage}
USER 1000
HEALTHCHECK CMD ["true"]`);
  const report = buildDockerfileAuditReport(result);
  assert.equal(report.tool, "Dockerfile Security Linter");
  assert.deepEqual(report.limitations, [...DOCKERFILE_LIMITATIONS]);
  assert.doesNotMatch(JSON.stringify(report), /registry\.internal/);
});

test("rejects non-text input and describes empty text without a security claim", () => {
  assert.throws(() => analyzeDockerfile(undefined), TypeError);
  const empty = analyzeDockerfile("");
  assert.equal(empty.assessment.level, "invalid");
  assert.match(empty.assessment.description, /Paste a Dockerfile/);
});
