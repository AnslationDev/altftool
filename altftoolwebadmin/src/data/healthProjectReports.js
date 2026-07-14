const PROJECT_SEEDS = [
  ["altftool", "AltFTool", "AT", "AI marketing platform", "Production", "Aarav Mehta", 10, 11, 1, 0, 99, 97, 98, 99, 98, 99.99, 118, 0.04, "2h ago", "4 min ago", [86, 88, 87, 90, 92, 93, 95, 94, 96, 97, 96, 98]],
  ["leadtree", "LeadTree", "LT", "Lead management CRM", "Production", "Anika Rao", 9, 10, 2, 1, 95, 93, 94, 96, 92, 99.92, 164, 0.11, "6h ago", "6 min ago", [78, 81, 80, 83, 85, 84, 88, 87, 89, 91, 90, 92]],
  ["carrerbook", "CareerBook", "CB", "Career platform", "Production", "Vikram Shah", 7, 10, 8, 2, 82, 78, 84, 80, 76, 99.64, 286, 0.41, "1d ago", "2 min ago", [81, 79, 78, 76, 75, 77, 74, 73, 75, 72, 74, 73]],
  ["myluckydeal", "My Lucky Deal", "ML", "Deals and campaigns", "Production", "Priya Nair", 9, 11, 4, 1, 91, 88, 90, 93, 87, 99.87, 193, 0.17, "8h ago", "8 min ago", [79, 81, 80, 83, 82, 85, 87, 86, 89, 88, 90, 89]],
  ["anternet", "Anternet", "AN", "Consumer app", "Staging", "Ish Kumar", 6, 10, 11, 3, 72, 68, 75, 71, 73, 99.31, 421, 0.82, "1d ago", "3 min ago", [66, 68, 65, 69, 67, 64, 63, 66, 62, 65, 67, 64]],
  ["growvibe", "GrowVibe", "GV", "Growth and analytics", "Production", "Naina Gupta", 3, 10, 19, 5, 48, 44, 53, 57, 51, 98.42, 782, 2.13, "2d ago", "1 min ago", [56, 54, 58, 52, 49, 51, 45, 47, 43, 46, 42, 44]],
  ["pharmaplus", "PharmaPlus", "PH", "Healthcare platform", "Production", "Riya Sen", 8, 10, 5, 1, 93, 89, 92, 95, 91, 99.96, 141, 0.08, "4h ago", "9 min ago", [75, 77, 79, 78, 80, 82, 81, 85, 84, 86, 87, 88]],
  ["eventhive", "EventHive", "EH", "Event management", "Development", "Karan Kapoor", 7, 10, 7, 2, 84, 79, 86, 82, 80, 99.55, 318, 0.57, "3d ago", "7 min ago", [71, 73, 70, 75, 74, 76, 73, 77, 78, 75, 79, 77]],
  ["finpilot", "FinPilot", "FP", "Finance operations", "Production", "Meera Joshi", 10, 11, 2, 0, 97, 96, 95, 98, 94, 99.98, 109, 0.03, "3h ago", "5 min ago", [88, 89, 91, 90, 93, 92, 94, 95, 93, 96, 95, 97]],
  ["learnsphere", "LearnSphere", "LS", "Learning platform", "Staging", "Dev Patel", 8, 11, 6, 2, 89, 85, 88, 91, 84, 99.72, 241, 0.34, "12h ago", "11 min ago", [74, 76, 75, 79, 77, 80, 78, 81, 82, 79, 83, 81]],
  ["retailflow", "RetailFlow", "RF", "Commerce operations", "Production", "Sana Khan", 9, 11, 3, 1, 94, 91, 93, 96, 90, 99.91, 174, 0.12, "5h ago", "12 min ago", [80, 82, 83, 81, 85, 86, 84, 87, 88, 86, 89, 90]],
  ["civicpulse", "CivicPulse", "CP", "Community services", "Development", "Arjun Das", 6, 10, 10, 3, 76, 71, 79, 74, 72, 99.28, 452, 0.91, "2d ago", "10 min ago", [63, 61, 65, 62, 66, 64, 67, 63, 68, 66, 69, 67]],
  ["medialoom", "MediaLoom", "MM", "Media workflow", "Production", "Tanya Bose", 8, 10, 6, 1, 90, 87, 91, 89, 86, 99.79, 211, 0.22, "10h ago", "14 min ago", [72, 74, 76, 75, 78, 77, 80, 79, 82, 80, 83, 84]],
  ["supplysync", "SupplySync", "SS", "Supply chain", "Staging", "Rohan Verma", 5, 10, 13, 4, 69, 65, 72, 70, 68, 98.93, 518, 1.28, "1d ago", "13 min ago", [59, 61, 58, 62, 60, 57, 63, 61, 64, 60, 62, 59]],
  ["travelnest", "TravelNest", "TN", "Travel marketplace", "Production", "Ira Malhotra", 9, 10, 4, 1, 92, 90, 94, 91, 89, 99.88, 187, 0.15, "7h ago", "15 min ago", [76, 78, 79, 77, 81, 80, 83, 82, 85, 84, 86, 85]],
  ["studiosuite", "StudioSuite", "ST", "Creative workspace", "Development", "Kabir Singh", 7, 11, 9, 2, 85, 81, 83, 87, 79, 99.48, 356, 0.62, "18h ago", "16 min ago", [69, 72, 70, 74, 71, 75, 73, 76, 74, 78, 75, 77]],
];

export const HEALTH_SCORE_WEIGHTS = [
  ["Release gates", 20], ["Security", 20], ["Performance", 15], ["API health", 10],
  ["Database health", 10], ["Storage health", 5], ["Open issues", 10], ["Failed checks", 5], ["Uptime", 5],
];

export function getHealthStatus(score) {
  if (score >= 95) return { label: "Excellent", tone: "success" };
  if (score >= 80) return { label: "Healthy", tone: "success" };
  if (score >= 60) return { label: "Warning", tone: "warning" };
  if (score >= 40) return { label: "Poor", tone: "warning" };
  return { label: "Critical", tone: "danger" };
}

function calculateScore({ releasePassed, releaseTotal, openIssues, failedChecks, security, performance, api, database, storage, uptime }) {
  const issueScore = Math.max(0, 100 - openIssues * 4);
  const failedScore = Math.max(0, 100 - failedChecks * 12);
  return Math.round((releasePassed / releaseTotal) * 20 + security * 0.2 + performance * 0.15 + api * 0.1 + database * 0.1 + storage * 0.05 + issueScore * 0.1 + failedScore * 0.05 + uptime * 0.05);
}

export const HEALTH_PROJECT_REPORTS = PROJECT_SEEDS.map(([id, name, initials, type, environment, admin, releasePassed, releaseTotal, openIssues, failedChecks, security, performance, api, database, storage, uptime, responseTime, errorRate, lastDeployment, lastScan, trend], index) => {
  const score = calculateScore({ releasePassed, releaseTotal, openIssues, failedChecks, security, performance, api, database, storage, uptime });
  return {
    id, name, initials, type, environment, admin, releasePassed, releaseTotal, openIssues, failedChecks, security, performance, api, database, storage, uptime, responseTime, errorRate, lastDeployment, lastScan, trend, score,
    status: getHealthStatus(score),
    timeline: [
      { label: "Health scan completed", detail: `${score}/100 overall health score`, time: lastScan },
      { label: "API availability checked", detail: `${api}% API health, ${responseTime}ms response time`, time: `${index + 4} min ago` },
      { label: "Security scan completed", detail: `${security}% security score`, time: `${index + 1}h ago` },
      { label: "Deployment recorded", detail: `Production release completed ${lastDeployment}`, time: lastDeployment },
    ],
  };
});
