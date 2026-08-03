/**
 * "This provider has no credentials on this deployment" — the one failure
 * mode in src/lib/providers/ that is not an upstream outage.
 *
 * It matters that the two stay distinguishable. A provider that is down
 * deserves a 502 and a retry; a provider that was never configured will
 * fail identically on every request forever, and a red "Couldn't load…"
 * error box is the wrong thing to show a visitor for it. Routes use
 * `isProviderNotConfigured` to answer 200 with an empty, honestly labelled
 * payload instead — never a 5xx, and never substitute data.
 */

export const PROVIDER_NOT_CONFIGURED = "PROVIDER_NOT_CONFIGURED";

/**
 * Reads a required server-side API key, throwing a tagged error when it is
 * absent. The message is what a visitor may end up reading, so it says what
 * is true — the list has no live source right now — and never names the
 * environment variable.
 *
 * @param {string} envVar - e.g. "GEOAPIFY_API_KEY"
 * @param {string} provider - human label, e.g. "Geoapify"
 */
export function requireProviderKey(envVar, provider) {
  const value = process.env[envVar];
  if (!value) {
    const error = new Error(`${provider} is not connected on this deployment, so this list has no live data.`);
    error.code = PROVIDER_NOT_CONFIGURED;
    error.envVar = envVar;
    error.provider = provider;
    throw error;
  }
  return value;
}

export function requireProviderApproval(envVar, provider) {
  if (process.env[envVar] !== "true") {
    const error = new Error(`${provider} is not enabled on this deployment, so this list has no live data.`);
    error.code = PROVIDER_NOT_CONFIGURED;
    error.envVar = envVar;
    error.provider = provider;
    throw error;
  }
}

export function isProviderNotConfigured(error) {
  return error?.code === PROVIDER_NOT_CONFIGURED;
}
