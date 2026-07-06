// ALTF Engine — Content Automation: model client.
// Kept as a thin re-export so existing imports keep working; the actual
// multi-provider implementation lives in ./providers.js (OpenAI default).

export { generateJson, estimateCostUsd, PROVIDERS, PROVIDER_KEYS } from "./providers";
