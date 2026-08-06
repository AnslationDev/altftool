// IUCN Red List status reference — shared lookup data for the module.
//
// Structural reference data, not animal content: animal records store only the
// short code (conservation.status) and everything human-facing is resolved
// from here. That keeps one label/description/tone definition for the whole
// catalogue, so a wording change is one edit rather than thousands.
//
// `tone` maps each code onto the design system's semantic badge tones
// (AhBadge), so severity reads consistently without any component knowing
// what IUCN codes mean. `severity` is an ordinal for sorting and filtering
// ("show me everything threatened or worse"), where higher = more at risk.

export const CONSERVATION_STATUSES = [
  {
    code: "LC",
    label: "Least Concern",
    description:
      "Evaluated and found not to qualify for a threatened category — widespread and abundant.",
    tone: "positive",
    severity: 1,
    threatened: false,
  },
  {
    code: "NT",
    label: "Near Threatened",
    description:
      "Close to qualifying for a threatened category, or likely to qualify in the near future.",
    tone: "positive",
    severity: 2,
    threatened: false,
  },
  {
    code: "VU",
    label: "Vulnerable",
    description: "Facing a high risk of extinction in the wild.",
    tone: "warning",
    severity: 3,
    threatened: true,
  },
  {
    code: "EN",
    label: "Endangered",
    description: "Facing a very high risk of extinction in the wild.",
    tone: "warning",
    severity: 4,
    threatened: true,
  },
  {
    code: "CR",
    label: "Critically Endangered",
    description: "Facing an extremely high risk of extinction in the wild.",
    tone: "danger",
    severity: 5,
    threatened: true,
  },
  {
    code: "EW",
    label: "Extinct in the Wild",
    description:
      "Survives only in cultivation, in captivity, or as a naturalised population outside its past range.",
    tone: "danger",
    severity: 6,
    // Not "threatened" in the strict IUCN sense — that grouping is exactly
    // VU, EN and CR. EW and EX sit beyond it, so counting them as threatened
    // would misreport any "threatened species" total.
    threatened: false,
  },
  {
    code: "EX",
    label: "Extinct",
    description:
      "No reasonable doubt that the last individual of the species has died.",
    tone: "danger",
    severity: 7,
    // See the note on EW: beyond the strict threatened grouping.
    threatened: false,
  },
  {
    code: "DD",
    label: "Data Deficient",
    description:
      "Not enough information on abundance or distribution to assess extinction risk.",
    tone: "neutral",
    severity: 0,
    threatened: false,
  },
  {
    code: "NE",
    label: "Not Evaluated",
    description: "Not yet assessed against the Red List criteria.",
    tone: "neutral",
    severity: 0,
    threatened: false,
  },
];

const BY_CODE = new Map(
  CONSERVATION_STATUSES.map((status) => [status.code, status]),
);

export function getConservationStatus(code) {
  return BY_CODE.get(code) ?? null;
}
