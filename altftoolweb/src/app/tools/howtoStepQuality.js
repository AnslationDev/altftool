const HARD_DETAIL =
  /\b\d+(?:\.\d+)?(?:%|x|px|ms|s|MB|KB|GB)?\b|\.(?:png|jpe?g|webp|gif|svg|pdf|csv|json|txt|mp3|mp4|zip)\b|\b(?:PNG|JPE?G|WebP|GIF|SVG|PDF|CSV|JSON|XML|YAML|HTML|CSS|SQL|API|URL|URI|QR|CRC32|SHA-?\d+|TOTP|OTP|MB|KB|GB|px)\b/;

const GENERIC_WORDS = new Set(
  `a action add adjust again all allow an analyze and another any appropriate appears apply as at automatically
  below begin browse button buttons by calculate calculation change check choose click complete configure continue
  control controls conversion convert converted copy create customise customize data desired designated details directly
  display download drag drop each edit enable end enter export exported field fields file files final finish follow for
  format from generate generated generating get import in information input inputs inspect instantly interface into it
  its keep load look looks make measure modify needed observe obtain of on open option options or output outputs page
  panel paste pick preferred press preview process produce provide read receive remove repeat required reset result
  results review right run save scan scanning see select selected set settings share show start step submit switch test
  that the then this to tool transform try type until update upload use using validate value values verify version view
  wait watch when where which with you your`.split(/\s+/),
);

const GENERIC_ACTION =
  /^(?:adjust|analy[sz]|apply|begin|calculat|chang|choos|click|complet|configur|continu|convert|cop|creat|customi[sz]|display|download|edit|enabl|enter|export|finish|follow|generat|get|import|inspect|load|measur|modif|observ|obtain|open|paste|pick|press|preview|process|produc|provid|read|receiv|remov|repeat|reset|review|run|sav|scan|select|set|shar|show|start|submit|switch|test|transform|tr|typ|updat|upload|us|validat|verif|view|wait|watch)(?:e|ed|es|ing|s)?$/;

function distinctiveTerms(step) {
  const words = String(step).toLowerCase().match(/[a-z][a-z0-9-]*/g) ?? [];
  return [
    ...new Set(
      words.filter(
        (word) =>
          word.length >= 3 &&
          !GENERIC_WORDS.has(word) &&
          !GENERIC_ACTION.test(word),
      ),
    ),
  ];
}

export function inspectHowToStep(step) {
  const text = typeof step === "string" ? step.replace(/\s+/g, " ").trim() : "";
  if (!text) {
    return { valid: false, reason: "is empty or is not a string", terms: [] };
  }

  const terms = distinctiveTerms(text);
  const hasHardDetail = HARD_DETAIL.test(text);
  const valid = terms.length >= 2 || (hasHardDetail && terms.length >= 1);

  return {
    valid,
    reason: valid
      ? null
      : "needs two tool-specific terms, or one tool-specific term plus a format, unit or number",
    terms,
  };
}

export function getHowToStepIssues(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [{ index: -1, step: "", reason: "has no steps", terms: [] }];
  }

  return steps.flatMap((step, index) => {
    const inspection = inspectHowToStep(step);
    return inspection.valid
      ? []
      : [{ index, step, reason: inspection.reason, terms: inspection.terms }];
  });
}

export function hasPublishableHowToSteps(steps) {
  return getHowToStepIssues(steps).length === 0;
}
