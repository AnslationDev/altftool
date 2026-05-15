import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";

const report = await createFirebaseLiveDataReport({
  env: process.env,
  timeoutMs: 8000,
});

if (!report.ok) {
  console.error("Firebase live data check failed:");
  for (const failure of report.failures) console.error(`- ${failure}`);
  console.error(JSON.stringify({ projectId: report.projectId, ...report.sections }, null, 2));
  process.exit(1);
}

console.log("Firebase live data check passed.");
console.log(JSON.stringify({ projectId: report.projectId, ...report.sections }, null, 2));
