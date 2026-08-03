import { writeFileSync } from "node:fs";

const allowedEnvironmentName =
  /^(?:ALTFT_|CRON_SECRET$|FIREBASE_|GEMINI_API_KEY$|GSC_|NEXT_PUBLIC_|OPENAI_|YOUTUBE_API_KEY$|ADZUNA_|ALPHA_VANTAGE_API_KEY$|LINKPREVIEW_API_KEY$|PAGESPEED_API_KEY$|METAL_PRICE_API_KEY$|REMOVE_BG_API_KEY$|PLANT_ID_API_KEY$|RAPIDAPI_KEY$|RESEND_API_KEY$|CONTACT_FROM_EMAIL$|SECURITY_IP_ENC_KEY$|SEED_ADMIN_PASSWORD$|GEOAPIFY_API_KEY$|FOURSQUARE_API_KEY$|COINCAP_API_KEY$|CAT_API_KEY$|API_NINJAS_KEY$|PRODUCTHUNT_API_KEY$|PRODUCTHUNT_API_SECRET$)/;

const lines = Object.entries(process.env)
  .filter(
    ([name, value]) =>
      allowedEnvironmentName.test(name) && typeof value === "string",
  )
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, value]) => `${name}=${JSON.stringify(String(value))}`);

writeFileSync(".env.production", `${lines.join("\n")}\n`, { mode: 0o600 });
console.log(
  `[amplify-env] Wrote ${lines.length} allowlisted variables to .env.production.`,
);
