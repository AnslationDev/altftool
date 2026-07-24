import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEvidencePack,
  createCheckState,
  createEmptyIncident,
  EVIDENCE_TYPES,
  evidencePackFilename,
  getPreparationSummary,
  hasPreparedContent,
  IMMEDIATE_STEPS,
  OFFICIAL_SOURCES,
} from "./emergencyAssistant.mjs";

test("provides a calm action sequence without making a fraud determination", () => {
  assert.ok(IMMEDIATE_STEPS.length >= 6);
  assert.deepEqual(
    IMMEDIATE_STEPS.slice(0, 3).map((step) => step.id),
    ["pause", "protect-money", "protect-access"],
  );

  const copy = IMMEDIATE_STEPS.map((step) => `${step.title} ${step.detail}`).join(" ");
  assert.doesNotMatch(copy, /\b(?:confirmed|definitely|verdict)\b/iu);
});

test("counts preparation activity without producing a risk score", () => {
  const incident = createEmptyIncident();
  const steps = createCheckState(IMMEDIATE_STEPS);
  const evidence = createCheckState(EVIDENCE_TYPES);

  incident.claimedAgency = "Example agency claim";
  steps.pause = true;
  steps.preserve = true;
  evidence.screenshots = true;

  assert.deepEqual(getPreparationSummary(incident, steps, evidence), {
    completedSteps: 2,
    totalSteps: IMMEDIATE_STEPS.length,
    notedEvidence: 1,
    totalEvidence: EVIDENCE_TYPES.length,
    recordedFields: 1,
    totalFields: 11,
  });
});

test("builds a local organiser while preserving user-provided notes", () => {
  const incident = createEmptyIncident();
  const steps = createCheckState(IMMEDIATE_STEPS);
  const evidence = createCheckState(EVIDENCE_TYPES);

  incident.allegation = "They claimed a parcel was linked to a case.";
  incident.channel = "video-call";
  steps.pause = true;
  evidence["chat-export"] = true;

  const report = buildEvidencePack({
    incident,
    steps,
    evidence,
    createdAt: new Date("2026-07-24T08:30:00.000Z"),
  });

  assert.match(report, /They claimed a parcel was linked to a case\./u);
  assert.match(report, /Contact channel: Video call/u);
  assert.match(report, /not original evidence/iu);
  assert.match(report, /not .*fraud verdict/iu);
  assert.match(report, /real law enforcement does not arrest people digitally/iu);
  assert.match(
    report,
    /do not conduct this kind of enquiry through a phone call or a video call/iu,
  );
});

test("official references are primary government sources and remain plain data", () => {
  assert.ok(OFFICIAL_SOURCES.length >= 4);
  assert.ok(
    OFFICIAL_SOURCES.every((source) =>
      /(?:cybercrime\.gov\.in|mha\.gov\.in|pib\.gov\.in|pmindia\.gov\.in)/u.test(
        source.url,
      ),
    ),
  );
});

test("detects prepared content and creates a predictable local filename", () => {
  const incident = createEmptyIncident();
  const steps = createCheckState(IMMEDIATE_STEPS);
  const evidence = createCheckState(EVIDENCE_TYPES);

  assert.equal(hasPreparedContent(incident, steps, evidence), false);
  evidence.timeline = true;
  assert.equal(hasPreparedContent(incident, steps, evidence), true);
  assert.equal(
    evidencePackFilename(new Date("2026-07-24T08:30:00.000Z")),
    "digital-arrest-incident-notes-2026-07-24.txt",
  );
});
