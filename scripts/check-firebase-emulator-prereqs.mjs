import { spawnSync } from "node:child_process";

const java = spawnSync("java", ["-version"], {
  encoding: "utf8",
});

if (java.status !== 0) {
  const stderr = java.stderr?.trim();
  const detail = stderr ? `\n\njava -version output:\n${stderr}` : "";

  console.error(
    `Firebase emulator tests require a Java runtime on PATH. Install Java 17+ and rerun the emulator command.${detail}`,
  );
  process.exit(1);
}

const versionOutput = `${java.stderr || ""}${java.stdout || ""}`.trim();
console.log(`Firebase emulator prerequisite check passed: ${versionOutput.split("\n")[0]}`);
