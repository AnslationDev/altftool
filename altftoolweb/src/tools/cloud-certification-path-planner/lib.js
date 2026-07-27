/**
 * Cloud certification path planning.
 *
 * Exam fees are the providers' published standard USD registration prices:
 *  - AWS (aws.amazon.com/certification): Foundational $100, Associate $150,
 *    Professional and Specialty $300.
 *  - Microsoft (learn.microsoft.com/credentials): Fundamentals $99,
 *    role-based Associate/Expert $165 (US pricing; varies by country).
 *  - Google Cloud (cloud.google.com/learn/certification): Cloud Digital
 *    Leader $99, Associate Cloud Engineer $125, Professional $200.
 *
 * Study-hour figures are typical preparation estimates for someone with some
 * IT background, in line with the providers' own "recommended experience"
 * guidance and mainstream course syllabi — they are planning inputs, not
 * guarantees.
 */

export const PROVIDERS = [
  { id: "aws", label: "AWS" },
  { id: "azure", label: "Microsoft Azure" },
  { id: "gcp", label: "Google Cloud" },
];

export const ROLES = [
  { id: "architect", label: "Solutions Architect" },
  { id: "developer", label: "Developer" },
  { id: "devops", label: "DevOps / SRE" },
  { id: "data", label: "Data Engineer" },
  { id: "security", label: "Security Engineer" },
];

/** level: foundational | associate | professional (used for ordering and colour). */
export const CERTIFICATIONS = {
  // AWS — fees per aws.amazon.com/certification.
  "aws-clf": { name: "AWS Certified Cloud Practitioner", code: "CLF-C02", level: "foundational", feeUsd: 100, studyHours: 25 },
  "aws-saa": { name: "AWS Certified Solutions Architect – Associate", code: "SAA-C03", level: "associate", feeUsd: 150, studyHours: 70 },
  "aws-dva": { name: "AWS Certified Developer – Associate", code: "DVA-C02", level: "associate", feeUsd: 150, studyHours: 65 },
  "aws-soa": { name: "AWS Certified SysOps Administrator – Associate", code: "SOA-C02", level: "associate", feeUsd: 150, studyHours: 70 },
  "aws-dea": { name: "AWS Certified Data Engineer – Associate", code: "DEA-C01", level: "associate", feeUsd: 150, studyHours: 75 },
  "aws-sap": { name: "AWS Certified Solutions Architect – Professional", code: "SAP-C02", level: "professional", feeUsd: 300, studyHours: 100 },
  "aws-dop": { name: "AWS Certified DevOps Engineer – Professional", code: "DOP-C02", level: "professional", feeUsd: 300, studyHours: 100 },
  "aws-scs": { name: "AWS Certified Security – Specialty", code: "SCS-C02", level: "professional", feeUsd: 300, studyHours: 90 },

  // Azure — US pricing per learn.microsoft.com/credentials.
  "az-900": { name: "Azure Fundamentals", code: "AZ-900", level: "foundational", feeUsd: 99, studyHours: 20 },
  "az-104": { name: "Azure Administrator Associate", code: "AZ-104", level: "associate", feeUsd: 165, studyHours: 70 },
  "az-204": { name: "Azure Developer Associate", code: "AZ-204", level: "associate", feeUsd: 165, studyHours: 70 },
  "az-305": { name: "Azure Solutions Architect Expert", code: "AZ-305", level: "professional", feeUsd: 165, studyHours: 90 },
  "az-400": { name: "Azure DevOps Engineer Expert", code: "AZ-400", level: "professional", feeUsd: 165, studyHours: 85 },
  "az-500": { name: "Azure Security Engineer Associate", code: "AZ-500", level: "associate", feeUsd: 165, studyHours: 75 },
  "dp-700": { name: "Fabric Data Engineer Associate", code: "DP-700", level: "associate", feeUsd: 165, studyHours: 75 },

  // Google Cloud — fees per cloud.google.com/learn/certification.
  "gcp-cdl": { name: "Cloud Digital Leader", code: "CDL", level: "foundational", feeUsd: 99, studyHours: 20 },
  "gcp-ace": { name: "Associate Cloud Engineer", code: "ACE", level: "associate", feeUsd: 125, studyHours: 60 },
  "gcp-pca": { name: "Professional Cloud Architect", code: "PCA", level: "professional", feeUsd: 200, studyHours: 100 },
  "gcp-pcd": { name: "Professional Cloud Developer", code: "PCD", level: "professional", feeUsd: 200, studyHours: 90 },
  "gcp-pde": { name: "Professional Data Engineer", code: "PDE", level: "professional", feeUsd: 200, studyHours: 100 },
  "gcp-pdo": { name: "Professional Cloud DevOps Engineer", code: "PCDOE", level: "professional", feeUsd: 200, studyHours: 90 },
  "gcp-pse": { name: "Professional Cloud Security Engineer", code: "PCSE", level: "professional", feeUsd: 200, studyHours: 90 },
};

/**
 * Recommended sequences, easiest to hardest. Azure's AZ-305 officially
 * requires an associate-level prerequisite (AZ-104) to earn the Expert badge,
 * and AZ-400 requires AZ-104 or AZ-204 — those orderings are preserved here.
 */
export const PATHS = {
  aws: {
    architect: ["aws-clf", "aws-saa", "aws-sap"],
    developer: ["aws-clf", "aws-dva", "aws-dop"],
    devops: ["aws-clf", "aws-soa", "aws-dop"],
    data: ["aws-clf", "aws-dea", "aws-sap"],
    security: ["aws-clf", "aws-saa", "aws-scs"],
  },
  azure: {
    architect: ["az-900", "az-104", "az-305"],
    developer: ["az-900", "az-204", "az-400"],
    devops: ["az-900", "az-104", "az-400"],
    data: ["az-900", "dp-700"],
    security: ["az-900", "az-104", "az-500"],
  },
  gcp: {
    architect: ["gcp-cdl", "gcp-ace", "gcp-pca"],
    developer: ["gcp-cdl", "gcp-ace", "gcp-pcd"],
    devops: ["gcp-cdl", "gcp-ace", "gcp-pdo"],
    data: ["gcp-cdl", "gcp-ace", "gcp-pde"],
    security: ["gcp-cdl", "gcp-ace", "gcp-pse"],
  },
};

/** Sensible bounds for sustained weekly study alongside a job. */
export const MIN_HOURS_PER_WEEK = 1;
export const MAX_HOURS_PER_WEEK = 40;

/**
 * Build the ordered plan with per-cert weeks and cumulative timeline.
 *
 * @param {object} input
 * @param {string} input.provider            One of PROVIDERS ids.
 * @param {string} input.role                One of ROLES ids.
 * @param {number} input.hoursPerWeek        Sustainable study hours per week.
 * @param {boolean} input.includeFundamentals Skip the foundational cert if false.
 * @returns {{error:string}|object}
 */
export function planCertificationPath({
  provider,
  role,
  hoursPerWeek,
  includeFundamentals = true,
}) {
  if (!PROVIDERS.some((item) => item.id === provider)) {
    return { error: "Pick a cloud provider from the list." };
  }
  if (!ROLES.some((item) => item.id === role)) {
    return { error: "Pick a target role from the list." };
  }
  const hours = Number(hoursPerWeek);
  if (!Number.isFinite(hours) || hours < MIN_HOURS_PER_WEEK || hours > MAX_HOURS_PER_WEEK) {
    return { error: `Study hours per week must be between ${MIN_HOURS_PER_WEEK} and ${MAX_HOURS_PER_WEEK}.` };
  }

  const ids = PATHS[provider][role].filter(
    (id) => includeFundamentals || CERTIFICATIONS[id].level !== "foundational",
  );
  if (ids.length === 0) {
    return { error: "This path has no exams left after skipping fundamentals." };
  }

  let weekCursor = 0;
  const steps = ids.map((id, index) => {
    const cert = CERTIFICATIONS[id];
    const weeks = Math.ceil(cert.studyHours / hours);
    const startWeek = weekCursor + 1;
    weekCursor += weeks;
    return {
      order: index + 1,
      id,
      name: cert.name,
      code: cert.code,
      level: cert.level,
      feeUsd: cert.feeUsd,
      studyHours: cert.studyHours,
      weeks,
      startWeek,
      examWeek: weekCursor,
    };
  });

  const totalHours = steps.reduce((sum, step) => sum + step.studyHours, 0);
  const totalFeesUsd = steps.reduce((sum, step) => sum + step.feeUsd, 0);

  return {
    steps,
    totalHours,
    totalFeesUsd,
    totalWeeks: weekCursor,
    totalMonths: Math.round((weekCursor / 4.345) * 10) / 10, // 52.14 weeks / 12 months
  };
}
