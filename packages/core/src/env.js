export class MissingEnvError extends Error {
  constructor(name) {
    super(`${name} is not configured.`);
    this.name = "MissingEnvError";
    this.status = 500;
    this.envName = name;
  }
}

export function getServerEnv(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function requireServerEnv(name) {
  const value = getServerEnv(name);
  if (!value) throw new MissingEnvError(name);
  return value;
}

export function requireServerEnvGroup(names, label = "Required environment variables") {
  const values = {};
  const missing = [];

  for (const name of names) {
    const value = getServerEnv(name);
    if (!value) missing.push(name);
    else values[name] = value;
  }

  if (missing.length) {
    const error = new MissingEnvError(missing.join(", "));
    error.message = `${label} missing: ${missing.join(", ")}.`;
    error.missing = missing;
    throw error;
  }

  return values;
}
