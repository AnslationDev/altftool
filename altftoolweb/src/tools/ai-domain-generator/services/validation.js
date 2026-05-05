const INPUT_MIN_LEN = 2;
const INPUT_MAX_LEN = 60;

export function validateIdeaInput(raw) {
  const trimmed = raw.trim();
  const errors = [];

  if (!trimmed) errors.push("Empty input not allowed");
  if (trimmed.length > 0 && trimmed.length < INPUT_MIN_LEN)
    errors.push(`Minimum length: ${INPUT_MIN_LEN} characters`);
  if (trimmed.length > INPUT_MAX_LEN)
    errors.push(`Keep it under ${INPUT_MAX_LEN} characters`);

 
  if (trimmed && !/^[a-zA-Z0-9\- ]+$/.test(trimmed)) {
    errors.push("Only letters, numbers, spaces and '-' are allowed");
  }

  return { ok: errors.length === 0, trimmed, errors };
}

export function validateSelectedTlds(tlds) {
  const errors = [];
  if (tlds.length < 1) errors.push("At least 1 TLD must be selected");
  const uniq = new Set(tlds);
  if (uniq.size !== tlds.length)
    errors.push("Prevent duplicate TLD selection");
  return { ok: errors.length === 0, errors };
}

export function normalizeToSld(candidate) {
  let s = candidate.trim().toLowerCase();
  // remove spaces
  s = s.replace(/\s+/g, "");
  // keep only a-z 0-9 and hyphen
  s = s.replace(/[^a-z0-9-]/g, "");
  // collapse repeated hyphens
  s = s.replace(/-+/g, "-");
  // remove leading/trailing hyphen
  s = s.replace(/^-+/, "").replace(/-+$/, "");
  return s;
}

export function validateFinalDomainSLD(sld) {
  const errors = [];
  if (!sld) errors.push("Domain cannot be empty");
  if (/\s/.test(sld)) errors.push("No spaces in final domain");
  if (/[A-Z]/.test(sld)) errors.push("No uppercase letters");
  if (/[^a-z0-9-]/.test(sld))
    errors.push("No special characters except '-'");
  if (sld.length > 63) errors.push("Max length: 63 characters");
  if (/^-|-$/.test(sld))
    errors.push("Domain cannot start/end with '-'");

  return { ok: errors.length === 0, errors };
}

export function safeDomainLabel(domain) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
